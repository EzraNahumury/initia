export default function TokenListPage() {
  return (
    <article className="prose">
      <h1>Token List</h1>
      <p>
        RupiahRoute supports a curated set of core tokens deployed on the Initia
        MiniEVM appchain, plus an extended list fetched at runtime from external
        registries.
      </p>

      <h2>Core Tokens</h2>
      <p>
        These tokens are hardcoded in the frontend and always available
        regardless of network connectivity.
      </p>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Decimals</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>INIT</strong></td>
            <td>Initia (native)</td>
            <td>18</td>
            <td><code>0x4e2F9D...</code></td>
          </tr>
          <tr>
            <td><strong>USDC</strong></td>
            <td>USD Coin</td>
            <td>6</td>
            <td><code>0xE125C4...</code></td>
          </tr>
          <tr>
            <td><strong>WETH</strong></td>
            <td>Wrapped Ether</td>
            <td>18</td>
            <td><code>0x6cB5dF...</code></td>
          </tr>
          <tr>
            <td><strong>TIA</strong></td>
            <td>Celestia</td>
            <td>6</td>
            <td><code>0xe2B7B1...</code></td>
          </tr>
          <tr>
            <td><strong>IDRX</strong></td>
            <td>Indonesian Rupiah stablecoin</td>
            <td>2</td>
            <td><code>0xF87DA4...</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Token Logos</h2>
      <p>
        Token logo images are sourced from the official Initia Registry on
        GitHub. The base URL for all token images is:
      </p>
      <pre><code>{`https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/`}</code></pre>
      <p>
        Each token references its logo by filename from this registry. If a logo
        is missing or fails to load, the <code>TokenSelector</code> component
        renders a fallback icon derived from the token symbol.
      </p>

      <h2>Extended Token List</h2>
      <p>
        Beyond the hardcoded core tokens, RupiahRoute fetches additional tokens
        at runtime from two sources:
      </p>
      <ul>
        <li>
          <strong>Uniswap Token List API:</strong> provides a standardized list
          of ERC-20 tokens with metadata (name, symbol, decimals, logoURI).
        </li>
        <li>
          <strong>Initia Registry:</strong> supplies Initia-native token
          definitions including IBC-bridged assets.
        </li>
      </ul>
      <p>
        Both lists are fetched in parallel, then merged and deduplicated by
        contract address (lowercased). Core tokens always take precedence when a
        duplicate is detected.
      </p>

      <h2>TokenSelector Component</h2>
      <p>
        The <code>TokenSelector</code> is a multi-chain token picker used
        throughout the swap and bridge interfaces. It provides:
      </p>
      <ul>
        <li>
          <strong>Chain filtering:</strong> users can filter tokens by their
          origin chain to narrow down the list.
        </li>
        <li>
          <strong>Search:</strong> real-time filtering by token name, symbol, or
          contract address.
        </li>
        <li>
          <strong>Address copy:</strong> a copy button next to each token lets
          users quickly copy the contract address to their clipboard.
        </li>
        <li>
          <strong>Fallback icons:</strong> when a token logo cannot be loaded,
          the component generates a colored circle with the first letter of the
          token symbol as a placeholder.
        </li>
      </ul>

      <h2>Token Styling</h2>
      <p>
        Each token has a consistent visual identity maintained by the{" "}
        <code>tokenStyle()</code> helper function. This function maps a token
        symbol to a pair of Tailwind CSS classes:
      </p>
      <ul>
        <li>
          <strong>Background color</strong> (<code>bg-*</code>): used for token
          badges, cards, and selected-state highlights.
        </li>
        <li>
          <strong>Ring color</strong> (<code>ring-*</code>): used for focus
          rings and hover outlines around token elements.
        </li>
      </ul>
      <pre><code>{`// Example usage
const style = tokenStyle("INIT");
// Returns: { bg: "bg-blue-500/10", ring: "ring-blue-500/30" }

const style = tokenStyle("IDRX");
// Returns: { bg: "bg-red-500/10", ring: "ring-red-500/30" }`}</code></pre>

      <h2>Faucet Amounts</h2>
      <p>
        The testnet faucet distributes a fixed amount of each core token per
        claim. This lets developers and testers quickly obtain tokens without
        needing to bridge or trade. The amount per claim varies by token to
        reflect realistic balances:
      </p>
      <ul>
        <li><strong>INIT:</strong> a generous amount of the native gas token</li>
        <li><strong>USDC:</strong> a moderate stablecoin amount for swap testing</li>
        <li><strong>WETH:</strong> a smaller amount reflecting real ETH value</li>
        <li><strong>TIA:</strong> a moderate amount for Celestia-related testing</li>
        <li>
          <strong>IDRX:</strong> a larger nominal amount since IDRX uses 2
          decimals and tracks the Indonesian Rupiah
        </li>
      </ul>
      <p>
        Faucet claims are rate-limited per wallet address. See the{" "}
        <strong>Smart Contracts</strong> guide for details on the{" "}
        <code>TokenFaucet</code> contract.
      </p>
    </article>
  );
}
