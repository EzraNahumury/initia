export default function RouterPage() {
  return (
    <article className="prose">
      <h1>RupiahRouter</h1>
      <p>
        The RupiahRouter contract is the production AMM engine. It manages liquidity pools,
        computes optimal routes, executes multi-hop swaps, and supports limit orders and
        batch operations. Address: <code>0x3072a5b043ea67c4c597b1e2e82dd63a50ada23d</code>
      </p>

      <h2>AMM Engine</h2>
      <p>
        Pools follow the constant-product formula <code>x * y = k</code> with a 0.3% swap fee.
        On the first deposit, 1000 units of LP tokens are permanently locked to prevent
        price manipulation of empty pools. Subsequent deposits mint LP tokens proportional
        to the depositor's contribution relative to existing reserves.
      </p>

      <h3>createPool</h3>
      <pre><code>{`function createPool(
    address tokenA,
    address tokenB,
    uint256 amountA,
    uint256 amountB
) external returns (address pool)`}</code></pre>
      <p>
        Creates a new liquidity pool for a token pair and seeds it with initial liquidity.
        Reverts if a pool for the pair already exists. Locks the first 1000 LP tokens.
      </p>

      <h3>addLiquidity</h3>
      <pre><code>{`function addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)`}</code></pre>
      <p>
        Adds liquidity to an existing pool. The contract calculates the optimal ratio
        and refunds any excess. LP tokens are minted proportional to the contribution.
      </p>

      <h3>removeLiquidity</h3>
      <pre><code>{`function removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) external returns (uint256 amountA, uint256 amountB)`}</code></pre>
      <p>
        Burns LP tokens and returns the underlying token pair to the caller.
        Minimum output amounts protect against slippage.
      </p>

      <h3>swap</h3>
      <pre><code>{`function swap(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 minOut,
    address to,
    uint256 deadline
) external returns (uint256 amountOut)`}</code></pre>
      <p>
        Executes a single-pool swap. Deducts the 0.3% fee from <code>amountIn</code>,
        computes output via the constant-product formula, and verifies the k-invariant
        after the trade.
      </p>

      <h3>getAmountOut</h3>
      <pre><code>{`function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
) public pure returns (uint256 amountOut)`}</code></pre>
      <p>
        Pure helper that calculates the output amount for a given input, including the
        0.3% fee. Used internally and available externally for quote computation.
      </p>
      <pre><code>{`// Formula:
// amountInWithFee = amountIn * 997
// amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee)`}</code></pre>

      <h2>Routing Engine</h2>
      <p>
        The routing engine finds the most efficient path between any two tokens,
        comparing a direct swap against multi-hop routes through up to 3 intermediate pools.
      </p>

      <h3>findBestRoute</h3>
      <pre><code>{`function findBestRoute(
    address tokenIn,
    address tokenOut,
    uint256 amountIn
) external view returns (address[] memory path, uint256 expectedOut)`}</code></pre>
      <p>
        Compares direct and multi-hop paths (max 3 hops) and returns the route that
        yields the highest output.
      </p>

      <h3>executeRoute</h3>
      <pre><code>{`function executeRoute(
    address[] calldata path,
    uint256 amountIn,
    uint256 minOut,
    address to,
    uint256 deadline
) external returns (uint256 amountOut)`}</code></pre>
      <p>
        Executes a pre-computed route. Slippage protection via <code>minOut</code> and
        deadline validation ensure the trade is still viable at execution time.
      </p>

      <h3>multiHopSwap</h3>
      <pre><code>{`function multiHopSwap(
    address[] calldata path,
    uint256 amountIn,
    uint256 minOut,
    address to,
    uint256 deadline
) external returns (uint256 amountOut)`}</code></pre>
      <p>
        Executes a swap through multiple pools in sequence. Each hop applies the 0.3%
        fee independently.
      </p>

      <h3>getQuote &amp; batchSwap</h3>
      <pre><code>{`function getQuote(
    address tokenIn,
    address tokenOut,
    uint256 amountIn
) external view returns (uint256 amountOut)

function batchSwap(
    address[] calldata tokensIn,
    address[] calldata tokensOut,
    uint256[] calldata amountsIn,
    uint256[] calldata minOuts,
    uint256 deadline
) external returns (uint256[] memory amountsOut)`}</code></pre>
      <p>
        <code>getQuote</code> returns the expected output without executing.
        <code>batchSwap</code> executes multiple swaps atomically in a single transaction.
      </p>

      <h2>Limit Orders</h2>
      <p>
        Limit orders use a keeper pattern: the user locks tokens and specifies a target
        price. Any external account can execute the order once the market price meets the
        target, earning a 0.1% executor fee for doing so.
      </p>

      <h3>placeLimitOrder</h3>
      <pre><code>{`function placeLimitOrder(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 targetPrice,
    uint256 deadline
) external returns (uint256 orderId)`}</code></pre>
      <p>
        Transfers <code>amountIn</code> from the caller into the contract and creates a
        pending limit order. Returns a unique order ID.
      </p>

      <h3>executeLimitOrder</h3>
      <pre><code>{`function executeLimitOrder(uint256 orderId) external returns (uint256 amountOut)`}</code></pre>
      <p>
        Callable by anyone. Checks that the current pool price satisfies the order's
        target price, executes the swap, sends output to the order creator, and pays
        the 0.1% executor fee to <code>msg.sender</code>.
      </p>

      <h3>cancelLimitOrder</h3>
      <pre><code>{`function cancelLimitOrder(uint256 orderId) external`}</code></pre>
      <p>
        Only callable by the order creator. Refunds the locked input tokens in full.
      </p>

      <h3>getActiveOrders</h3>
      <pre><code>{`function getActiveOrders(address user) external view returns (Order[] memory)`}</code></pre>
      <p>Returns all pending limit orders for a given user.</p>

      <h2>Events</h2>
      <pre><code>{`event PoolCreated(address indexed tokenA, address indexed tokenB, address pool);
event Swapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
event RouteExecuted(address indexed user, address[] path, uint256 amountIn, uint256 amountOut);
event BatchSwapExecuted(address indexed user, uint256 swapCount);
event LimitOrderPlaced(uint256 indexed orderId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 targetPrice);
event LimitOrderExecuted(uint256 indexed orderId, address indexed executor, uint256 amountOut);
event LimitOrderCancelled(uint256 indexed orderId);`}</code></pre>

      <h2>Example Flows</h2>

      <h3>Single Swap: INIT to USDC</h3>
      <pre><code>{`// 1. Approve router to spend INIT
INIT.approve(router, 1000e18);

// 2. Execute swap with 1% slippage tolerance
uint256 quote = router.getQuote(INIT, USDC, 1000e18);
uint256 minOut = quote * 99 / 100;

router.swap(INIT, USDC, 1000e18, minOut, msg.sender, block.timestamp + 300);`}</code></pre>

      <h3>Multi-Hop: INIT to WETH via USDC</h3>
      <pre><code>{`// No direct INIT/WETH pool, route through USDC
address[] memory path = new address[](3);
path[0] = INIT;
path[1] = USDC;
path[2] = WETH;

// Get expected output across both hops
uint256 quote = router.getQuote(INIT, WETH, 1000e18);
uint256 minOut = quote * 99 / 100;

router.multiHopSwap(path, 1000e18, minOut, msg.sender, block.timestamp + 300);`}</code></pre>

      <h3>Limit Order Lifecycle</h3>
      <pre><code>{`// 1. User places order: sell 500 USDC when INIT price hits 1.05 USDC
USDC.approve(router, 500e6);
uint256 orderId = router.placeLimitOrder(USDC, INIT, 500e6, 1.05e18, block.timestamp + 86400);

// 2. Later, a keeper sees the price has reached the target
router.executeLimitOrder(orderId);
// -> User receives INIT, keeper receives 0.1% executor fee

// OR: User cancels before execution
router.cancelLimitOrder(orderId);
// -> 500 USDC refunded to user`}</code></pre>
    </article>
  );
}
