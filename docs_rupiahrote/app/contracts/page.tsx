export default function ContractsPage() {
  return (
    <article className="prose">
      <h1>Smart Contracts Overview</h1>
      <p>
        RupiahRoute runs on two Solidity contracts deployed to Initia MiniEVM.
        One is the production AMM engine; the other is a testnet utility that bundles
        faucet, swap, bridge simulation, and username registry into a single contract.
      </p>

      <h2>Contracts</h2>
      <table>
        <thead>
          <tr><th>Contract</th><th>Role</th><th>Address</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>RupiahRouter</strong></td>
            <td>Production AMM engine: pools, multi-hop routing, limit orders, batch swaps</td>
            <td><code>0x3072a5b043ea67c4c597b1e2e82dd63a50ada23d</code></td>
          </tr>
          <tr>
            <td><strong>TokenFaucet</strong></td>
            <td>Testnet utility: faucet, oracle-priced swap, bridge sim, username registry</td>
            <td><code>0x114ead71f34a502db1b9cd25d66be8f2a46caa68</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Toolchain</h2>
      <ul>
        <li><strong>Language:</strong> Solidity 0.8.24</li>
        <li><strong>Build &amp; test:</strong> Foundry (forge, cast, anvil)</li>
        <li><strong>EVM target:</strong> Paris (no PUSH0)</li>
        <li><strong>Optimizer:</strong> enabled, 200 runs</li>
      </ul>

      <h2>Initia Precompiles</h2>
      <p>
        Both contracts leverage Initia-specific precompiled contracts that expose
        Cosmos-layer functionality to EVM code:
      </p>
      <table>
        <thead>
          <tr><th>Precompile</th><th>Address</th><th>Usage</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ICosmos</strong></td>
            <td><code>0x00000000000000000000000000000000000000f1</code></td>
            <td>Username resolution (<code>.init</code> names) and IBC bridge operations</td>
          </tr>
          <tr>
            <td><strong>IConnectOracle</strong></td>
            <td><code>0x031Ebb23b7240A18c8F1A11D22702ab53D22672F</code></td>
            <td>Slinky on-chain price feeds for oracle-priced swaps</td>
          </tr>
        </tbody>
      </table>

      <h2>Key Parameters</h2>
      <table>
        <thead>
          <tr><th>Parameter</th><th>Value</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td>Swap fee</td><td><code>0.3%</code></td><td>Deducted from input amount on every swap</td></tr>
          <tr><td>Protocol fee</td><td><code>500 wei</code></td><td>Flat fee sent to protocol treasury</td></tr>
          <tr><td>Limit order executor fee</td><td><code>0.1%</code></td><td>Reward for the keeper who executes a limit order</td></tr>
          <tr><td>Max hops</td><td><code>3</code></td><td>Maximum intermediate pools in a routed swap</td></tr>
          <tr><td>Min liquidity</td><td><code>1000</code></td><td>Permanently locked on first deposit to prevent manipulation</td></tr>
        </tbody>
      </table>

      <h2>Security Features</h2>
      <ul>
        <li>
          <strong>Slippage protection:</strong> every swap accepts a <code>minOut</code> parameter;
          the transaction reverts if output falls below this threshold.
        </li>
        <li>
          <strong>Deadline validation:</strong> a <code>deadline</code> timestamp prevents stale
          transactions from being mined after market conditions have changed.
        </li>
        <li>
          <strong>Admin-only functions:</strong> pool creation, fee changes, and emergency
          operations are gated behind <code>onlyOwner</code>.
        </li>
        <li>
          <strong>Safe ERC-20 wrappers:</strong> all token interactions use safe transfer
          wrappers that check return values and handle non-standard tokens.
        </li>
        <li>
          <strong>K-invariant preservation:</strong> the constant-product invariant
          (<code>x * y = k</code>) is verified after every swap to ensure pool integrity.
        </li>
      </ul>
    </article>
  );
}
