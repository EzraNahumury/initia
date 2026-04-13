import {
  ArrowRightLeft,
  BarChart3,
  Droplets,
  Orbit,
  Plug,
  Send,
  TrendingUp,
  Waypoints,
  Workflow,
} from "lucide-react";
import { Mermaid } from "../components/Mermaid";

const rootLayoutCards = [
  { name: "BackgroundEffect", description: "FaultyTerminal - WebGL canvas", icon: Orbit },
  { name: "Providers", description: "WagmiProvider - QueryClient", icon: Plug },
];

const featurePages = [
  { route: "/", component: "SwapView", label: "Swap + HeroSection", icon: ArrowRightLeft, color: "99,102,241" },
  { route: "/limit", component: "LimitOrderCard", label: "Limit Orders", icon: BarChart3, color: "139,92,246" },
  { route: "/batch", component: "BatchSwapCard", label: "Batch Swap", icon: Workflow, color: "245,158,11" },
  { route: "/bridge", component: "BridgeCard", label: "L1 <-> L2 Bridge", icon: Waypoints, color: "6,182,212" },
  { route: "/send", component: "SendCard", label: "Send Tokens", icon: Send, color: "34,197,94" },
  { route: "/faucet", component: "FaucetCard", label: "Testnet Faucet", icon: Droplets, color: "249,115,22" },
  { route: "/dashboard", component: "DashboardView", label: "Portfolio + Stats", icon: TrendingUp, color: "159,41,255" },
];

export default function ArchitecturePage() {
  return (
    <article className="prose">
      <h1>Architecture</h1>
      <p>
        RupiahRoute is a full-stack DeFi application with three layers: smart contracts on Initia MiniEVM,
        a Next.js frontend, and integration with external APIs for live market data.
      </p>

      <h2>System Overview</h2>
      <Mermaid chart={`graph TB
        subgraph Browser["User Browser"]
          FE["Next.js 16 Frontend<br/>wagmi + React Query + Tailwind v4"]
        end

        subgraph Chain["Initia MiniEVM (L2 Appchain)"]
          Router["RupiahRouter<br/>AMM + Routing + Limits"]
          Faucet["TokenFaucet<br/>Faucet + Swap + Bridge"]
          Tokens["ERC20 Tokens<br/>INIT, USDC, WETH, TIA, IDRX"]
          Precompiles["Cosmos Precompile + Slinky Oracle"]
        end

        subgraph External["External APIs"]
          CG["CoinGecko<br/>Live Prices"]
          DEX["DEX Aggregators<br/>LiFi, OpenOcean,<br/>KyberSwap, ParaSwap"]
        end

        subgraph Settlement["Settlement"]
          L1["Initia L1"]
        end

        FE -->|"read/write via RPC"| Router
        FE -->|"read/write via RPC"| Faucet
        Router --> Tokens
        Faucet --> Tokens
        Router --> Precompiles
        FE -.->|"REST API"| CG
        FE -.->|"REST API"| DEX
        Chain -->|"settle"| L1
      `} />

      <h2>Data Flow: Swap</h2>
      <p>When a user performs a swap, data flows through multiple layers:</p>
      <Mermaid chart={`sequenceDiagram
        participant User
        participant Frontend
        participant CoinGecko
        participant DEX APIs
        participant TokenFaucet

        User->>Frontend: Enter amount + select tokens
        Frontend->>CoinGecko: Fetch live prices
        Frontend->>DEX APIs: Fetch external quotes (parallel)
        Frontend->>TokenFaucet: getQuote() on-chain
        Frontend-->>User: Display routes + comparison
        User->>Frontend: Select route + confirm
        Frontend->>TokenFaucet: swap(tokenIn, tokenOut, amount)
        TokenFaucet-->>Frontend: Transaction confirmed
        Frontend->>Frontend: Record to activity history
        Frontend-->>User: Success + balance update
      `} />

      <h2>Smart Contract Layer</h2>
      <p>Two main contracts serve different purposes:</p>
      <table>
        <thead><tr><th>Contract</th><th>Role</th><th>Used By</th></tr></thead>
        <tbody>
          <tr><td><strong>RupiahRouter</strong></td><td>Production AMM engine with pools, routing, limit orders, batch swaps</td><td>Future production deployment</td></tr>
          <tr><td><strong>TokenFaucet</strong></td><td>Testnet utility combining faucet, swap, bridge simulation, username registry</td><td>Current testnet frontend</td></tr>
        </tbody>
      </table>
      <p>
        The frontend currently interacts with <code>TokenFaucet</code> for all operations.
        <code>RupiahRouter</code> is the production-grade contract with real AMM pools and multi-hop routing.
      </p>

      <h2>Frontend Layer</h2>

      <div className="not-prose rounded-xl overflow-hidden my-5" style={{ background: "rgba(12,12,28,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>

        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "rgba(159,41,255,0.08)", borderBottom: "1px solid rgba(139,92,246,0.18)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.6)" }} />
          </div>
          <span className="text-[11px] font-mono font-bold text-purple-light ml-1">Frontend Layer</span>
          <span className="text-[10px] font-mono text-muted">Next.js 16 App Router</span>
        </div>

        <div className="p-6 space-y-4">

          {/* Root Layout box */}
          <div className="rounded-xl p-4" style={{ background: "rgba(159,41,255,0.06)", border: "1px solid rgba(159,41,255,0.25)" }}>
            <div className="text-[10px] font-mono font-bold text-purple-light mb-3 uppercase tracking-wider">Root Layout</div>
            <div className="grid grid-cols-2 gap-3">
              {rootLayoutCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.name}
                    className="rounded-lg p-3 space-y-1"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-purple-light" strokeWidth={1.8} />
                      <span className="text-[10px] font-mono font-semibold text-foreground">{card.name}</span>
                    </div>
                    <div className="text-[9px] text-muted pl-6">{card.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow connector */}
          <div className="flex flex-col items-center gap-0.5 py-1">
            <div className="w-px h-4" style={{ background: "rgba(159,41,255,0.4)" }} />
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
              <path d="M6 7L0.803848 0.25L11.1962 0.25L6 7Z" fill="rgba(159,41,255,0.6)" />
            </svg>
          </div>

          {/* Feature Pages */}
          <div className="rounded-xl p-4" style={{ background: "rgba(10,10,26,0.7)", border: "1px solid rgba(139,92,246,0.18)" }}>
            <div className="text-[10px] font-mono font-bold text-muted mb-3 uppercase tracking-wider">Feature Pages</div>
            <div className="grid grid-cols-2 gap-2">
              {featurePages.map((page) => {
                const Icon = page.icon;
                return (
                  <div
                    key={page.route}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                    style={{ background: `rgba(${page.color},0.07)`, border: `1px solid rgba(${page.color},0.2)` }}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.8}
                      style={{ color: `rgba(${page.color},0.96)` }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className="text-[10px] font-mono font-bold" style={{ color: `rgba(${page.color},1)` }}>{page.route}</code>
                      </div>
                      <div className="text-[9px] font-mono text-muted truncate">{page.component}</div>
                      <div className="text-[9px] text-muted opacity-70">{page.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <h2>State Management</h2>
      <table>
        <thead><tr><th>Type</th><th>Storage</th><th>What</th></tr></thead>
        <tbody>
          <tr><td>Wallet connection</td><td>sessionStorage (wagmi)</td><td>Connected wallet, connector ID</td></tr>
          <tr><td>User-connected flag</td><td>sessionStorage</td><td><code>rr_user_connected</code> prevents auto-connect</td></tr>
          <tr><td>Swap form state</td><td>sessionStorage</td><td>Token pair, amount, slippage. Persists across tab switches</td></tr>
          <tr><td>Activity history</td><td>localStorage</td><td>All transactions with per-type metadata</td></tr>
          <tr><td>Language preference</td><td>localStorage</td><td>EN, ID, or ZH</td></tr>
          <tr><td>Welcome seen</td><td>localStorage</td><td><code>rr_welcomed</code> skips welcome page on return</td></tr>
          <tr><td>On-chain data</td><td>React Query cache</td><td>Balances, quotes, pool data (auto-refreshing)</td></tr>
        </tbody>
      </table>
    </article>
  );
}
