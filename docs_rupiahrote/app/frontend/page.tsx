export default function FrontendOverviewPage() {
  return (
    <article className="prose">
      <h1>Frontend Overview</h1>
      <p>
        The RupiahRoute frontend is a Next.js single-page application that provides a full DeFi
        interface on the Initia MiniEVM rollup. It connects to on-chain contracts via wagmi/viem
        and fetches live market data from CoinGecko and four external DEX aggregators.
      </p>

      <h2>Tech Stack</h2>
      <table>
        <thead>
          <tr><th>Layer</th><th>Technology</th><th>Version</th></tr>
        </thead>
        <tbody>
          <tr><td>Framework</td><td>Next.js (App Router)</td><td>16.2.2</td></tr>
          <tr><td>Language</td><td>TypeScript</td><td>5.x</td></tr>
          <tr><td>Wallet</td><td>wagmi + viem</td><td>3.6 / 2.47</td></tr>
          <tr><td>Styling</td><td>Tailwind CSS v4 + shadcn/ui</td><td>4.x</td></tr>
          <tr><td>Data fetching</td><td>TanStack React Query</td><td>5.96</td></tr>
          <tr><td>3D visuals</td><td>Three.js + @react-three/fiber + OGL</td><td>0.183 / 9.5 / 1.0</td></tr>
          <tr><td>i18n</td><td>i18next + react-i18next</td><td>26.0 / 17.0</td></tr>
          <tr><td>Motion</td><td>Framer Motion</td><td>12.38</td></tr>
          <tr><td>Icons</td><td>react-icons (Heroicons 2), lucide-react</td><td>5.6 / 1.7</td></tr>
        </tbody>
      </table>

      <h2>Pages</h2>
      <p>The app has seven route pages, each rendered inside a shared layout with the Header and background effects:</p>
      <table>
        <thead>
          <tr><th>Route</th><th>Component</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>/</code></td><td>SwapView</td><td>Default landing page. Two-panel swap interface with route comparison and 3D globe.</td></tr>
          <tr><td><code>/limit</code></td><td>LimitOrderCard</td><td>Place limit orders with target price and expiry. Active orders panel on the right.</td></tr>
          <tr><td><code>/batch</code></td><td>BatchSwapCard</td><td>Swap one source token into multiple targets with allocation sliders.</td></tr>
          <tr><td><code>/bridge</code></td><td>BridgeCard</td><td>Simulated L1-L2 bridge with deposit and withdraw modes.</td></tr>
          <tr><td><code>/send</code></td><td>SendCard</td><td>Send tokens to an address or <code>.init</code> username. Includes username registration.</td></tr>
          <tr><td><code>/faucet</code></td><td>FaucetCard</td><td>Claim testnet tokens (INIT, USDC, WETH, TIA, IDRX) with balance display.</td></tr>
          <tr><td><code>/dashboard</code></td><td>DashboardView</td><td>Portfolio overview, transaction stats, activity breakdown, and recent history.</td></tr>
        </tbody>
      </table>

      <h2>Theme and Typography</h2>
      <p>
        The UI uses a <strong>cyberpunk dark purple</strong> design language. The base background is
        near-black (<code>#0a0a1a</code>) with purple accent glows, glass-morphism panels, and neon
        highlight colors for green (success), red (error), and amber (warning).
      </p>
      <ul>
        <li><strong>Primary font:</strong> <code>Press Start 2P</code> (pixel font) for headings, labels, and small UI text</li>
        <li><strong>CJK fallback:</strong> <code>Noto Sans SC</code> for Chinese (Simplified) translations</li>
        <li><strong>Code / mono:</strong> System monospace stack for addresses and numeric values</li>
      </ul>
      <p>
        Font sizes follow a pixel-art scale: <code>text-[7px]</code> for muted labels,
        <code>text-[8px]</code> for body/buttons, <code>text-[10px]</code> for section titles,
        and <code>text-[14px]</code> for primary CTA buttons.
      </p>

      <h2>Project Structure</h2>
      <pre><code>{`fe_rupiahrote/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, providers, Header)
│   ├── providers.tsx       # WagmiProvider + QueryClientProvider + i18n init
│   ├── page.tsx            # / → SwapView
│   ├── limit/page.tsx      # /limit → LimitOrderCard
│   ├── batch/page.tsx      # /batch → BatchSwapCard
│   ├── bridge/page.tsx     # /bridge → BridgeCard
│   ├── send/page.tsx       # /send → SendCard
│   ├── faucet/page.tsx     # /faucet → FaucetCard
│   ├── dashboard/page.tsx  # /dashboard → DashboardView
│   └── globals.css         # Tailwind v4 imports + custom CSS keyframes
│
├── components/             # All React components
│   ├── ui/                 # shadcn/ui primitives (button, globe)
│   └── *.tsx               # Feature components (see below)
│
├── lib/                    # Shared utilities and configuration
│   ├── contract.ts         # Token list, router contract, formatAmount, parseAmount
│   ├── wagmi.ts            # wagmi config (chains, connectors, storage, SSR)
│   ├── chain.ts            # Initia MiniEVM chain definition (viem defineChain)
│   ├── dex-quotes.ts       # External DEX aggregator API fetchers
│   ├── activity.ts         # Activity recording (localStorage)
│   ├── tokens.ts           # Token styling helpers
│   ├── abi.ts              # RupiahRouter ABI
│   ├── xp.ts               # XP reward system
│   ├── utils.ts            # Tailwind cn() merge utility
│   └── i18n/               # Translation files
│       ├── index.ts        # i18next initialization
│       ├── en.ts           # English
│       ├── id.ts           # Bahasa Indonesia
│       └── zh.ts           # Chinese (Simplified)
│
└── public/                 # Static assets (logos, token icons)`}</code></pre>

      <h2>Components</h2>
      <p>
        The <code>components/</code> directory contains 25+ components. Each is a client component
        (<code>&quot;use client&quot;</code>) since they rely on wallet state and browser APIs.
      </p>
      <table>
        <thead>
          <tr><th>Component</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>SwapView</code></td><td>Main swap page: two-panel layout with swap form (left) and route comparison + 3D globe (right). Manages CoinGecko prices, simulated routes, external DEX quotes, and on-chain execution.</td></tr>
          <tr><td><code>SwapCard</code></td><td>Simpler standalone swap card used for basic swap execution with on-chain quote via <code>getQuote()</code>.</td></tr>
          <tr><td><code>SwapConfirmModal</code></td><td>Confirmation dialog before executing a swap. Shows token pair, amounts, price impact, slippage, min received, gas, and route info.</td></tr>
          <tr><td><code>TokenSelector</code></td><td>Dropdown token picker with search. Supports core tokens and extended Uniswap token list. Shows logo with multi-fallback (registry, Trust Wallet, initial letter).</td></tr>
          <tr><td><code>SlippageSettings</code></td><td>Slippage tolerance selector with preset buttons (0.1%, 0.5%, 1%, 3%).</td></tr>
          <tr><td><code>PriceImpactBadge</code></td><td>Color-coded badge showing price impact percentage. Green under 1%, yellow 1-5%, red above 5%.</td></tr>
          <tr><td><code>RecipientToggle</code></td><td>Optional send-to-different-address toggle for the swap form.</td></tr>
          <tr><td><code>RouteDisplay</code></td><td>Route info display showing path, expected output, gas estimate, and savings.</td></tr>
          <tr><td><code>LimitOrderCard</code></td><td>Limit order form with sell/buy token selectors, target price, expiry, plus active orders management panel.</td></tr>
          <tr><td><code>BatchSwapCard</code></td><td>Batch swap with source token, allocation sliders (capped at 100%), and preview of expected outputs.</td></tr>
          <tr><td><code>BridgeCard</code></td><td>L1-L2 bridge interface with deposit/withdraw mode toggle and simulated transfer.</td></tr>
          <tr><td><code>SendCard</code></td><td>Send tokens to address or <code>.init</code> username. Includes username registration and send history.</td></tr>
          <tr><td><code>FaucetCard</code></td><td>Testnet faucet: claim tokens, balance panel with highlight animation on increase, +delta float-up effect.</td></tr>
          <tr><td><code>DashboardView</code></td><td>Portfolio (native GAS + ERC20 balances), stats grid, activity breakdown with bridge deposit/withdraw split, scrollable recent activity.</td></tr>
          <tr><td><code>ActivityHistory</code></td><td>Scrollable list of recent transactions with clickable detail popups.</td></tr>
          <tr><td><code>WalletButton</code></td><td>Connect/disconnect wallet. Shows connect modal with installed + popular wallets, account popup with balance and copy address.</td></tr>
          <tr><td><code>Header</code></td><td>Top navigation bar with logo, page links, language toggle, and wallet button.</td></tr>
          <tr><td><code>LanguageToggle</code></td><td>Language switcher dropdown (EN, ID, ZH).</td></tr>
          <tr><td><code>BackgroundEffect</code></td><td>Animated background with gradient effects and particle system.</td></tr>
          <tr><td><code>HeroSection</code></td><td>Landing hero section with branding and tagline.</td></tr>
          <tr><td><code>WelcomePage</code></td><td>First-visit welcome overlay.</td></tr>
          <tr><td><code>FaultyTerminal</code></td><td>Decorative terminal animation effect.</td></tr>
          <tr><td><code>Radar</code></td><td>Radar animation component for visual effects.</td></tr>
          <tr><td><code>ui/globe</code></td><td>3D globe component built with Three.js / @react-three/fiber + three-globe. Shows animated arcs between world cities.</td></tr>
          <tr><td><code>ui/button</code></td><td>shadcn/ui button primitive with variant support.</td></tr>
        </tbody>
      </table>

      <h2>Key Library Files</h2>
      <h3>contract.ts</h3>
      <p>
        Defines the <code>Token</code> interface, the five core tokens (INIT, USDC, WETH, TIA, IDRX),
        the router contract reference, and utility functions <code>formatAmount()</code>,
        <code>parseAmount()</code>, and <code>formatRupiah()</code> (USD to IDR conversion at 16,000 rate).
        Token logos are sourced from the initia-registry GitHub repository.
      </p>

      <h3>wagmi.ts</h3>
      <p>
        Configures wagmi with three connectors (WalletConnect, Coinbase Wallet, Injected), the
        Initia MiniEVM chain, sessionStorage for state persistence, and SSR mode enabled. See
        the <a href="/frontend/wallet">Wallet Integration</a> page for the anti-auto-connect system.
      </p>

      <h3>dex-quotes.ts</h3>
      <p>
        Fetches live swap quotes from four external DEX aggregators (LiFi, OpenOcean, KyberSwap,
        ParaSwap) in parallel via <code>Promise.allSettled()</code>. Each fetcher has an 8-second
        timeout. Only DEXs that return a valid live quote are included in results. Quotes are
        sorted by output amount descending. See the <a href="/frontend/swap">Swap &amp; Routing</a> page.
      </p>

      <h3>activity.ts</h3>
      <p>
        Manages a per-address activity log in localStorage (max 50 records). Each record stores type
        (swap, bridge, send, batch, limit), token pair, amounts, status, and optional metadata
        (bridge mode, limit expiry, batch allocations). Used by the Dashboard for stats and history.
      </p>

      <h3>i18n/</h3>
      <p>
        Three translation files (English, Bahasa Indonesia, Chinese Simplified) initialized via
        i18next with browser language detection. All user-facing strings are translated using
        the <code>t()</code> hook from react-i18next.
      </p>
    </article>
  );
}
