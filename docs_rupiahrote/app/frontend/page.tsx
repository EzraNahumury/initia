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

      <div className="not-prose rounded-xl overflow-hidden my-5" style={{ background: "rgba(12,12,28,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>

        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "rgba(159,41,255,0.08)", borderBottom: "1px solid rgba(139,92,246,0.18)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.6)" }} />
          </div>
          <span className="text-[11px] font-mono font-bold text-purple-light ml-1">fe_rupiahrote/</span>
          <span className="text-[10px] font-mono text-muted">Next.js App Router</span>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">

          {/* app/ column */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: "rgba(99,102,241,0.1)", borderBottom: "1px solid rgba(99,102,241,0.15)" }}>
              <span className="text-sm">📁</span>
              <span className="text-[10px] font-mono font-bold text-foreground">app/</span>
              <span className="text-[9px] text-muted ml-1">App Router pages</span>
            </div>
            <div className="p-2.5 space-y-0.5">
              {[
                { name: "layout.tsx",          desc: "Root layout · fonts, providers, Header", special: true },
                { name: "providers.tsx",        desc: "Wagmi · QueryClient · i18n" },
                { name: "globals.css",          desc: "Tailwind v4 · keyframes", css: true },
                { name: "page.tsx",             desc: "/ → SwapView", route: true },
                { name: "limit/page.tsx",       desc: "/limit → LimitOrderCard", route: true },
                { name: "batch/page.tsx",       desc: "/batch → BatchSwapCard", route: true },
                { name: "bridge/page.tsx",      desc: "/bridge → BridgeCard", route: true },
                { name: "send/page.tsx",        desc: "/send → SendCard", route: true },
                { name: "faucet/page.tsx",      desc: "/faucet → FaucetCard", route: true },
                { name: "dashboard/page.tsx",   desc: "/dashboard → DashboardView", route: true },
              ].map((f) => (
                <div key={f.name} className="flex items-start gap-2 px-2 py-1.5 rounded-lg group"
                  style={{ background: f.route ? "rgba(99,102,241,0.06)" : f.special ? "rgba(159,41,255,0.05)" : "transparent" }}>
                  <span className="text-[10px] shrink-0 mt-px">{f.css ? "🎨" : f.route ? "🔷" : f.special ? "⚙️" : "📄"}</span>
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono font-semibold truncate" style={{ color: f.route ? "#93c5fd" : f.css ? "#f9a8d4" : "#d4d4f5" }}>{f.name}</div>
                    <div className="text-[8px] text-muted leading-tight">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: components/ + lib/ + public/ */}
          <div className="space-y-3">

            {/* components/ */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(159,41,255,0.2)" }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: "rgba(159,41,255,0.1)", borderBottom: "1px solid rgba(159,41,255,0.15)" }}>
                <span className="text-sm">📁</span>
                <span className="text-[10px] font-mono font-bold text-foreground">components/</span>
                <span className="text-[9px] text-muted ml-1">25+ React components</span>
              </div>
              <div className="p-2.5 space-y-0.5">
                {[
                  { name: "ui/",           desc: "shadcn primitives · globe, button", folder: true },
                  { name: "SwapView",      desc: "Main swap + route comparison" },
                  { name: "LimitOrderCard",desc: "Limit orders + active orders" },
                  { name: "BatchSwapCard", desc: "Multi-target batch swap" },
                  { name: "BridgeCard",    desc: "L1 ↔ L2 bridge UI" },
                  { name: "SendCard",      desc: "Send to address / .init" },
                  { name: "FaucetCard",    desc: "Testnet token faucet" },
                  { name: "DashboardView", desc: "Portfolio + stats + activity" },
                  { name: "ActivityHistory", desc: "Scrollable tx list + popups" },
                  { name: "WalletButton",  desc: "Connect / account modal" },
                  { name: "Header",        desc: "Nav bar · links · language" },
                ].map((c) => (
                  <div key={c.name} className="flex items-start gap-2 px-2 py-1 rounded-lg"
                    style={{ background: c.folder ? "rgba(159,41,255,0.08)" : "transparent" }}>
                    <span className="text-[10px] shrink-0 mt-px">{c.folder ? "📂" : "⚛️"}</span>
                    <div>
                      <div className="text-[9px] font-mono font-semibold" style={{ color: c.folder ? "#b44dff" : "#d4d4f5" }}>{c.name}{!c.folder ? ".tsx" : ""}</div>
                      <div className="text-[8px] text-muted leading-tight">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* lib/ */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(6,182,212,0.2)" }}>
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: "rgba(6,182,212,0.08)", borderBottom: "1px solid rgba(6,182,212,0.15)" }}>
                <span className="text-sm">📁</span>
                <span className="text-[10px] font-mono font-bold text-foreground">lib/</span>
                <span className="text-[9px] text-muted ml-1">Utilities · config · i18n</span>
              </div>
              <div className="p-2.5 grid grid-cols-2 gap-0.5">
                {[
                  { name: "contract.ts",   desc: "Tokens · ABI · format" },
                  { name: "wagmi.ts",      desc: "Chains · connectors · SSR" },
                  { name: "chain.ts",      desc: "Initia MiniEVM chain def" },
                  { name: "dex-quotes.ts", desc: "4× DEX aggregator APIs" },
                  { name: "activity.ts",   desc: "localStorage tx log" },
                  { name: "tokens.ts",     desc: "Token styling helpers" },
                  { name: "abi.ts",        desc: "RupiahRouter ABI" },
                  { name: "xp.ts",         desc: "XP reward system" },
                  { name: "utils.ts",      desc: "Tailwind cn() merge" },
                  { name: "i18n/",         desc: "EN · ID · ZH translations", folder: true },
                ].map((l) => (
                  <div key={l.name} className="flex items-start gap-1.5 px-1.5 py-1 rounded"
                    style={{ background: l.folder ? "rgba(6,182,212,0.08)" : "transparent" }}>
                    <span className="text-[9px] shrink-0 mt-px">{l.folder ? "📂" : "🔧"}</span>
                    <div className="min-w-0">
                      <div className="text-[8px] font-mono font-semibold truncate" style={{ color: l.folder ? "#22d3ee" : "#a5b4fc" }}>{l.name}</div>
                      <div className="text-[7px] text-muted leading-tight">{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* public/ */}
            <div className="rounded-xl px-3 py-2.5 flex items-center gap-3" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <span className="text-sm">🖼️</span>
              <div>
                <div className="text-[10px] font-mono font-bold text-green">public/</div>
                <div className="text-[9px] text-muted">Static assets · logos · token icons</div>
              </div>
            </div>

          </div>
        </div>
      </div>

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
