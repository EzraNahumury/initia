// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {ICosmos} from "./interfaces/ICosmos.sol";
import {IConnectOracle} from "./interfaces/IConnectOracle.sol";

/// @title RupiahRouter - Smart DeFi Router on Initia
/// @notice AMM + Routing Engine + Limit Orders + Batch Swap in one unified contract
/// @dev Runs on Initia MiniEVM appchain (L2) with Cosmos precompile integrations
contract RupiahRouter {
    // ========== CONSTANTS ==========

    ICosmos public constant COSMOS = ICosmos(0x00000000000000000000000000000000000000f1);
    IConnectOracle public constant ORACLE = IConnectOracle(0x031ECb63480983FD216D17BB6e1d393f3816b72F);

    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant LIMIT_ORDER_EXEC_FEE = 10; // 0.1% = 10 basis points
    uint256 public constant MAX_HOPS = 3;

    // ========== DATA STRUCTURES ==========

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLpSupply;
        uint256 swapFeeRate; // basis points, default 30 = 0.3%
        bool exists;
    }

    struct Route {
        uint8 routeType;    // 0=direct, 1=multiHop, 2=crossChain
        address[] path;     // token addresses in order
        uint256[] poolIds;  // pools to use at each hop
        uint256 amountIn;   // input amount
        uint256 expectedOut;
        uint256 estimatedGas;
    }

    struct LimitOrder {
        address owner;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 targetPrice; // min output per input (scaled 1e18)
        uint256 expiry;
        bool executed;
        bool cancelled;
    }

    struct BatchSwapParam {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minOut;
    }

    // ========== STATE ==========

    address public owner;

    uint256 public poolCount;
    mapping(uint256 => Pool) public pools;
    mapping(uint256 => mapping(address => uint256)) public lpBalances;
    // tokenA => tokenB => poolId (always stored with lower address first)
    mapping(address => mapping(address => uint256)) internal _pairToPool;

    uint256 public orderCount;
    mapping(uint256 => LimitOrder) public orders;
    mapping(address => uint256[]) internal _userOrders;

    // Track total swaps and savings per user (for dashboard)
    mapping(address => uint256) public userSwapCount;
    mapping(address => uint256) public userTotalSavings;

    // ========== EVENTS ==========

    event PoolCreated(
        uint256 indexed poolId, address tokenA, address tokenB,
        uint256 amountA, uint256 amountB, address indexed creator
    );
    event LiquidityAdded(
        uint256 indexed poolId, address indexed provider,
        uint256 amountA, uint256 amountB, uint256 lpTokens
    );
    event LiquidityRemoved(
        uint256 indexed poolId, address indexed provider,
        uint256 amountA, uint256 amountB, uint256 lpTokens
    );
    event Swapped(
        uint256 indexed poolId, address indexed user,
        address tokenIn, uint256 amountIn, uint256 amountOut
    );
    event RouteExecuted(
        address indexed user, uint8 routeType,
        address tokenIn, address tokenOut,
        uint256 amountIn, uint256 amountOut, uint256 savings
    );
    event LimitOrderPlaced(
        uint256 indexed orderId, address indexed owner,
        address tokenIn, address tokenOut,
        uint256 amountIn, uint256 targetPrice, uint256 expiry
    );
    event LimitOrderExecuted(uint256 indexed orderId, address indexed executor, uint256 amountOut);
    event LimitOrderCancelled(uint256 indexed orderId);
    event BatchSwapExecuted(address indexed user, uint256 swapCount, uint256 totalGasSaved);
    event SentToUsername(address indexed sender, string username, address token, uint256 amount);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "RR: not owner");
        _;
    }

    modifier validDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, "RR: expired");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
    }

    // ================================================================
    //                        AMM ENGINE (x * y = k)
    // ================================================================

    /// @notice Create a new liquidity pool for a token pair
    /// @param tokenA First token address
    /// @param tokenB Second token address
    /// @param amountA Amount of tokenA to seed
    /// @param amountB Amount of tokenB to seed
    /// @return poolId The ID of the created pool
    function createPool(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external returns (uint256 poolId) {
        require(tokenA != tokenB, "RR: identical tokens");
        require(amountA > 0 && amountB > 0, "RR: zero amount");

        // Normalize: lower address = tokenA
        (address token0, address token1, uint256 amount0, uint256 amount1) = _sortTokens(tokenA, tokenB, amountA, amountB);
        require(_pairToPool[token0][token1] == 0, "RR: pool exists");

        // Transfer tokens in
        _safeTransferFrom(token0, msg.sender, address(this), amount0);
        _safeTransferFrom(token1, msg.sender, address(this), amount1);

        // Mint initial LP tokens (sqrt(x*y) - MINIMUM_LIQUIDITY)
        uint256 lpTokens = _sqrt(amount0 * amount1);
        require(lpTokens > MINIMUM_LIQUIDITY, "RR: insufficient initial liquidity");
        lpTokens -= MINIMUM_LIQUIDITY; // lock minimum liquidity forever

        poolCount++;
        poolId = poolCount;

        pools[poolId] = Pool({
            tokenA: token0,
            tokenB: token1,
            reserveA: amount0,
            reserveB: amount1,
            totalLpSupply: lpTokens + MINIMUM_LIQUIDITY,
            swapFeeRate: 30,
            exists: true
        });

        _pairToPool[token0][token1] = poolId;
        lpBalances[poolId][msg.sender] = lpTokens;

        emit PoolCreated(poolId, token0, token1, amount0, amount1, msg.sender);
    }

    /// @notice Add liquidity to an existing pool
    /// @param poolId Pool to add liquidity to
    /// @param amountA Desired amount of tokenA
    /// @param amountB Desired amount of tokenB
    /// @return lpTokens Amount of LP tokens minted
    function addLiquidity(
        uint256 poolId,
        uint256 amountA,
        uint256 amountB
    ) external returns (uint256 lpTokens) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "RR: pool not found");
        require(amountA > 0 && amountB > 0, "RR: zero amount");

        // Calculate proportional amounts to maintain price ratio
        uint256 optimalB = (amountA * pool.reserveB) / pool.reserveA;
        uint256 actualA;
        uint256 actualB;

        if (optimalB <= amountB) {
            actualA = amountA;
            actualB = optimalB;
        } else {
            uint256 optimalA = (amountB * pool.reserveA) / pool.reserveB;
            actualA = optimalA;
            actualB = amountB;
        }

        require(actualA > 0 && actualB > 0, "RR: insufficient amounts");

        _safeTransferFrom(pool.tokenA, msg.sender, address(this), actualA);
        _safeTransferFrom(pool.tokenB, msg.sender, address(this), actualB);

        // Mint LP proportional to contribution
        lpTokens = _min(
            (actualA * pool.totalLpSupply) / pool.reserveA,
            (actualB * pool.totalLpSupply) / pool.reserveB
        );
        require(lpTokens > 0, "RR: zero lp");

        pool.reserveA += actualA;
        pool.reserveB += actualB;
        pool.totalLpSupply += lpTokens;
        lpBalances[poolId][msg.sender] += lpTokens;

        emit LiquidityAdded(poolId, msg.sender, actualA, actualB, lpTokens);
    }

    /// @notice Remove liquidity from a pool
    /// @param poolId Pool to remove from
    /// @param lpTokens Amount of LP tokens to burn
    /// @return amountA Token A amount returned
    /// @return amountB Token B amount returned
    function removeLiquidity(
        uint256 poolId,
        uint256 lpTokens
    ) external returns (uint256 amountA, uint256 amountB) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "RR: pool not found");
        require(lpTokens > 0, "RR: zero lp");
        require(lpBalances[poolId][msg.sender] >= lpTokens, "RR: insufficient lp");

        amountA = (lpTokens * pool.reserveA) / pool.totalLpSupply;
        amountB = (lpTokens * pool.reserveB) / pool.totalLpSupply;
        require(amountA > 0 && amountB > 0, "RR: insufficient burn");

        lpBalances[poolId][msg.sender] -= lpTokens;
        pool.totalLpSupply -= lpTokens;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        _safeTransfer(pool.tokenA, msg.sender, amountA);
        _safeTransfer(pool.tokenB, msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, lpTokens);
    }

    /// @notice Swap tokens in a specific pool
    /// @param poolId Pool to swap in
    /// @param tokenIn Input token address
    /// @param amountIn Amount of input token
    /// @param minOut Minimum output amount (slippage protection)
    /// @return amountOut Actual output amount
    function swap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minOut
    ) external returns (uint256 amountOut) {
        amountOut = _executeSwap(poolId, tokenIn, amountIn, minOut, msg.sender);
    }

    // ================================================================
    //                        ROUTING ENGINE
    // ================================================================

    /// @notice Find the best swap route between two tokens
    /// @param tokenIn Input token
    /// @param tokenOut Output token
    /// @param amountIn Amount to swap
    /// @return bestRoute The optimal route found
    function findBestRoute(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (Route memory bestRoute) {
        uint256 bestOutput = 0;

        // === Strategy 1: Direct swap ===
        uint256 directPoolId = getPoolId(tokenIn, tokenOut);
        if (directPoolId != 0) {
            uint256 directOut = getAmountOut(directPoolId, tokenIn, amountIn);
            if (directOut > bestOutput) {
                bestOutput = directOut;

                address[] memory path = new address[](2);
                path[0] = tokenIn;
                path[1] = tokenOut;
                uint256[] memory pIds = new uint256[](1);
                pIds[0] = directPoolId;

                bestRoute = Route({
                    routeType: 0,
                    path: path,
                    poolIds: pIds,
                    amountIn: amountIn,
                    expectedOut: directOut,
                    estimatedGas: 80000
                });
            }
        }

        // === Strategy 2: Multi-hop via intermediate tokens ===
        for (uint256 i = 1; i <= poolCount; i++) {
            Pool storage p = pools[i];
            if (!p.exists) continue;

            // Find pools that contain tokenIn
            address intermediate;
            if (p.tokenA == tokenIn) {
                intermediate = p.tokenB;
            } else if (p.tokenB == tokenIn) {
                intermediate = p.tokenA;
            } else {
                continue;
            }

            if (intermediate == tokenOut) continue; // that's a direct route

            // Check if intermediate -> tokenOut pool exists
            uint256 secondPoolId = getPoolId(intermediate, tokenOut);
            if (secondPoolId == 0) continue;

            uint256 midOut = getAmountOut(i, tokenIn, amountIn);
            if (midOut == 0) continue;

            uint256 finalOut = getAmountOut(secondPoolId, intermediate, midOut);
            if (finalOut > bestOutput) {
                bestOutput = finalOut;

                address[] memory path = new address[](3);
                path[0] = tokenIn;
                path[1] = intermediate;
                path[2] = tokenOut;
                uint256[] memory pIds = new uint256[](2);
                pIds[0] = i;
                pIds[1] = secondPoolId;

                bestRoute = Route({
                    routeType: 1,
                    path: path,
                    poolIds: pIds,
                    amountIn: amountIn,
                    expectedOut: finalOut,
                    estimatedGas: 150000
                });
            }
        }

        require(bestRoute.path.length > 0, "RR: no route found");
    }

    /// @notice Execute a pre-computed route
    /// @param route The route to execute
    /// @param minAmountOut Minimum output (slippage protection)
    /// @param deadline Transaction deadline
    /// @return amountOut Actual output amount
    function executeRoute(
        Route calldata route,
        uint256 minAmountOut,
        uint256 deadline
    ) external validDeadline(deadline) returns (uint256 amountOut) {
        require(route.path.length >= 2, "RR: invalid path");
        require(route.path.length == route.poolIds.length + 1, "RR: path/pool mismatch");
        require(route.amountIn > 0, "RR: zero input");

        amountOut = _multiHopSwapInternal(route.path, route.poolIds, route.amountIn, msg.sender);
        require(amountOut >= minAmountOut, "RR: insufficient output");

        // Calculate savings vs direct route for dashboard
        uint256 savings = 0;
        if (route.routeType == 1) {
            uint256 directPoolId = getPoolId(route.path[0], route.path[route.path.length - 1]);
            if (directPoolId != 0) {
                uint256 directOut = getAmountOut(directPoolId, route.path[0], route.amountIn);
                if (amountOut > directOut) {
                    savings = amountOut - directOut;
                }
            }
        }

        userSwapCount[msg.sender]++;
        userTotalSavings[msg.sender] += savings;

        emit RouteExecuted(
            msg.sender, route.routeType,
            route.path[0], route.path[route.path.length - 1],
            route.amountIn, amountOut, savings
        );
    }

    /// @notice Execute a multi-hop swap through multiple pools
    /// @param path Ordered token addresses [tokenIn, ..., tokenOut]
    /// @param poolIds Pool IDs for each hop
    /// @param amountIn Input amount
    /// @param minFinalOut Minimum final output
    /// @param deadline Transaction deadline
    /// @return finalAmount Actual output amount
    function multiHopSwap(
        address[] calldata path,
        uint256[] calldata poolIds,
        uint256 amountIn,
        uint256 minFinalOut,
        uint256 deadline
    ) external validDeadline(deadline) returns (uint256 finalAmount) {
        finalAmount = _multiHopSwapInternal(path, poolIds, amountIn, msg.sender);
        require(finalAmount >= minFinalOut, "RR: insufficient output");
    }

    /// @notice Get a quote for swapping (preview without execution)
    /// @param tokenIn Input token
    /// @param tokenOut Output token
    /// @param amountIn Amount to swap
    /// @return expectedOut Expected output amount
    /// @return gasEstimate Estimated gas cost
    /// @return route The optimal route
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 expectedOut, uint256 gasEstimate, Route memory route) {
        route = findBestRoute(tokenIn, tokenOut, amountIn);
        expectedOut = route.expectedOut;
        gasEstimate = route.estimatedGas;
    }

    // ================================================================
    //                    LIMIT ORDERS (Auto-Sign powered)
    // ================================================================

    /// @notice Place a limit order (tokens locked in contract)
    /// @param tokenIn Token to sell
    /// @param tokenOut Token to buy
    /// @param amountIn Amount to sell
    /// @param targetPrice Minimum output per unit input (scaled 1e18)
    /// @param expiry Order expiration timestamp
    /// @return orderId The order ID
    function placeLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 targetPrice,
        uint256 expiry
    ) external returns (uint256 orderId) {
        require(amountIn > 0, "RR: zero amount");
        require(targetPrice > 0, "RR: zero target");
        require(expiry > block.timestamp, "RR: expired");
        require(tokenIn != tokenOut, "RR: same token");

        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);

        orderCount++;
        orderId = orderCount;

        orders[orderId] = LimitOrder({
            owner: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            targetPrice: targetPrice,
            expiry: expiry,
            executed: false,
            cancelled: false
        });

        _userOrders[msg.sender].push(orderId);

        emit LimitOrderPlaced(orderId, msg.sender, tokenIn, tokenOut, amountIn, targetPrice, expiry);
    }

    /// @notice Execute a limit order when price condition is met
    /// @dev Callable by anyone (keeper/auto-sign ghost wallet)
    /// @param orderId The order to execute
    /// @return amountOut Output amount after swap
    function executeLimitOrder(uint256 orderId) external returns (uint256 amountOut) {
        LimitOrder storage order = orders[orderId];
        require(!order.executed && !order.cancelled, "RR: order inactive");
        require(block.timestamp <= order.expiry, "RR: order expired");

        // Find best route and check if price meets target
        Route memory route = findBestRoute(order.tokenIn, order.tokenOut, order.amountIn);
        uint256 priceAchieved = (route.expectedOut * 1e18) / order.amountIn;
        require(priceAchieved >= order.targetPrice, "RR: price not met");

        // Execute the swap (tokens already in contract)
        amountOut = _multiHopSwapFromContract(route.path, route.poolIds, order.amountIn);

        // Deduct execution fee (0.1%)
        uint256 execFee = (amountOut * LIMIT_ORDER_EXEC_FEE) / FEE_DENOMINATOR;
        uint256 userAmount = amountOut - execFee;

        // Transfer results
        _safeTransfer(order.tokenOut, order.owner, userAmount);
        if (execFee > 0) {
            _safeTransfer(order.tokenOut, msg.sender, execFee);
        }

        order.executed = true;

        emit LimitOrderExecuted(orderId, msg.sender, userAmount);
    }

    /// @notice Cancel a pending limit order and refund tokens
    /// @param orderId The order to cancel
    function cancelLimitOrder(uint256 orderId) external {
        LimitOrder storage order = orders[orderId];
        require(order.owner == msg.sender, "RR: not order owner");
        require(!order.executed && !order.cancelled, "RR: order inactive");

        order.cancelled = true;
        _safeTransfer(order.tokenIn, msg.sender, order.amountIn);

        emit LimitOrderCancelled(orderId);
    }

    /// @notice Get all active (pending) orders for a user
    /// @param user User address
    /// @return activeOrders Array of active LimitOrder structs
    function getActiveOrders(address user) external view returns (LimitOrder[] memory activeOrders) {
        uint256[] storage ids = _userOrders[user];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            LimitOrder storage o = orders[ids[i]];
            if (!o.executed && !o.cancelled && block.timestamp <= o.expiry) {
                activeCount++;
            }
        }

        activeOrders = new LimitOrder[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            LimitOrder storage o = orders[ids[i]];
            if (!o.executed && !o.cancelled && block.timestamp <= o.expiry) {
                activeOrders[idx] = o;
                idx++;
            }
        }
    }

    // ================================================================
    //                   BATCH SWAP (Portfolio Rebalancing)
    // ================================================================

    /// @notice Execute multiple swaps in a single transaction
    /// @param swaps Array of swap parameters
    /// @param deadline Transaction deadline
    /// @return amountsOut Array of output amounts
    function batchSwap(
        BatchSwapParam[] calldata swaps,
        uint256 deadline
    ) external validDeadline(deadline) returns (uint256[] memory amountsOut) {
        amountsOut = new uint256[](swaps.length);

        for (uint256 i = 0; i < swaps.length; i++) {
            Route memory route = findBestRoute(swaps[i].tokenIn, swaps[i].tokenOut, swaps[i].amountIn);
            uint256 out = _multiHopSwapInternal(route.path, route.poolIds, swaps[i].amountIn, msg.sender);
            require(out >= swaps[i].minOut, "RR: batch swap slippage");
            amountsOut[i] = out;
        }

        userSwapCount[msg.sender] += swaps.length;
        emit BatchSwapExecuted(msg.sender, swaps.length, 0);
    }

    // ================================================================
    //                    SEND TO USERNAME (.init)
    // ================================================================

    /// @notice Send tokens to an Initia username (.init)
    /// @param initUsername The .init username (e.g. "teman.init")
    /// @param token Token address to send
    /// @param amount Amount to send
    function sendToUsername(
        string calldata initUsername,
        address token,
        uint256 amount
    ) external {
        require(amount > 0, "RR: zero amount");

        // Resolve .init username to Cosmos address, then to EVM address
        // The username resolution uses Cosmos precompile query
        string memory queryPath = "/initia.usernames.v1.Query/Username";
        string memory queryReq = string(abi.encodePacked('{"username":"', initUsername, '"}'));
        string memory result = COSMOS.query_cosmos(queryPath, queryReq);

        // Parse the resolved cosmos address from result
        // In production, this would parse the JSON response
        // For now, we use the cosmos precompile to convert
        address resolvedAddr = COSMOS.to_evm_address(result);
        require(resolvedAddr != address(0), "RR: username not found");

        _safeTransferFrom(token, msg.sender, resolvedAddr, amount);

        emit SentToUsername(msg.sender, initUsername, token, amount);
    }

    // ================================================================
    //                      ORACLE & HELPERS
    // ================================================================

    /// @notice Get oracle price for a trading pair
    /// @param pair Pair string (e.g. "INIT/USD")
    /// @return price The current price (scaled by oracle decimals)
    function getOraclePrice(string calldata pair) external view returns (uint256 price) {
        // Parse pair string into base/quote
        // For simplicity, we expect format "BASE/QUOTE"
        (string memory base, string memory quote) = _parsePair(pair);
        IConnectOracle.Price memory p = ORACLE.get_price(base, quote);
        price = p.price;
    }

    /// @notice Get reserves for a pool
    /// @param poolId Pool ID
    /// @return reserveA Reserve of token A
    /// @return reserveB Reserve of token B
    function getPoolReserves(uint256 poolId) external view returns (uint256 reserveA, uint256 reserveB) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "RR: pool not found");
        reserveA = pool.reserveA;
        reserveB = pool.reserveB;
    }

    /// @notice Calculate output amount for a swap in a specific pool
    /// @param poolId Pool ID
    /// @param tokenIn Input token address
    /// @param amountIn Input amount
    /// @return amountOut Expected output amount
    function getAmountOut(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "RR: pool not found");

        (uint256 reserveIn, uint256 reserveOut) = tokenIn == pool.tokenA
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);

        require(reserveIn > 0 && reserveOut > 0, "RR: empty reserves");

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - pool.swapFeeRate);
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DENOMINATOR + amountInWithFee);
    }

    /// @notice Get pool ID for a token pair
    /// @param tokenA First token
    /// @param tokenB Second token
    /// @return poolId Pool ID (0 if not exists)
    function getPoolId(address tokenA, address tokenB) public view returns (uint256 poolId) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        poolId = _pairToPool[t0][t1];
    }

    /// @notice Get pool info including tokens
    /// @param poolId Pool ID
    /// @return tokenA Token A address
    /// @return tokenB Token B address
    /// @return reserveA Reserve A
    /// @return reserveB Reserve B
    /// @return swapFeeRate Fee rate in basis points
    /// @return totalLpSupply Total LP supply
    function getPoolInfo(uint256 poolId) external view returns (
        address tokenA, address tokenB,
        uint256 reserveA, uint256 reserveB,
        uint256 swapFeeRate, uint256 totalLpSupply
    ) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "RR: pool not found");
        return (pool.tokenA, pool.tokenB, pool.reserveA, pool.reserveB, pool.swapFeeRate, pool.totalLpSupply);
    }

    /// @notice Get LP balance for a user in a pool
    function getLpBalance(uint256 poolId, address user) external view returns (uint256) {
        return lpBalances[poolId][user];
    }

    // ================================================================
    //                      ADMIN FUNCTIONS
    // ================================================================

    /// @notice Update swap fee rate for a pool
    function setSwapFeeRate(uint256 poolId, uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "RR: fee too high"); // max 10%
        pools[poolId].swapFeeRate = newFeeRate;
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RR: zero address");
        owner = newOwner;
    }

    // ================================================================
    //                      INTERNAL FUNCTIONS
    // ================================================================

    /// @dev Execute a swap within a pool (tokens transferred from sender or contract)
    function _executeSwap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minOut,
        address sender
    ) internal returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(pool.exists, "RR: pool not found");
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "RR: invalid token");
        require(amountIn > 0, "RR: zero input");

        bool isTokenA = tokenIn == pool.tokenA;
        address tokenOut = isTokenA ? pool.tokenB : pool.tokenA;

        amountOut = getAmountOut(poolId, tokenIn, amountIn);
        require(amountOut >= minOut, "RR: insufficient output");

        // Transfer input from sender
        _safeTransferFrom(tokenIn, sender, address(this), amountIn);

        // Update reserves
        if (isTokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        // Transfer output to sender
        _safeTransfer(tokenOut, sender, amountOut);

        userSwapCount[sender]++;
        emit Swapped(poolId, sender, tokenIn, amountIn, amountOut);
    }

    /// @dev Multi-hop swap: transfers input from user, routes through pools
    function _multiHopSwapInternal(
        address[] memory path,
        uint256[] memory poolIds,
        uint256 amountIn,
        address sender
    ) internal returns (uint256 currentAmount) {
        require(path.length >= 2, "RR: invalid path");
        require(path.length == poolIds.length + 1, "RR: path/pool mismatch");
        require(path.length <= MAX_HOPS + 1, "RR: too many hops");

        // Transfer first token from user to contract
        _safeTransferFrom(path[0], sender, address(this), amountIn);
        currentAmount = amountIn;

        // Execute each hop (contract already holds the tokens)
        for (uint256 i = 0; i < poolIds.length; i++) {
            currentAmount = _swapFromContract(poolIds[i], path[i], currentAmount);
        }

        // Transfer final token to user
        _safeTransfer(path[path.length - 1], sender, currentAmount);
    }

    /// @dev Multi-hop swap where tokens are already in the contract (for limit orders)
    function _multiHopSwapFromContract(
        address[] memory path,
        uint256[] memory poolIds,
        uint256 amountIn
    ) internal returns (uint256 currentAmount) {
        currentAmount = amountIn;
        for (uint256 i = 0; i < poolIds.length; i++) {
            currentAmount = _swapFromContract(poolIds[i], path[i], currentAmount);
        }
    }

    /// @dev Swap tokens that are already held by the contract
    function _swapFromContract(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn
    ) internal returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        bool isTokenA = tokenIn == pool.tokenA;

        amountOut = getAmountOut(poolId, tokenIn, amountIn);

        if (isTokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        emit Swapped(poolId, address(this), tokenIn, amountIn, amountOut);
    }

    /// @dev Sort tokens so lower address is always first
    function _sortTokens(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) internal pure returns (address, address, uint256, uint256) {
        return tokenA < tokenB
            ? (tokenA, tokenB, amountA, amountB)
            : (tokenB, tokenA, amountB, amountA);
    }

    /// @dev Parse "BASE/QUOTE" string into components
    function _parsePair(string calldata pair) internal pure returns (string memory base, string memory quote) {
        bytes calldata b = bytes(pair);
        uint256 slashIdx = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] == "/") {
                slashIdx = i;
                break;
            }
        }
        require(slashIdx > 0, "RR: invalid pair format");
        base = string(b[0:slashIdx]);
        quote = string(b[slashIdx + 1:]);
    }

    /// @dev Integer square root (Babylonian method)
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /// @dev Return minimum of two values
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /// @dev Safe ERC20 transfer — reverts if transfer returns false or no data
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "RR: transfer failed");
    }

    /// @dev Safe ERC20 transferFrom — reverts if transferFrom returns false or no data
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "RR: transferFrom failed");
    }
}
