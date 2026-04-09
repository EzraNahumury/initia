export default function IntroductionPage() {
  return (
    <article className="prose">
      {/* Banner */}
      <div className="not-prose rounded-2xl border border-border overflow-hidden mb-8 relative"
        style={{ background: "linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(10,10,26,0.98) 50%, rgba(20,15,40,0.95) 100%)" }}>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(159,41,255,0.4) 0%, transparent 70%)", top: "-30%", right: "-10%", animation: "floatUp 8s ease-in-out infinite" }} />
          <div className="absolute w-48 h-48 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)", bottom: "-20%", left: "-5%", animation: "floatUp 10s ease-in-out infinite 2s" }} />

          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <line x1="10%" y1="20%" x2="35%" y2="70%" stroke="#9f29ff" strokeWidth="0.5" style={{ animation: "pulseOpacity 4s ease-in-out infinite" }} />
            <line x1="35%" y1="70%" x2="60%" y2="25%" stroke="#9f29ff" strokeWidth="0.5" style={{ animation: "pulseOpacity 4s ease-in-out infinite 1s" }} />
            <line x1="60%" y1="25%" x2="85%" y2="60%" stroke="#9f29ff" strokeWidth="0.5" style={{ animation: "pulseOpacity 4s ease-in-out infinite 2s" }} />
            <line x1="85%" y1="60%" x2="95%" y2="30%" stroke="#9f29ff" strokeWidth="0.5" style={{ animation: "pulseOpacity 5s ease-in-out infinite 0.5s" }} />
          </svg>

          {/* Dots */}
          {[
            { x: "10%", y: "20%", d: "3s" }, { x: "35%", y: "70%", d: "4s" },
            { x: "60%", y: "25%", d: "5s" }, { x: "85%", y: "60%", d: "3.5s" },
            { x: "20%", y: "45%", d: "6s" }, { x: "75%", y: "40%", d: "4.5s" },
          ].map((dot, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-purple-light/40"
              style={{ left: dot.x, top: dot.y, animation: `twinkle ${dot.d} ease-in-out infinite` }} />
          ))}
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
      <pre><code>{`initia/
├── fe_rupiahrote/      # Frontend: Next.js 16 web app
│   ├── app/            # Pages (swap, limit, batch, bridge, send, faucet, dashboard)
│   ├── components/     # 25+ React components
│   └── lib/            # Business logic, contracts, i18n
│
├── sc_RupiahRote/      # Smart Contracts: Foundry/Solidity
│   ├── src/            # RupiahRouter, TokenFaucet, interfaces
│   ├── script/         # Deployment scripts
│   └── test/           # Test suite
│
└── docs_rupiahrote/    # This documentation site`}</code></pre>
    </article>
  );
}
