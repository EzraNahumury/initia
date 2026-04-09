import { Mermaid } from "../components/Mermaid";

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
      <Mermaid chart={`graph TB
        subgraph Layout["Root Layout"]
          BG["BackgroundEffect<br/>FaultyTerminal WebGL"]
          Providers["WagmiProvider + QueryClient"]
        end

        subgraph Pages["Feature Pages"]
          Home["/ Swap + HeroSection"]
          Limit["/limit LimitOrderCard"]
          Batch["/batch BatchSwapCard"]
          Bridge["/bridge BridgeCard"]
          Send["/send SendCard"]
          FaucetP["/faucet FaucetCard"]
          Dash["/dashboard DashboardView"]
        end

        Layout --> Pages
      `} />

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
