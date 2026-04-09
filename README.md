# RupiahRoute

**Smart DeFi Router on Initia**

One interface, one click. Input token A, output token B — the engine finds the best route, cheapest gas, and executes everything on an Initia EVM appchain with near-zero fees.

```mermaid
graph LR
    User["User"] -->|"1 click"| RR["RupiahRoute"]
    RR -->|"find best path"| Routes{{"Direct Pool\nMulti-hop\nCross-chain"}}
    Routes --> Result["Best Rate\n+ Near-zero Gas"]

    style RR fill:#9f29ff,color:#fff,stroke:#b44dff
    style Result fill:#22c55e,color:#fff
```

## What is RupiahRoute?

RupiahRoute is a **smart routing engine** running as its own Initia EVM appchain (L2). It automatically finds the optimal swap path — direct, multi-hop, or cross-chain — so users never have to think about which DEX, which pool, or which bridge to use.

Think of it as **Google Maps for DeFi**: enter your starting token and destination token, and the router handles the rest.

## Why Initia?

| Feature | Benefit |
|---------|---------|
| **L2 Appchain** | 100ms blocks, near-zero gas fees |
| **Interwoven Bridge** | Seamless L1-L2 token transfers |
| **Cosmos Precompiles** | On-chain username resolution (.init), oracle price feeds |
| **MiniEVM** | Full EVM compatibility with Cosmos interoperability |

## Features

```mermaid
graph TB
    subgraph Core["Core Trading"]
        Swap["Smart Swap<br/>Auto-routing with<br/>live rate comparison"]
        Limit["Limit Orders<br/>Set target price,<br/>auto-executes on-chain"]
        Batch["Batch Swap<br/>Rebalance portfolio<br/>in 1 transaction"]
    end

    subgraph Infra["Infrastructure"]
        Bridge["Bridge<br/>Deposit/Withdraw<br/>between L1 and L2"]
        Send["Send<br/>Transfer tokens to<br/>.init usernames"]
        Faucet["Faucet<br/>Claim testnet tokens"]
    end

    subgraph Insight["Insights"]
        Dashboard["Dashboard<br/>Portfolio, activity,<br/>transaction breakdown"]
        Routes["Route Comparison<br/>Initia routes vs<br/>4 external DEXs"]
    end
```

| Feature | Description |
|---------|-------------|
| **Smart Swap** | Compares direct pool, multi-hop, and cross-chain routes. Live comparison against 4 external DEX aggregators (LiFi, OpenOcean, KyberSwap, ParaSwap). |
| **Limit Orders** | Set a target price with expiry. Order auto-executes when price is reached. Fully on-chain with keeper pattern. |
| **Batch Swap** | Allocate percentages to multiple target tokens. One transaction, atomic execution. |
| **Bridge** | Move tokens between Initia L1 and the RupiahRoute appchain via Interwoven Bridge. |
| **Send to Username** | Send tokens using .init usernames instead of hex addresses. Resolved on-chain via Cosmos precompile. |
| **Dashboard** | Live portfolio balances, transaction history with per-type details, activity breakdown. |
| **Faucet** | Testnet token claims with live balance tracking and animated feedback. |

## Architecture

```mermaid
graph TB
    subgraph Frontend["fe_rupiahrote — Web Interface"]
        Next["Next.js 16 + TypeScript"]
        Wagmi["wagmi + viem<br/>wallet connection"]
        TQ["React Query<br/>data fetching"]
        UI["Tailwind v4 + shadcn<br/>cyberpunk retro theme"]
    end

    subgraph Contracts["sc_RupiahRote — Smart Contracts"]
        Router["RupiahRouter.sol<br/>AMM + routing + limits + batch"]
        FaucetC["TokenFaucet.sol<br/>faucet + swap + bridge sim"]
        Tokens["MockERC20<br/>INIT, USDC, WETH, TIA, IDRX"]
    end

    subgraph Initia["Initia Network"]
        MiniEVM["MiniEVM Appchain<br/>100ms blocks"]
        L1["Initia L1<br/>settlement layer"]
        Oracle["Slinky Oracle<br/>price feeds"]
        Cosmos["Cosmos Precompile<br/>username resolution"]
    end

    subgraph External["External APIs"]
        CG["CoinGecko<br/>live prices"]
        DEX["DEX Aggregators<br/>LiFi, OpenOcean,<br/>KyberSwap, ParaSwap"]
    end

    Frontend -->|"read/write"| Contracts
    Contracts --> MiniEVM
    MiniEVM -->|"settle"| L1
    Router --> Oracle
    Router --> Cosmos
    Frontend -.->|"price feeds"| CG
    Frontend -.->|"live quotes"| DEX
```

## Project Structure

```
initia/
├── fe_rupiahrote/          # Frontend — Next.js web app
│   ├── app/                # Pages (swap, limit, batch, bridge, send, faucet, dashboard)
│   ├── components/         # 25+ React components
│   ├── lib/                # Business logic, contracts, i18n
│   └── README.md           # Frontend documentation
│
├── sc_RupiahRote/          # Smart Contracts — Foundry/Solidity
│   ├── src/                # RupiahRouter, TokenFaucet, interfaces, mocks
│   ├── script/             # Deployment scripts
│   ├── test/               # Test suite
│   └── README.md           # Contract documentation
│
└── README.md               # This file
```

| Folder | What | README |
|--------|------|--------|
| [`fe_rupiahrote/`](./fe_rupiahrote/) | Next.js frontend with wallet integration, route comparison, i18n | [Frontend README](./fe_rupiahrote/README.md) |
| [`sc_RupiahRote/`](./sc_RupiahRote/) | Solidity contracts — AMM, router, limit orders, faucet | [Contract README](./sc_RupiahRote/README.md) |

## Quick Start

### 1. Start Initia Local Node

```bash
# Start Initia MiniEVM rollup
weave start
```

### 2. Deploy Smart Contracts

```bash
cd sc_RupiahRote

# Deploy router
forge script script/RupiahRouter.s.sol \
  --rpc-url http://localhost:8545 --private-key $DEPLOYER_KEY \
  --broadcast --legacy

# Deploy faucet
forge script script/TokenFaucet.s.sol \
  --rpc-url http://localhost:8545 --private-key $DEPLOYER_KEY \
  --broadcast --legacy

# Setup pools + seed liquidity
forge script script/SetupPools.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast --legacy
```

### 3. Start Frontend

```bash
cd fe_rupiahrote

# Configure .env.local with deployed addresses
cp .env.example .env.local

npm install
npm run dev
# Open http://localhost:3000
```

## Supported Tokens

| Token | Type | Description |
|-------|------|-------------|
| INIT | Native | Initia network token |
| USDC | Stablecoin | USD-pegged stablecoin |
| WETH | Wrapped | Wrapped Ether |
| TIA | Cross-chain | Celestia token |
| IDRX | Stablecoin | Indonesian Rupiah stablecoin |
| GAS | Native | Appchain gas token |

## How It Works

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant SC as Smart Contract
    participant Pool as Liquidity Pool

    User->>UI: Select tokens + enter amount
    UI->>SC: findBestRoute(tokenIn, tokenOut, amount)
    SC-->>UI: Best path (direct / multi-hop)
    UI->>UI: Compare vs external DEX quotes
    UI-->>User: Show all routes ranked

    User->>UI: Confirm swap
    UI->>SC: swap(tokenIn, tokenOut, amount)
    SC->>Pool: Execute with 0.3% fee
    Pool-->>SC: Output tokens
    SC-->>UI: Transaction confirmed
    UI-->>User: Success + balance update
```

## Languages

The interface supports three languages, switchable via dropdown in the header:

- **English** (default)
- **Indonesian** (Bahasa Indonesia)
- **Chinese Simplified** (simplified Chinese with English DeFi terms preserved)

## License

MIT
