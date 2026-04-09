export default function QuickStartPage() {
  return (
    <article className="prose">
      <h1>Quick Start</h1>
      <p>Get RupiahRoute running locally in three steps.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li><strong>Node.js</strong> 18+ and npm</li>
        <li><strong>Foundry</strong> (forge, cast, anvil): <a href="https://book.getfoundry.sh/getting-started/installation">Install guide</a></li>
        <li><strong>Initia CLI</strong>, for running a local MiniEVM rollup via <code>weave</code></li>
      </ul>

      <h2>Step 1: Start the Local Rollup</h2>
      <pre><code>{`# Start an Initia MiniEVM node
weave start

# This starts a local chain at http://localhost:8545`}</code></pre>

      <h2>Step 2: Deploy Smart Contracts</h2>
      <pre><code>{`cd sc_RupiahRote

# Deploy the main router
forge script script/RupiahRouter.s.sol \\
  --rpc-url http://localhost:8545 \\
  --private-key \$DEPLOYER_KEY \\
  --broadcast --legacy

# Deploy the testnet faucet
forge script script/TokenFaucet.s.sol \\
  --rpc-url http://localhost:8545 \\
  --private-key \$DEPLOYER_KEY \\
  --broadcast --legacy

# Create tokens + seed liquidity pools
forge script script/SetupPools.s.sol \\
  --rpc-url http://localhost:8545 \\
  --broadcast --legacy`}</code></pre>
      <p>Copy the deployed contract addresses from the output.</p>

      <h2>Step 3: Start the Frontend</h2>
      <pre><code>{`cd fe_rupiahrote

# Create .env.local with your deployed addresses
cat > .env.local << EOF
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_ROUTER_CONTRACT=0x3072a5b0...
NEXT_PUBLIC_FAUCET_CONTRACT=0x114ead71...
NEXT_PUBLIC_USE_LOCAL_ROLLUP=true
EOF

# Install and run
npm install
npm run dev`}</code></pre>
      <p>Open <a href="http://localhost:3000">http://localhost:3000</a>. You should see the welcome page.</p>

      <h2>First Steps</h2>
      <ol>
        <li>Click <strong>"Start Routing"</strong> on the welcome page</li>
        <li>Connect your wallet (MetaMask, Rabby, etc.)</li>
        <li>Go to <strong>Faucet</strong> tab and claim test tokens</li>
        <li>Go to <strong>Swap</strong> tab and try a swap</li>
        <li>Check the <strong>Dashboard</strong> to see your activity tracked</li>
      </ol>

      <h2>Environment Variables</h2>
      <table>
        <thead><tr><th>Variable</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>NEXT_PUBLIC_WC_PROJECT_ID</code></td><td>WalletConnect Cloud project ID</td></tr>
          <tr><td><code>NEXT_PUBLIC_ROUTER_CONTRACT</code></td><td>Deployed RupiahRouter address</td></tr>
          <tr><td><code>NEXT_PUBLIC_FAUCET_CONTRACT</code></td><td>Deployed TokenFaucet address</td></tr>
          <tr><td><code>NEXT_PUBLIC_USE_LOCAL_ROLLUP</code></td><td>Set to <code>true</code> when using local node</td></tr>
        </tbody>
      </table>
    </article>
  );
}
