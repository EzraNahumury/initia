// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockERC20} from "./mocks/MockERC20.sol";

/// @title TokenFaucet — faucet + swap for testnet tokens
contract TokenFaucet {
    MockERC20 public immutable initToken;
    MockERC20 public immutable usdcToken;
    MockERC20 public immutable wethToken;
    MockERC20 public immutable tiaToken;
    MockERC20 public immutable idrxToken;

    address public owner;
    uint256 public constant CLAIM_FEE = 1000 ether;

    uint256 public constant INIT_AMOUNT = 10_000 * 1e18;
    uint256 public constant USDC_AMOUNT = 10_000 * 1e6;
    uint256 public constant WETH_AMOUNT = 5 * 1e18;
    uint256 public constant TIA_AMOUNT  = 10_000 * 1e6;
    uint256 public constant IDRX_AMOUNT = 100_000_000 * 1e2;

    // Price in USD (6 decimals). E.g. INIT = $0.985 → 985000
    mapping(address => uint256) public priceUSD;

    event TokensClaimed(address indexed user, address indexed token, uint256 amount);
    event Swapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor() {
        owner = msg.sender;
        initToken = new MockERC20("Initia", "INIT", 18);
        usdcToken = new MockERC20("USD Coin", "USDC", 6);
        wethToken = new MockERC20("Wrapped Ether", "WETH", 18);
        tiaToken  = new MockERC20("Celestia", "TIA", 6);
        idrxToken = new MockERC20("IDRX Stablecoin", "IDRX", 2);

        // Set USD prices (6 decimals)
        priceUSD[address(initToken)] = 985000;      // $0.985
        priceUSD[address(usdcToken)] = 1000000;     // $1.00
        priceUSD[address(wethToken)] = 1893000000;  // $1893
        priceUSD[address(tiaToken)]  = 1036000;     // $1.036
        priceUSD[address(idrxToken)] = 62;          // $0.000062
    }

    /// @notice Mint a single token — costs 1000 GAS
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

    /// @notice Swap tokenIn for tokenOut based on USD prices
    /// No approval needed — uses mint/burn model
    uint256 public constant SWAP_FEE = 500 ether; // 500 GAS

    function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable {
        require(msg.value >= SWAP_FEE, "Send 500 GAS");
        require(amountIn > 0, "Amount = 0");
        require(priceUSD[tokenIn] > 0 && priceUSD[tokenOut] > 0, "Unknown token");
        require(tokenIn != tokenOut, "Same token");

        // Burn input tokens (no approval needed — faucet is the minter)
        MockERC20(tokenIn).burnFrom(msg.sender, amountIn);

        // Calculate output: (amountIn * priceIn / priceOut) adjusted for decimals
        uint8 decIn = MockERC20(tokenIn).decimals();
        uint8 decOut = MockERC20(tokenOut).decimals();

        // Normalize to 18 decimals, apply rate, then scale to output decimals
        // amountOut = amountIn * priceIn / priceOut * 10^decOut / 10^decIn * 0.997 (0.3% fee)
        uint256 amountOut = (amountIn * priceUSD[tokenIn] * (10 ** decOut) * 997) /
                            (priceUSD[tokenOut] * (10 ** decIn) * 1000);

        require(amountOut > 0, "Output too small");

        // Mint output to user
        MockERC20(tokenOut).mint(msg.sender, amountOut);

        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }

    function getTokens() external view returns (
        address, address, address, address, address
    ) {
        return (
            address(initToken), address(usdcToken),
            address(wethToken), address(tiaToken), address(idrxToken)
        );
    }

    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256) {
        if (amountIn == 0 || priceUSD[tokenIn] == 0 || priceUSD[tokenOut] == 0) return 0;
        uint8 decIn = MockERC20(tokenIn).decimals();
        uint8 decOut = MockERC20(tokenOut).decimals();
        return (amountIn * priceUSD[tokenIn] * (10 ** decOut) * 997) /
               (priceUSD[tokenOut] * (10 ** decIn) * 1000);
    }
}
