import { ParticleBackground } from "./components/ParticleBackground";

export default function IntroductionPage() {
  return (
    <article className="prose">
      {/* Banner */}
      <div className="not-prose rounded-2xl border border-border overflow-hidden mb-8 relative"
        style={{ background: "linear-gradient(135deg, rgba(15,15,35,0.97) 0%, rgba(10,10,26,0.99) 50%, rgba(20,15,40,0.97) 100%)" }}>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Particle canvas */}
          <ParticleBackground />

          {/* Gradient orbs */}
          <div className="absolute w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(159,41,255,0.18) 0%, transparent 70%)", top: "-35%", right: "-8%", animation: "floatUp 9s ease-in-out infinite" }} />
          <div className="absolute w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", bottom: "-25%", left: "-6%", animation: "floatUp 12s ease-in-out infinite 3s" }} />
          <div className="absolute w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,180,220,0.10) 0%, transparent 70%)", top: "10%", left: "30%", animation: "floatUp 7s ease-in-out infinite 1s" }} />

          {/* Scan line */}
          <div className="absolute left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(159,41,255,0.3), transparent)", animation: "scanDown 6s linear infinite", top: 0 }} />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-12 text-center">
          <img src="/logo.png" alt="RupiahRoute" className="w-20 h-20 mx-auto mb-6 rounded-full object-contain"
            style={{ filter: "drop-shadow(0 0 20px rgba(159,41,255,0.4))" }} />
          <h1 className="text-2xl font-bold text-foreground mb-2"
            style={{ textShadow: "0 0 20px rgba(159,41,255,0.4)" }}>RupiahRoute</h1>
          <p className="text-sm text-purple-light font-medium mb-5 uppercase tracking-widest">Smart DeFi Router on Initia</p>
          <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">
            One interface, one click, best route. The engine handles pool selection, multi-hop routing,
            cross-chain bridging, and execution on an Initia EVM appchain with near-zero gas fees.
          </p>
          <div className="flex items-center justify-center gap-3 mt-7">
            <a href="/quickstart" className="px-6 py-2.5 rounded-lg bg-purple text-sm font-medium hover:bg-purple-light transition-colors"
              style={{ color: "#ffffff", boxShadow: "0 0 15px rgba(159,41,255,0.3)", textShadow: "1px 1px 0 rgba(0,0,0,0.4)", textDecoration: "none" }}>
              Quick Start
            </a>
            <a href="/architecture" className="px-6 py-2.5 rounded-lg border border-purple/30 text-sm hover:border-purple/50 transition-colors"
              style={{ color: "#e0d0ff", textDecoration: "none" }}>
              Architecture
            </a>
          </div>
        </div>
      </div>

      <h2>What is RupiahRoute?</h2>
      <p>
        RupiahRoute is a <strong>smart routing engine</strong> that runs as its own Initia EVM appchain (L2).
        It automatically finds the optimal swap path (direct pool, multi-hop, or cross-chain) so users
        never have to manually compare DEXs, choose pools, or worry about bridge fees.
      </p>
      <p>
        Think of it as <strong>Google Maps for DeFi</strong>: enter your starting token and destination token,
        and the router figures out the cheapest and fastest route.
      </p>

      <h2>Key Features</h2>
      <table>
        <thead>
          <tr><th>Feature</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Smart Swap</strong></td><td>Auto-routing with live comparison against 4 external DEX aggregators</td></tr>
          <tr><td><strong>Limit Orders</strong></td><td>Set target price with expiry, auto-executes on-chain when price is reached</td></tr>
          <tr><td><strong>Batch Swap</strong></td><td>Rebalance portfolio across multiple tokens in a single atomic transaction</td></tr>
          <tr><td><strong>Bridge</strong></td><td>Seamless deposit/withdraw between Initia L1 and the RupiahRoute appchain</td></tr>
          <tr><td><strong>Send to Username</strong></td><td>Transfer tokens using .init usernames instead of hex addresses</td></tr>
          <tr><td><strong>Dashboard</strong></td><td>Live portfolio balances, activity history, and transaction breakdown</td></tr>
          <tr><td><strong>Faucet</strong></td><td>Claim testnet tokens with balance tracking</td></tr>
        </tbody>
      </table>

      <h2>Why Initia?</h2>
      <p>
        Initia provides the ideal infrastructure for a DeFi router:
      </p>
      <ul>
        <li><strong>L2 Appchain:</strong> 100ms block times, near-zero gas fees. Every swap costs fractions of a cent.</li>
        <li><strong>Interwoven Bridge:</strong> Native L1-L2 token transfers without third-party bridges.</li>
        <li><strong>Cosmos Precompiles:</strong> On-chain username resolution (.init), oracle price feeds (Slinky), and IBC interoperability directly from EVM contracts.</li>
        <li><strong>MiniEVM:</strong> Full EVM compatibility means standard Solidity tooling (Foundry, wagmi, viem) works out of the box.</li>
      </ul>

      <h2>Supported Tokens</h2>
      <table>
        <thead>
          <tr><th>Token</th><th>Type</th><th>Decimals</th></tr>
        </thead>
        <tbody>
          <tr><td>INIT</td><td>Native (Initia)</td><td>18</td></tr>
          <tr><td>USDC</td><td>Stablecoin (USD)</td><td>6</td></tr>
          <tr><td>WETH</td><td>Wrapped Ether</td><td>18</td></tr>
          <tr><td>TIA</td><td>Celestia</td><td>6</td></tr>
          <tr><td>IDRX</td><td>Stablecoin (IDR)</td><td>2</td></tr>
          <tr><td>GAS</td><td>Native gas token</td><td>18</td></tr>
        </tbody>
      </table>

      <h2>Project Structure</h2>

      <div className="not-prose rounded-xl overflow-hidden my-5" style={{ background: "rgba(12,12,28,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>

        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "rgba(159,41,255,0.08)", borderBottom: "1px solid rgba(139,92,246,0.18)" }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.6)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.6)" }} />
          </div>
          <span className="text-[11px] font-mono font-bold text-purple-light ml-1">initia/</span>
          <span className="text-[10px] font-mono text-muted">— monorepo root</span>
        </div>

        {/* Three repo cards */}
        <div className="grid grid-cols-3 gap-0 divide-x" style={{ borderColor: "rgba(139,92,246,0.15)" }}>

          {/* fe_rupiahrote */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                ⚡
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-foreground">fe_rupiahrote/</div>
                <div className="text-[9px] text-muted">Frontend</div>
              </div>
            </div>
            <div className="text-[9px] font-mono text-muted px-1">Next.js 16 · wagmi · Tailwind</div>
            <div className="space-y-1">
              {[
                { path: "app/",        desc: "Pages & routes" },
                { path: "components/", desc: "25+ React components" },
                { path: "lib/",        desc: "Logic, contracts, i18n" },
              ].map((item) => (
                <div key={item.path} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "rgba(99,102,241,0.7)" }} />
                  <div>
                    <div className="text-[10px] font-mono text-purple-light">{item.path}</div>
                    <div className="text-[9px] text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-muted font-mono">
              {["swap", "limit", "batch", "bridge", "send", "faucet", "dashboard"].map((p) => (
                <span key={p} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)", color: "#93c5fd" }}>/{p}</span>
              ))}
            </div>
          </div>

          {/* sc_RupiahRote */}
          <div className="p-4 space-y-3" style={{ borderLeft: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(159,41,255,0.15)", border: "1px solid rgba(159,41,255,0.25)" }}>
                🔗
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-foreground">sc_RupiahRote/</div>
                <div className="text-[9px] text-muted">Smart Contracts</div>
              </div>
            </div>
            <div className="text-[9px] font-mono text-muted px-1">Foundry · Solidity · EVM</div>
            <div className="space-y-1">
              {[
                { path: "src/",    desc: "RupiahRouter, TokenFaucet" },
                { path: "script/", desc: "Deployment scripts" },
                { path: "test/",   desc: "Test suite" },
              ].map((item) => (
                <div key={item.path} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(159,41,255,0.06)", border: "1px solid rgba(159,41,255,0.1)" }}>
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "rgba(159,41,255,0.7)" }} />
                  <div>
                    <div className="text-[10px] font-mono text-purple-light">{item.path}</div>
                    <div className="text-[9px] text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg px-2.5 py-2 space-y-0.5" style={{ background: "rgba(159,41,255,0.06)", border: "1px solid rgba(159,41,255,0.1)" }}>
              {["RupiahRouter.sol", "TokenFaucet.sol", "interfaces/"].map((f) => (
                <div key={f} className="text-[9px] font-mono" style={{ color: "#b44dff" }}>· {f}</div>
              ))}
            </div>
          </div>

          {/* docs_rupiahrote */}
          <div className="p-4 space-y-3" style={{ borderLeft: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
                📖
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-foreground">docs_rupiahrote/</div>
                <div className="text-[9px] text-muted">Documentation</div>
              </div>
            </div>
            <div className="text-[9px] font-mono text-muted px-1">Next.js 16 · Tailwind v4</div>
            <div className="space-y-1">
              {[
                { path: "app/",        desc: "Doc pages & routes" },
                { path: "components/", desc: "Header, Sidebar, TOC" },
              ].map((item) => (
                <div key={item.path} className="flex items-start gap-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "rgba(34,197,94,0.7)" }} />
                  <div>
                    <div className="text-[10px] font-mono text-green">{item.path}</div>
                    <div className="text-[9px] text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg px-2.5 py-2 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
              <div className="text-[9px] font-mono text-green">← you are here</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
