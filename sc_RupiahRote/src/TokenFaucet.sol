// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockERC20} from "./mocks/MockERC20.sol";

/// @title TokenFaucet — faucet + swap + limit orders for testnet
contract TokenFaucet {
    MockERC20 public immutable initToken;
    MockERC20 public immutable usdcToken;
    MockERC20 public immutable wethToken;
    MockERC20 public immutable tiaToken;
    MockERC20 public immutable idrxToken;

    address public owner;
    uint256 public constant CLAIM_FEE = 1000 ether;
    uint256 public constant SWAP_FEE = 500 ether;
    uint256 public constant LIMIT_FEE = 500 ether;

    uint256 public constant INIT_AMOUNT = 10_000 * 1e18;
    uint256 public constant USDC_AMOUNT = 10_000 * 1e6;
    uint256 public constant WETH_AMOUNT = 5 * 1e18;
    uint256 public constant TIA_AMOUNT  = 10_000 * 1e6;
    uint256 public constant IDRX_AMOUNT = 100_000_000 * 1e2;

    mapping(address => uint256) public priceUSD;

    // ── Limit Orders ──
    struct LimitOrder {
        address owner;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 targetPrice; // min output in tokenOut smallest unit
        uint256 expiry;
        bool executed;
        bool cancelled;
    }

    LimitOrder[] public orders;
    mapping(address => uint256[]) public userOrderIds;
    uint256 public orderCount;

    // ── Events ──
    event TokensClaimed(address indexed user, address indexed token, uint256 amount);
    event Swapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event LimitOrderPlaced(uint256 indexed orderId, address indexed owner, address tokenIn, address tokenOut, uint256 amountIn, uint256 targetPrice, uint256 expiry);
    event LimitOrderExecuted(uint256 indexed orderId, uint256 amountOut);
    event LimitOrderCancelled(uint256 indexed orderId);

    constructor() {
        owner = msg.sender;
        initToken = new MockERC20("Initia", "INIT", 18);
        usdcToken = new MockERC20("USD Coin", "USDC", 6);
        wethToken = new MockERC20("Wrapped Ether", "WETH", 18);
        tiaToken  = new MockERC20("Celestia", "TIA", 6);
        idrxToken = new MockERC20("IDRX Stablecoin", "IDRX", 2);

        priceUSD[address(initToken)] = 985000;
        priceUSD[address(usdcToken)] = 1000000;
        priceUSD[address(wethToken)] = 1893000000;
        priceUSD[address(tiaToken)]  = 1036000;
        priceUSD[address(idrxToken)] = 62;
    }

    // ── Faucet ──

    function claimToken(address token) external payable {
        require(msg.value >= CLAIM_FEE, "Send 1000 GAS");
        uint256 amount;
        if (token == address(initToken)) { amount = INIT_AMOUNT; }
        else if (token == address(usdcToken)) { amount = USDC_AMOUNT; }
        else if (token == address(wethToken)) { amount = WETH_AMOUNT; }
        else if (token == address(tiaToken))  { amount = TIA_AMOUNT; }
        else if (token == address(idrxToken)) { amount = IDRX_AMOUNT; }
        else { revert("Unknown token"); }
        MockERC20(token).mint(msg.sender, amount);
        emit TokensClaimed(msg.sender, token, amount);
    }

    // ── Swap ──

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable {
        require(msg.value >= SWAP_FEE, "Send 500 GAS");
        require(amountIn > 0, "Amount = 0");
        require(priceUSD[tokenIn] > 0 && priceUSD[tokenOut] > 0, "Unknown token");
        require(tokenIn != tokenOut, "Same token");

        MockERC20(tokenIn).burnFrom(msg.sender, amountIn);

        uint256 amountOut = _calcOutput(tokenIn, tokenOut, amountIn);
        require(amountOut > 0, "Output too small");

        MockERC20(tokenOut).mint(msg.sender, amountOut);
        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ── Limit Orders ──

    function placeLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 targetPrice,
        uint256 expiryHours
    ) external payable {
        require(msg.value >= LIMIT_FEE, "Send 500 GAS");
        require(amountIn > 0, "Amount = 0");
        require(targetPrice > 0, "Target = 0");
        require(tokenIn != tokenOut, "Same token");
        require(priceUSD[tokenIn] > 0 && priceUSD[tokenOut] > 0, "Unknown token");

        // Burn input tokens (locked in order)
        MockERC20(tokenIn).burnFrom(msg.sender, amountIn);

        uint256 expiry = block.timestamp + (expiryHours * 1 hours);
        uint256 orderId = orders.length;

        orders.push(LimitOrder({
            owner: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            targetPrice: targetPrice,
            expiry: expiry,
            executed: false,
            cancelled: false
        }));

        userOrderIds[msg.sender].push(orderId);
        orderCount++;

        emit LimitOrderPlaced(orderId, msg.sender, tokenIn, tokenOut, amountIn, targetPrice, expiry);
    }

    function executeLimitOrder(uint256 orderId) external {
        require(orderId < orders.length, "Invalid order");
        LimitOrder storage order = orders[orderId];
        require(!order.executed && !order.cancelled, "Already done");
        require(block.timestamp <= order.expiry, "Order expired");

        // Check if current output meets target
        uint256 amountOut = _calcOutput(order.tokenIn, order.tokenOut, order.amountIn);
        require(amountOut >= order.targetPrice, "Price not reached");

        MockERC20(order.tokenOut).mint(order.owner, amountOut);
        order.executed = true;

        emit LimitOrderExecuted(orderId, amountOut);
    }

    function cancelLimitOrder(uint256 orderId) external {
        require(orderId < orders.length, "Invalid order");
        LimitOrder storage order = orders[orderId];
        require(msg.sender == order.owner, "Not owner");
        require(!order.executed && !order.cancelled, "Already done");

        // Refund input tokens
        MockERC20(order.tokenIn).mint(order.owner, order.amountIn);
        order.cancelled = true;

        emit LimitOrderCancelled(orderId);
    }

    // ── Views ──

    function getUserOrderCount(address user) external view returns (uint256) {
        return userOrderIds[user].length;
    }

    function getUserOrderId(address user, uint256 index) external view returns (uint256) {
        return userOrderIds[user][index];
    }

    function getOrder(uint256 orderId) external view returns (
        address _owner, address _tokenIn, address _tokenOut,
        uint256 _amountIn, uint256 _targetPrice, uint256 _expiry,
        bool _executed, bool _cancelled
    ) {
        LimitOrder storage o = orders[orderId];
        return (o.owner, o.tokenIn, o.tokenOut, o.amountIn, o.targetPrice, o.expiry, o.executed, o.cancelled);
    }

    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256) {
        return _calcOutput(tokenIn, tokenOut, amountIn);
    }

    function getTokens() external view returns (address, address, address, address, address) {
        return (address(initToken), address(usdcToken), address(wethToken), address(tiaToken), address(idrxToken));
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }

    // ── Internal ──

    function _calcOutput(address tokenIn, address tokenOut, uint256 amountIn) internal view returns (uint256) {
        if (amountIn == 0 || priceUSD[tokenIn] == 0 || priceUSD[tokenOut] == 0) return 0;
        uint8 decIn = MockERC20(tokenIn).decimals();
        uint8 decOut = MockERC20(tokenOut).decimals();
        return (amountIn * priceUSD[tokenIn] * (10 ** decOut) * 997) /
               (priceUSD[tokenOut] * (10 ** decIn) * 1000);
    }
}
