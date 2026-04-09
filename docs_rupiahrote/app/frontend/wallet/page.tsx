export default function WalletIntegrationPage() {
  return (
    <article className="prose">
      <h1>Wallet Integration</h1>
      <p>
        RupiahRoute uses <code>wagmi v3.6</code> with <code>viem v2.47</code> for all wallet
        interactions. The configuration supports multiple wallet types, handles a subtle
        auto-connect problem with certain injected wallets, and provides a polished connect/disconnect
        experience.
      </p>

      <h2>Supported Wallets</h2>
      <p>Three connector types are configured in <code>lib/wagmi.ts</code>:</p>
      <table>
        <thead>
          <tr><th>Connector</th><th>Type</th><th>Details</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>WalletConnect</strong></td>
            <td>QR / Deep link</td>
            <td>
              Uses project ID <code>3e748713fd9de3b75b5aeb857d8a4150</code>.
              Shows QR modal for mobile wallets. Metadata includes app name, description, origin URL, and logo.
            </td>
          </tr>
          <tr>
            <td><strong>Coinbase Wallet</strong></td>
            <td>Extension / Mobile</td>
            <td>
              Configured with app name &quot;RupiahRoute&quot; and logo. Supports both browser extension and Coinbase Wallet mobile app.
            </td>
          </tr>
          <tr>
            <td><strong>Injected</strong></td>
            <td>Browser extension</td>
            <td>
              Catches all EIP-1193 injected providers: MetaMask, Rabby, Talisman, OKX Wallet,
              Trust Wallet, Rainbow, Phantom, Zerion, and any other wallet that injects
              <code>window.ethereum</code>. Uses <code>shimDisconnect: true</code>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>wagmi Configuration</h2>
      <pre><code>{`// lib/wagmi.ts
import { http, createConfig, createStorage } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { rupiahRouteChain } from "./chain";

export const config = createConfig({
  chains: [rupiahRouteChain],
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: true }),
    coinbaseWallet({ appName: "RupiahRoute", appLogoUrl: "/logo/logo.png" }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [rupiahRouteChain.id]: http("http://localhost:8545"),
  },
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
  }),
  ssr: true,
});`}</code></pre>
      <p>Key configuration choices:</p>
      <ul>
        <li><strong>Chain:</strong> Initia MiniEVM (<code>rupiahRouteChain</code>) defined via viem <code>defineChain()</code> with chain ID <code>1212385660403083</code>, native currency GAS (18 decimals), and local RPC at <code>http://localhost:8545</code>. Falls back to Sepolia when <code>NEXT_PUBLIC_USE_LOCAL_ROLLUP</code> is not set.</li>
        <li><strong>Storage:</strong> Uses <code>sessionStorage</code> (not localStorage) so wallet state is scoped to the browser tab and clears on close.</li>
        <li><strong>SSR:</strong> Enabled (<code>ssr: true</code>) for Next.js App Router compatibility. Prevents hydration mismatches by deferring wallet reads to client.</li>
      </ul>

      <h2>Anti-Auto-Connect System</h2>
      <p>
        This is the most nuanced part of the wallet integration. Certain injected wallets
        (particularly Talisman) auto-detect dApps and silently inject a provider, causing wagmi to
        auto-connect without user consent.
      </p>

      <h3>The Problem</h3>
      <p>
        When a user visits the site with Talisman installed, the wallet injects its provider into
        <code>window.ethereum</code>. wagmi detects this and (with default settings) automatically
        reconnects to it, showing the user as connected even though they never clicked
        &quot;Connect Wallet&quot;. This is confusing and a privacy concern.
      </p>

      <h3>The Solution</h3>
      <p>
        RupiahRoute uses a <code>sessionStorage</code> flag (<code>rr_user_connected</code>) as a
        guard to distinguish user-initiated connections from auto-connections:
      </p>
      <pre><code>{`// In WalletButton component:

// Check if the user explicitly initiated the connection
const userInitiated = typeof window !== "undefined"
  && !!sessionStorage.getItem("rr_user_connected");

// Kill auto-connections that weren't user-initiated
useEffect(() => {
  if (isConnected && !sessionStorage.getItem("rr_user_connected")) {
    disconnect();  // Immediately disconnect auto-connections
  }
}, [isConnected, disconnect]);

// Only show connected state if user-initiated
const showConnected = isConnected && address && userInitiated;`}</code></pre>

      <h3>Connection Flow</h3>
      <table>
        <thead>
          <tr><th>Scenario</th><th>What Happens</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>First visit</strong> (no flag)</td>
            <td>
              <code>rr_user_connected</code> does not exist in sessionStorage.
              If Talisman (or another wallet) auto-connects, the <code>useEffect</code> guard
              detects <code>isConnected === true</code> with no flag and immediately calls
              <code>disconnect()</code>. The user sees the &quot;Connect Wallet&quot; button.
            </td>
          </tr>
          <tr>
            <td><strong>User clicks Connect</strong></td>
            <td>
              The flag is set <em>before</em> the connect call:
              <code>sessionStorage.setItem(&quot;rr_user_connected&quot;, &quot;1&quot;)</code>,
              then <code>connect(&#123; connector &#125;)</code> is called.
              This ensures the guard does not disconnect the intentional connection.
            </td>
          </tr>
          <tr>
            <td><strong>Page refresh</strong> (flag exists)</td>
            <td>
              The flag persists in sessionStorage. wagmi&apos;s <code>reconnectOnMount</code>
              behavior restores the last wallet connection. The guard sees the flag and allows
              the connection to remain. The user stays connected with their previous wallet.
            </td>
          </tr>
          <tr>
            <td><strong>User disconnects</strong></td>
            <td>
              The flag is cleared: <code>sessionStorage.removeItem(&quot;rr_user_connected&quot;)</code>,
              then <code>disconnect()</code> is called. Next page load will not auto-reconnect.
            </td>
          </tr>
          <tr>
            <td><strong>Tab close</strong></td>
            <td>
              sessionStorage is cleared by the browser. Next visit starts fresh with no flag,
              preventing any auto-connection.
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Why sessionStorage?</h3>
      <p>
        Both the wagmi config storage and the auto-connect flag use sessionStorage (not localStorage)
        for two reasons:
      </p>
      <ol>
        <li><strong>Tab isolation:</strong> Each browser tab has independent wallet state. Opening a new tab does not inherit a connected wallet from another tab.</li>
        <li><strong>Auto-cleanup:</strong> Closing the tab clears all wallet state. The user must explicitly reconnect on their next visit, which is the expected UX for a DeFi dApp.</li>
      </ol>

      <h2>WalletButton Component</h2>
      <p>
        The <code>WalletButton</code> component handles the entire connection lifecycle. It renders
        differently based on connection state:
      </p>

      <h3>Disconnected State</h3>
      <p>
        Shows a &quot;Connect Wallet&quot; button. Clicking it opens a full-screen modal (portaled
        to <code>document.body</code>) with two panels:
      </p>

      <h4>Left Panel: Wallet List</h4>
      <ul>
        <li>
          <strong>Installed wallets:</strong> Lists all detected connectors from wagmi. The list is
          de-duplicated by name and filters out generic &quot;Injected&quot; / &quot;Browser Wallet&quot;
          entries when a named injected wallet (like MetaMask or Rabby) is detected.
        </li>
        <li>
          <strong>Popular wallets:</strong> Below the installed section, shows wallets that are
          <em>not</em> detected but commonly used. Each links to the wallet&apos;s download page:
          <ul>
            <li>Rabby Wallet (rabby.io)</li>
            <li>OKX Wallet (okx.com/web3)</li>
            <li>Trust Wallet (trustwallet.com)</li>
            <li>Phantom (phantom.app)</li>
            <li>Rainbow (rainbow.me)</li>
            <li>Zerion (zerion.io)</li>
          </ul>
        </li>
        <li>Each wallet entry shows its icon (from the connector&apos;s <code>icon</code> property, or a colored initial fallback using brand colors)</li>
      </ul>

      <h4>Right Panel: Info / Connecting</h4>
      <ul>
        <li>
          <strong>Before selection:</strong> Shows a &quot;What is a Wallet?&quot; educational section with two info cards:
          <ul>
            <li><strong>A digital home for your assets:</strong> Explains that wallets store digital assets</li>
            <li><strong>A new way to log in:</strong> Explains wallet-based authentication</li>
          </ul>
          Links to <code>ethereum.org/wallets</code> with a &quot;Get a Wallet&quot; CTA button.
        </li>
        <li>
          <strong>After selection:</strong> Shows the selected wallet&apos;s icon with a
          &quot;Opening [wallet name]...&quot; message, &quot;Confirm in extension&quot; subtitle,
          and a spinning loading indicator.
        </li>
      </ul>

      <h3>Connected State</h3>
      <p>
        Shows a compact button displaying: wallet icon, GAS balance (green), separator, and
        truncated address (<code>0x1234...abcd</code>). The GAS balance is fetched via direct
        JSON-RPC <code>eth_getBalance</code> call with 10-second polling.
      </p>
      <p>
        Clicking the button opens an account popup (portaled to body) with:
      </p>
      <ul>
        <li>Large wallet icon</li>
        <li>Truncated address</li>
        <li>GAS balance</li>
        <li><strong>Copy Address button:</strong> Copies full address to clipboard. Shows &quot;Copied!&quot; confirmation for 2 seconds.</li>
        <li><strong>Disconnect button:</strong> Clears the <code>rr_user_connected</code> flag, calls <code>disconnect()</code>, and closes the popup.</li>
      </ul>

      <h2>Wallet Icon Rendering</h2>
      <p>
        The <code>WalletIcon</code> helper component renders wallet icons with a multi-fallback strategy:
      </p>
      <ol>
        <li><strong>Connector icon:</strong> If the wagmi connector provides an <code>icon</code> URL, render it as an <code>&lt;img&gt;</code></li>
        <li><strong>Brand color fallback:</strong> If no icon is available, render a colored circle with the wallet&apos;s first letter, using a hardcoded brand color map:</li>
      </ol>
      <pre><code>{`const BRAND_COLORS = {
  MetaMask:         "#F6851B",
  WalletConnect:    "#3B99FC",
  "Coinbase Wallet":"#0052FF",
  "Rabby Wallet":   "#7C8AFF",
  Talisman:         "#D5FF5C",  // dark text for light background
  "Trust Wallet":   "#3375BB",
  Rainbow:          "#001AFF",
  Phantom:          "#AB9FF2",
  Zerion:           "#2962EF",
  Injected:         "#6366F1",
};`}</code></pre>

      <h2>Internationalization</h2>
      <p>
        All wallet UI strings use the <code>t()</code> translation hook. Translation keys include:
      </p>
      <ul>
        <li><code>common.connectWallet</code> &mdash; Main connect button text</li>
        <li><code>wallet.connectTitle</code> &mdash; Modal title</li>
        <li><code>wallet.installed</code> &mdash; &quot;Installed&quot; section label</li>
        <li><code>wallet.popular</code> &mdash; &quot;Popular&quot; section label</li>
        <li><code>wallet.opening</code> &mdash; &quot;Opening &#123;wallet&#125;...&quot;</li>
        <li><code>wallet.confirmInExtension</code> &mdash; Confirmation prompt</li>
        <li><code>wallet.whatIsWallet</code> &mdash; Educational section title</li>
        <li><code>wallet.digitalHome</code> / <code>wallet.digitalHomeDesc</code> &mdash; Info card 1</li>
        <li><code>wallet.newWayToLogin</code> / <code>wallet.newWayToLoginDesc</code> &mdash; Info card 2</li>
        <li><code>wallet.getWallet</code> &mdash; CTA button</li>
        <li><code>wallet.copied</code> / <code>wallet.copyAddress</code> &mdash; Copy button states</li>
        <li><code>wallet.disconnect</code> &mdash; Disconnect button</li>
      </ul>
    </article>
  );
}
