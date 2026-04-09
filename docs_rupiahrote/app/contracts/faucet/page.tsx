export default function FaucetPage() {
  return (
    <article className="prose">
      <h1>TokenFaucet</h1>
      <p>
        The TokenFaucet contract is the testnet utility that powers all frontend operations
        today. It combines a token faucet, oracle-priced swap, bridge simulation, username
        registry, and limit orders into a single contract.
        Address: <code>0x114ead71f34a502db1b9cd25d66be8f2a46caa68</code>
      </p>
      <p>
        <strong>Note:</strong> The frontend currently uses this contract for all operations
        including swap, bridge, send, limit orders, and batch swaps. The RupiahRouter
        contract is the production-grade replacement planned for mainnet.
      </p>

      <h2>Managed Tokens</h2>
      <table>
        <thead>
          <tr><th>Token</th><th>Decimals</th><th>Claim Amount</th><th>Address</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>INIT</strong></td>
            <td>18</td>
            <td>10,000</td>
            <td><code>Native (GAS token)</code></td>
          </tr>
          <tr>
            <td><strong>USDC</strong></td>
            <td>6</td>
            <td>10,000</td>
            <td><code>MockERC20 deployed by SetupPools</code></td>
          </tr>
          <tr>
            <td><strong>WETH</strong></td>
            <td>18</td>
            <td>5</td>
            <td><code>MockERC20 deployed by SetupPools</code></td>
          </tr>
          <tr>
            <td><strong>TIA</strong></td>
            <td>6</td>
            <td>10,000</td>
            <td><code>MockERC20 deployed by SetupPools</code></td>
          </tr>
          <tr>
            <td><strong>IDRX</strong></td>
            <td>2</td>
            <td>100,000,000</td>
            <td><code>MockERC20 deployed by SetupPools</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Functions</h2>

      <h3>Faucet</h3>
      <pre><code>{`function claimToken(address token) external payable`}</code></pre>
      <p>
        Mints test tokens to the caller. Requires a <strong>1000 GAS</strong> fee
        (sent as <code>msg.value</code>). Each call mints the full claim amount for
        the requested token.
      </p>

      <h3>Swap</h3>
      <pre><code>{`function swap(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 minAmountOut
) external payable returns (uint256 amountOut)

function batchSwap(
    address[] calldata tokensIn,
    address[] calldata tokensOut,
    uint256[] calldata amountsIn,
    uint256[] calldata minAmountsOut
) external payable returns (uint256[] memory amountsOut)

function getQuote(
    address tokenIn,
    address tokenOut,
    uint256 amountIn
) external view returns (uint256 amountOut)`}</code></pre>
      <p>
        <code>swap</code> requires a <strong>500 GAS</strong> fee. Prices come from an
        internal USD oracle (see Pricing below) and a 0.3% fee is applied.
        <code>batchSwap</code> also requires <strong>500 GAS</strong> and executes
        multiple swaps atomically. <code>getQuote</code> is a free view function.
      </p>

      <h3>Bridge Simulation</h3>
      <pre><code>{`function bridgeDeposit(
    address token,
    uint256 amount,
    string calldata destinationChain
) external payable

function bridgeWithdraw(
    address token,
    uint256 amount,
    string calldata sourceChain
) external payable`}</code></pre>
      <p>
        Simulated bridge operations for testnet. Each requires a <strong>100 GAS</strong>
        fee. <code>bridgeDeposit</code> locks tokens and emits a bridge event.
        <code>bridgeWithdraw</code> mints tokens to simulate receiving from another chain.
      </p>

      <h3>Username Registry</h3>
      <pre><code>{`function registerUsername(string calldata username) external

function sendToUsername(
    string calldata username,
    address token,
    uint256 amount
) external payable

function sendToken(
    address to,
    address token,
    uint256 amount
) external payable`}</code></pre>
      <p>
        <code>registerUsername</code> maps a <code>.init</code> name to the caller's
        address using the ICosmos precompile. <code>sendToUsername</code> resolves the
        name on-chain and transfers tokens. <code>sendToken</code> sends directly to an
        address. Both send functions require a <strong>100 GAS</strong> fee.
      </p>

      <h3>Limit Orders</h3>
      <pre><code>{`function placeLimitOrder(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 targetPrice,
    uint256 deadline
) external payable returns (uint256 orderId)

function executeLimitOrder(uint256 orderId) external payable returns (uint256 amountOut)

function cancelLimitOrder(uint256 orderId) external payable`}</code></pre>
      <p>
        Limit order functions mirror the RupiahRouter interface. Each call requires a
        <strong>500 GAS</strong> fee. The price check uses the internal oracle rather
        than pool reserves.
      </p>

      <h2>Pricing</h2>
      <p>
        The TokenFaucet uses an internal USD oracle with fixed prices rather than pool-based
        pricing. This simplifies testnet operations while still providing realistic swap
        behavior with a 0.3% fee.
      </p>
      <p>Output is computed as:</p>
      <pre><code>{`amountOut = (amountIn * priceIn * 10^decOut * 997) / (priceOut * 10^decIn * 1000)`}</code></pre>
      <p>Where:</p>
      <ul>
        <li><code>priceIn</code> / <code>priceOut</code>: internal USD prices for each token</li>
        <li><code>decIn</code> / <code>decOut</code>: token decimals (e.g. 18 for INIT, 6 for USDC)</li>
        <li><code>997 / 1000</code>: applies the 0.3% swap fee</li>
      </ul>
      <p>
        This ensures correct decimal handling across tokens with different precisions
        (e.g. swapping 18-decimal WETH for 2-decimal IDRX).
      </p>

      <h2>GAS Fee Summary</h2>
      <table>
        <thead>
          <tr><th>Function</th><th>GAS Fee (msg.value)</th></tr>
        </thead>
        <tbody>
          <tr><td>claimToken</td><td>1000 GAS</td></tr>
          <tr><td>swap</td><td>500 GAS</td></tr>
          <tr><td>batchSwap</td><td>500 GAS</td></tr>
          <tr><td>bridgeDeposit / bridgeWithdraw</td><td>100 GAS</td></tr>
          <tr><td>sendToUsername / sendToken</td><td>100 GAS</td></tr>
          <tr><td>placeLimitOrder / executeLimitOrder / cancelLimitOrder</td><td>500 GAS</td></tr>
          <tr><td>getQuote</td><td>Free (view)</td></tr>
          <tr><td>registerUsername</td><td>Free</td></tr>
        </tbody>
      </table>
    </article>
  );
}
