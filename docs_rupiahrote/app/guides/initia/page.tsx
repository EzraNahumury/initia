export default function InitiaIntegrationPage() {
  return (
    <article className="prose">
      <h1>Initia Integration</h1>
      <p>
        RupiahRoute is built on Initia, a Layer 1 blockchain designed for
        modular Layer 2 rollups. This guide explains how the application
        integrates with Initia infrastructure.
      </p>

      <h2>What Is Initia</h2>
      <p>
        Initia is an L1 blockchain with a modular architecture for L2 rollups
        called <strong>appchains</strong>. Each appchain can choose its own
        virtual machine for smart contract execution:
      </p>
      <ul>
        <li>
          <strong>EVM:</strong> Ethereum Virtual Machine compatibility via
          MiniEVM
        </li>
        <li>
          <strong>MoveVM:</strong> Move language execution based on the Aptos
          Move runtime
        </li>
        <li>
          <strong>CosmWasm:</strong> WebAssembly-based smart contracts from the
          Cosmos ecosystem
        </li>
      </ul>
      <p>
        The L1 coordinates cross-rollup communication, shared security, and
        unified liquidity, while each appchain operates independently with its
        own execution environment and block production.
      </p>

      <h2>MiniEVM</h2>
      <p>
        RupiahRoute runs on <strong>MiniEVM</strong>, Initia{"'"}s EVM-compatible
        execution environment. MiniEVM operates as an appchain with the
        following characteristics:
      </p>
      <ul>
        <li>
          <strong>Full EVM compatibility:</strong> Solidity contracts, standard
          tooling (Foundry, Hardhat, ethers.js), and MetaMask all work as
          expected.
        </li>
        <li>
          <strong>100ms block times:</strong> significantly faster than
          Ethereum, enabling near-instant transaction confirmation.
        </li>
        <li>
          <strong>Cosmos SDK underpinnings:</strong> the chain benefits from
          IBC (Inter-Blockchain Communication) and other Cosmos-native features
          exposed through precompiled contracts.
        </li>
      </ul>

      <h2>Chain Configuration</h2>
      <p>
        The chain configuration is derived from the{" "}
        <strong>initia-registry</strong>, which provides canonical chain
        metadata:
      </p>
      <pre><code>{`// Chain configuration
{
  chainId: <from initia-registry>,
  rpcUrl: "http://localhost:8545",
  nativeCurrency: {
    name: "GAS",
    symbol: "GAS",
    decimals: 18
  }
}`}</code></pre>
      <p>
        The chain ID is pulled dynamically from the initia-registry rather than
        being hardcoded, ensuring the frontend always connects to the correct
        network.
      </p>

      <h2>Cosmos Precompile</h2>
      <p>
        The Cosmos precompile is deployed at address{" "}
        <code>0x00...f1</code> and provides a bridge between the EVM execution
        layer and the underlying Cosmos SDK functionality. It exposes several
        key functions:
      </p>

      <h3>Address Conversion</h3>
      <pre><code>{`// Convert between address formats
to_cosmos_address(evmAddress) → cosmosAddress
to_evm_address(cosmosAddress) → evmAddress`}</code></pre>
      <p>
        These functions translate between Ethereum-style hex addresses (
        <code>0x...</code>) and Cosmos-style bech32 addresses (
        <code>init1...</code>). This is essential for cross-layer operations.
      </p>

      <h3>IBC Execution</h3>
      <pre><code>{`// Execute Cosmos SDK messages from EVM
execute_cosmos(msg) → result`}</code></pre>
      <p>
        Allows EVM contracts to trigger Cosmos SDK transactions, including IBC
        transfers. This is the mechanism behind cross-chain token bridging from
        within Solidity contracts.
      </p>

      <h3>State Queries</h3>
      <pre><code>{`// Query Cosmos state from EVM
query_cosmos(path, data) → response`}</code></pre>
      <p>
        Enables EVM contracts and frontend code to read Cosmos SDK module state
        directly, for example querying IBC channel info or bank balances.
      </p>

      <h3>Username Resolution</h3>
      <p>
        The Cosmos precompile is also used to resolve <code>.init</code>{" "}
        usernames. When a user enters a <code>.init</code> name, the frontend
        calls <code>query_cosmos</code> to look up the associated on-chain
        address, enabling human-readable addressing throughout the application.
      </p>

      <h2>Slinky Oracle Precompile</h2>
      <p>
        The Slinky Oracle precompile is deployed at address{" "}
        <code>0x031E...72F</code> and provides on-chain price feeds. It exposes
        a single primary function:
      </p>
      <pre><code>{`// Fetch on-chain price data
get_price(base, quote) → Price {
  price: uint256,
  timestamp: uint256,
  decimals: uint8
}`}</code></pre>
      <p>
        The <code>get_price</code> function accepts a base and quote currency
        pair (e.g., <code>{"\"ETH\", \"USD\""}</code>) and returns a{" "}
        <code>Price</code> struct containing:
      </p>
      <ul>
        <li>
          <strong>price:</strong> the exchange rate as a fixed-point integer
        </li>
        <li>
          <strong>timestamp:</strong> when the price was last updated on-chain
        </li>
        <li>
          <strong>decimals:</strong> the number of decimal places in the price
          value
        </li>
      </ul>
      <p>
        Slinky oracle data is used by the swap router to validate quotes and
        protect against price manipulation. Because the oracle runs as a
        precompile, price lookups are gas-efficient and do not require external
        contract calls.
      </p>

      <h2>Interwoven Bridge</h2>
      <p>
        The Interwoven Bridge handles native L1-to-L2 token transfers within the
        Initia ecosystem. Rather than relying on third-party bridge protocols,
        Initia provides a built-in mechanism for moving assets between the L1
        and its appchains.
      </p>
      <p>
        In the RupiahRoute testnet environment, this bridge is simulated via the{" "}
        <code>TokenFaucet</code> contract using two functions:
      </p>
      <pre><code>{`// Simulated bridge operations in TokenFaucet
bridgeDeposit(token, amount)   // L1 → L2 deposit
bridgeWithdraw(token, amount)  // L2 → L1 withdrawal`}</code></pre>
      <p>
        These functions mint or burn tokens on the appchain side to simulate the
        effect of a real bridge deposit or withdrawal, allowing the full user
        flow to be tested without requiring an active L1 connection.
      </p>

      <h2>Username System</h2>
      <p>
        Initia supports <strong>.init usernames</strong>, human-readable names
        that map to on-chain addresses, similar to ENS on Ethereum. Key details:
      </p>
      <ul>
        <li>
          <strong>Registration:</strong> usernames are registered on-chain
          through the Initia L1 name service module.
        </li>
        <li>
          <strong>Resolution:</strong> the frontend resolves <code>.init</code>{" "}
          names to addresses using the Cosmos precompile{"'"}s{" "}
          <code>query_cosmos</code> function.
        </li>
        <li>
          <strong>Human-readable addresses:</strong> anywhere the app displays
          or accepts an address, users can use their <code>.init</code> username
          instead of a raw hex address.
        </li>
      </ul>
      <p>
        This enables a friendlier user experience for sending tokens, viewing
        transaction histories, and interacting with contracts. Users can type{" "}
        <code>alice.init</code> instead of memorizing{" "}
        <code>0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18</code>.
      </p>
    </article>
  );
}
