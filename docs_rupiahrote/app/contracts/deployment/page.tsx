export default function DeploymentPage() {
  return (
    <article className="prose">
      <h1>Deployment Guide</h1>
      <p>
        This guide walks through deploying the RupiahRoute smart contracts to an
        Initia MiniEVM network, including creating mock tokens and seeding liquidity
        pools for testnet use.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li><strong>Foundry</strong>, with forge, cast, and anvil installed (<a href="https://book.getfoundry.sh/getting-started/installation">installation guide</a>)</li>
        <li><strong>Initia node running</strong>, either a local MiniEVM rollup via <code>weave start</code> or a remote RPC endpoint</li>
        <li><strong>Deployer private key</strong> for an account with sufficient GAS for deployment</li>
      </ul>

      <h2>Environment Variables</h2>
      <p>Set these before running the deployment scripts:</p>
      <pre><code>{`export DEPLOYER_KEY="0xYOUR_PRIVATE_KEY"
export RPC_URL="http://localhost:8545"

# Set these after deploying the contracts (needed by SetupPools)
export ROUTER_ADDRESS="0x..."   # RupiahRouter address from step 1
export USER_ADDRESS="0x..."     # Address to receive initial tokens`}</code></pre>

      <h2>Deployment Scripts</h2>
      <p>
        There are three Foundry scripts in the <code>script/</code> directory, and they
        must be run in order.
      </p>

      <h3>Step 1: Deploy RupiahRouter</h3>
      <p>Deploys the production AMM engine contract.</p>
      <pre><code>{`forge script script/RupiahRouter.s.sol \\
  --rpc-url $RPC_URL \\
  --private-key $DEPLOYER_KEY \\
  --broadcast --legacy`}</code></pre>
      <p>
        Save the deployed address from the output. This is your
        <code>ROUTER_ADDRESS</code> for subsequent steps.
      </p>

      <h3>Step 2: Deploy TokenFaucet</h3>
      <p>Deploys the testnet faucet and utility contract.</p>
      <pre><code>{`forge script script/TokenFaucet.s.sol \\
  --rpc-url $RPC_URL \\
  --private-key $DEPLOYER_KEY \\
  --broadcast --legacy`}</code></pre>
      <p>
        Save the deployed address. This becomes
        <code>NEXT_PUBLIC_FAUCET_CONTRACT</code> in the frontend <code>.env.local</code>.
      </p>

      <h3>Step 3: Setup Pools</h3>
      <p>
        Creates 5 MockERC20 tokens (INIT, USDC, WETH, TIA, IDRX) and seeds 4 initial
        liquidity pools on the RupiahRouter.
      </p>
      <pre><code>{`forge script script/SetupPools.s.sol \\
  --rpc-url $RPC_URL \\
  --broadcast --legacy`}</code></pre>

      <h3>Initial Pools Created</h3>
      <table>
        <thead>
          <tr><th>Pool</th><th>Token A Amount</th><th>Token B Amount</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>INIT / USDC</strong></td><td>100,000 INIT</td><td>98,500 USDC</td></tr>
          <tr><td><strong>INIT / WETH</strong></td><td>192,300 INIT</td><td>100 WETH</td></tr>
          <tr><td><strong>USDC / WETH</strong></td><td>189,300 USDC</td><td>100 WETH</td></tr>
          <tr><td><strong>INIT / TIA</strong></td><td>100,000 INIT</td><td>95,000 TIA</td></tr>
        </tbody>
      </table>
      <p>
        These ratios establish initial prices. For example, the INIT/USDC pool
        implies an INIT price of roughly $0.985 USDC.
      </p>

      <h2>Verification</h2>
      <p>
        After deployment, verify the contracts are working correctly using <code>cast</code>:
      </p>

      <h3>Check RupiahRouter</h3>
      <pre><code>{`# Verify the contract is deployed
cast code $ROUTER_ADDRESS --rpc-url $RPC_URL

# Check owner
cast call $ROUTER_ADDRESS "owner()(address)" --rpc-url $RPC_URL

# Get a swap quote (INIT -> USDC, 100 tokens)
cast call $ROUTER_ADDRESS \\
  "getQuote(address,address,uint256)(uint256)" \\
  $INIT_TOKEN $USDC_TOKEN 100000000000000000000 \\
  --rpc-url $RPC_URL`}</code></pre>

      <h3>Check TokenFaucet</h3>
      <pre><code>{`# Verify the contract is deployed
cast code $FAUCET_ADDRESS --rpc-url $RPC_URL

# Get a swap quote
cast call $FAUCET_ADDRESS \\
  "getQuote(address,address,uint256)(uint256)" \\
  $INIT_TOKEN $USDC_TOKEN 100000000000000000000 \\
  --rpc-url $RPC_URL

# Claim test tokens (sends 1000 wei GAS as fee)
cast send $FAUCET_ADDRESS \\
  "claimToken(address)" $USDC_TOKEN \\
  --value 1000 \\
  --private-key $DEPLOYER_KEY \\
  --rpc-url $RPC_URL`}</code></pre>

      <h3>Check Pool State</h3>
      <pre><code>{`# Verify a pool exists for INIT/USDC
cast call $ROUTER_ADDRESS \\
  "getPool(address,address)(address)" \\
  $INIT_TOKEN $USDC_TOKEN \\
  --rpc-url $RPC_URL

# Check pool reserves
cast call $ROUTER_ADDRESS \\
  "getReserves(address,address)(uint256,uint256)" \\
  $INIT_TOKEN $USDC_TOKEN \\
  --rpc-url $RPC_URL`}</code></pre>

      <h2>Troubleshooting</h2>
      <ul>
        <li>
          <strong>Transaction reverts with &quot;insufficient gas&quot;:</strong> Initia MiniEVM
          uses the <code>--legacy</code> flag; make sure it is included in all forge commands.
        </li>
        <li>
          <strong>SetupPools fails:</strong> Ensure <code>ROUTER_ADDRESS</code> and
          <code>USER_ADDRESS</code> environment variables are set correctly before running.
        </li>
        <li>
          <strong>cast call returns empty:</strong> The contract may not be deployed at
          the expected address. Check <code>cast code</code> returns non-empty bytecode.
        </li>
      </ul>
    </article>
  );
}
