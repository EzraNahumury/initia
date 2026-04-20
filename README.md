<div align="center">

# RupiahRoute

**The Smart DeFi Router on Initia — One Click. Best Route. Zero Hassle.**

A unified on-chain routing engine that discovers the optimal path for any swap —
direct pool, multi-hop, or cross-chain — and executes it on an Initia EVM
appchain with 100&nbsp;ms blocks and near-zero gas.

[Launch App](https://rupiahroute-apps.vercel.app/) &nbsp;•&nbsp;
[Documentation](https://docsrupiahroute.vercel.app/) &nbsp;•&nbsp;
[Landing Page](./landing_page_rp/)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Why Initia?](#why-initia)
3. [Monorepo Layout](#monorepo-layout)
4. [System Architecture](#system-architecture)
5. [User Journey](#user-journey)
6. [Feature Matrix](#feature-matrix)
7. [Supported Tokens](#supported-tokens)
8. [Quick Start](#quick-start)
9. [Deployment Topology](#deployment-topology)
10. [Internationalization](#internationalization)
11. [License](#license)

---

## Overview

RupiahRoute solves one of the oldest pains in DeFi: **choosing the right venue**.
Instead of forcing users to compare DEXs, aggregate quotes, and manage slippage,
RupiahRoute abstracts the entire routing layer behind a single clean interface.

Think of it as **Google Maps for DeFi** — pick a start token, pick an end token,
and the router finds the fastest, cheapest path automatically.

```mermaid
flowchart LR
    U([User]) -->|"tokenIn + amount"| RR{{RupiahRoute<br/>Engine}}
    RR --> R1["Direct Pool"]
    RR --> R2["Multi-hop (≤3)"]
    RR --> R3["Cross-chain Route"]
    R1 & R2 & R3 --> Best[["Best Rate<br/>+ Near-zero Gas"]]
    Best --> Out([tokenOut])

    classDef core fill:#9f29ff,color:#fff,stroke:#b44dff,stroke-width:2px
    classDef good fill:#22c55e,color:#fff,stroke:#16a34a
    class RR core
    class Best good
```

---

## Why Initia?

RupiahRoute is not a generic L1 dApp — it is deployed as its own **MiniEVM
appchain** (an Initia Rollup) for maximum throughput, deterministic settlement
on Initia L1, and seamless Cosmos interoperability.

| Layer | Capability | What it Unlocks |
|------|------------|-----------------|
| **MiniEVM Appchain** | 100 ms blocks, EVM-equivalent | Uniswap-class UX with no MEV tax |
| **Interwoven Bridge** | Native L1 ↔ L2 messaging | 1-click deposits / withdrawals |
| **Cosmos Precompiles** | `0x00…f1` address module | Resolve `.init` usernames on-chain |
| **Slinky Oracle** | `0x031E…b72F` price feeds | Trustless USD pricing for limit orders |
| **Shared Security** | Settles to Initia L1 | Inherits L1 finality + validator set |

---

## Monorepo Layout

The project is split into **four independent but cohesive packages** plus a
root workspace.

```mermaid
graph TB
    subgraph Repo["initia/ (monorepo root)"]
        direction TB
        LP["landing_page_rp/<br/><i>Marketing site</i><br/>Next.js + R3F + GSAP"]
        FE["fe_rupiahrote/<br/><i>The dApp</i><br/>Next.js + wagmi + viem"]
        DOCS["docs_rupiahrote/<br/><i>Developer docs</i><br/>Next.js + Mermaid"]
        SC["sc_RupiahRote/<br/><i>Smart contracts</i><br/>Solidity + Foundry"]
    end

    LP -->|"Launch App"| FE
    LP -->|"Learn more"| DOCS
    FE -->|"read / write"| SC
    DOCS -->|"documents"| SC
    DOCS -->|"documents"| FE

    classDef pkg fill:#1a1033,color:#fff,stroke:#9f29ff,stroke-width:2px
    class LP,FE,DOCS,SC pkg
```

| Package | Purpose | Stack | README |
|---------|---------|-------|--------|
| [`landing_page_rp/`](./landing_page_rp/) | Public marketing site, animated 3D hero, launch CTA | Next.js 16 · Three.js · GSAP · Framer Motion | [↗](./landing_page_rp/README.md) |
| [`fe_rupiahrote/`](./fe_rupiahrote/) | The production dApp — swap, limit, batch, bridge, send, faucet, dashboard | Next.js 16 · wagmi · viem · Tailwind v4 | [↗](./fe_rupiahrote/README.md) |
| [`docs_rupiahrote/`](./docs_rupiahrote/) | Developer documentation with Mermaid diagrams and code samples | Next.js 16 · Mermaid · Prism | [↗](./docs_rupiahrote/README.md) |
| [`sc_RupiahRote/`](./sc_RupiahRote/) | On-chain contracts — AMM, router, limit orders, faucet | Solidity 0.8.24 · Foundry | [↗](./sc_RupiahRote/README.md) |

---

## System Architecture

```mermaid
graph TB
    subgraph Visitors["User Entry Points"]
        V1[🌐 Marketing visitor]
        V2[👩‍💻 Developer]
        V3[📈 Trader]
    end

    subgraph L1["Presentation Layer"]
        LPAGE["landing_page_rp<br/>rupiahroute.com"]
        APP["fe_rupiahrote<br/>rupiahroute-apps.vercel.app"]
        DSITE["docs_rupiahrote<br/>docsrupiahroute.vercel.app"]
    end

    subgraph L2["Application Logic"]
        WAGMI["wagmi + viem<br/>wallet · chain · RPC"]
        RQ["React Query<br/>cache + refetch"]
        I18N["i18next<br/>EN / ID / ZH"]
        DEX["DEX Aggregator Clients<br/>LiFi · OpenOcean<br/>KyberSwap · ParaSwap"]
        CG["CoinGecko<br/>live USD prices"]
    end

    subgraph L3["On-chain Layer (Initia MiniEVM)"]
        ROUTER["RupiahRouter.sol<br/>AMM + Routing + Limits + Batch"]
        FAUCET["TokenFaucet.sol<br/>Testnet utility hub"]
        MOCKS["MockERC20 x5<br/>INIT · USDC · WETH · TIA · IDRX"]
    end

    subgraph L4["Initia Network Services"]
        ORACLE["Slinky Oracle<br/>Precompile 0x031E…"]
        COSMOS["Cosmos Module<br/>Precompile 0x00…f1"]
        L1CHAIN["Initia L1<br/>Settlement + Validators"]
    end

    V1 --> LPAGE
    V2 --> DSITE
    V3 --> APP
    LPAGE -.-> APP
    LPAGE -.-> DSITE

    APP --> WAGMI
    APP --> RQ
    APP --> I18N
    APP --> DEX
    APP --> CG

    WAGMI --> ROUTER
    WAGMI --> FAUCET
    ROUTER --> MOCKS
    FAUCET --> MOCKS
    ROUTER --> ORACLE
    ROUTER --> COSMOS
    FAUCET --> ORACLE

    ROUTER --> L1CHAIN
    FAUCET --> L1CHAIN

    classDef user fill:#1a1033,color:#9f29ff,stroke:#9f29ff
    classDef app fill:#2a1a4a,color:#fff,stroke:#9f29ff,stroke-width:2px
    classDef chain fill:#0d1f3c,color:#22d3ee,stroke:#22d3ee
    classDef external fill:#3a2a1a,color:#fbbf24,stroke:#fbbf24
    class V1,V2,V3 user
    class LPAGE,APP,DSITE app
    class ROUTER,FAUCET,MOCKS chain
    class ORACLE,COSMOS,L1CHAIN,DEX,CG external
```

---

## User Journey

```mermaid
sequenceDiagram
    actor U as User
    participant LP as Landing Page
    participant APP as dApp (fe_rupiahrote)
    participant W as Wallet
    participant R as RupiahRouter
    participant P as Liquidity Pool

    U->>LP: Visit rupiahroute.com
    LP-->>U: Hero + story + tokens
    U->>LP: Click "Launch App"
    LP-->>APP: Redirect

    U->>APP: Connect Wallet
    APP->>W: Request accounts
    W-->>APP: Address + signer

    U->>APP: Choose tokenIn / tokenOut / amount
    APP->>R: getQuote() + findBestRoute()
    APP->>APP: Compare vs 4 external DEXs
    APP-->>U: Ranked routes with prices

    U->>APP: Confirm swap
    APP->>W: Sign transaction
    W->>R: swap(tokenIn, tokenOut, amountIn, minOut)
    R->>P: Apply x*y=k, deduct 0.3% fee
    P-->>R: tokenOut
    R-->>W: Transfer to user
    APP-->>U: ✨ Success + activity logged
```

---

## Feature Matrix

```mermaid
mindmap
  root((RupiahRoute))
    Trading
      Smart Swap
        Auto-routing
        Live 4-DEX comparison
        Slippage control
      Limit Orders
        On-chain placement
        Keeper execution
        Expiry enforcement
      Batch Swap
        Portfolio rebalance
        Atomic execution
        % allocation model
    Infrastructure
      Bridge
        L1 to Appchain
        Appchain to L1
      Send
        .init usernames
        Hex addresses
      Faucet
        5 test tokens
        Live balance UI
    Insights
      Dashboard
        Portfolio
        TX history
        Activity stats
      Route Display
        Hop breakdown
        Gas estimate
        Protocol badges
```

| Feature | Surface | Backed By |
|---------|---------|-----------|
| **Smart Swap** | `/` | `RupiahRouter.findBestRoute` + `executeRoute` |
| **Limit Orders** | `/limit` | `RupiahRouter.placeLimitOrder` (oracle-priced) |
| **Batch Swap** | `/batch` | `RupiahRouter.batchSwap` (atomic multi-leg) |
| **Bridge** | `/bridge` | Interwoven Bridge + `TokenFaucet` simulation |
| **Send to Username** | `/send` | Cosmos precompile `0x00…f1` |
| **Dashboard** | `/dashboard` | On-chain reads + localStorage activity log |
| **Faucet** | `/faucet` | `TokenFaucet.claimToken` |

---

## Supported Tokens

| Symbol | Type | Decimals | Notes |
|--------|------|----------|-------|
| **INIT** | Native | 18 | Initia network token |
| **USDC** | Stablecoin | 6 | USD-pegged |
| **WETH** | Wrapped | 18 | Wrapped Ether |
| **TIA** | Cross-chain | 6 | Celestia token |
| **IDRX** | Stablecoin | 2 | Indonesian Rupiah stablecoin |
| **GAS** | Native | 18 | Appchain gas token |

---

## Quick Start

> **Prerequisites:** Node.js ≥ 20, pnpm/npm, Foundry (`forge`, `anvil`), and the
> [Initia Weave](https://docs.initia.xyz/) CLI for the local rollup.

### 1. Clone & install

```bash
git clone <repo-url> initia
cd initia
```

### 2. Boot the local Initia MiniEVM rollup

```bash
weave start
```

> The rollup exposes RPC at `http://localhost:8545`.

### 3. Deploy the smart contracts

```bash
cd sc_RupiahRote

forge script script/RupiahRouter.s.sol  --rpc-url http://localhost:8545 --private-key $DEPLOYER_KEY --broadcast --legacy
forge script script/TokenFaucet.s.sol   --rpc-url http://localhost:8545 --private-key $DEPLOYER_KEY --broadcast --legacy
forge script script/SetupPools.s.sol    --rpc-url http://localhost:8545 --broadcast --legacy
```

### 4. Run the dApp

```bash
cd ../fe_rupiahrote
cp .env.example .env.local   # fill in deployed addresses
npm install
npm run dev                  # → http://localhost:3000
```

### 5. (Optional) Run the landing page & docs

```bash
cd ../landing_page_rp && npm install && npm run dev    # → :3000
cd ../docs_rupiahrote && npm install && npm run dev    # → :3000
```

```mermaid
flowchart LR
    A[git clone] --> B[weave start]
    B --> C[forge deploy<br/>router + faucet + pools]
    C --> D[npm run dev<br/>fe_rupiahrote]
    D --> E[🚀 localhost:3000]

    classDef step fill:#9f29ff,color:#fff,stroke:#b44dff
    classDef done fill:#22c55e,color:#fff
    class A,B,C,D step
    class E done
```

---

## Deployment Topology

```mermaid
graph LR
    subgraph Prod["Production (Vercel)"]
        V1[landing_page_rp<br/>rupiahroute.com]
        V2[fe_rupiahrote<br/>rupiahroute-apps.vercel.app]
        V3[docs_rupiahrote<br/>docsrupiahroute.vercel.app]
    end

    subgraph Chain["Initia Rollup"]
        N[MiniEVM Node<br/>settles to Initia L1]
        C1[RupiahRouter]
        C2[TokenFaucet]
    end

    V2 -- RPC / JSON-RPC --> N
    N --> C1
    N --> C2

    classDef deploy fill:#0f172a,color:#38bdf8,stroke:#38bdf8
    classDef onchain fill:#1a1033,color:#a78bfa,stroke:#a78bfa
    class V1,V2,V3 deploy
    class N,C1,C2 onchain
```

---

## Internationalization

The dApp UI ships with three languages out of the box:

| Code | Language | Notes |
|------|----------|-------|
| `en` | English | Default |
| `id` | Bahasa Indonesia | Full translation |
| `zh` | 中文 (Simplified) | CJK font stack, DeFi terms kept in English |

Translation files live in [`fe_rupiahrote/lib/i18n/`](./fe_rupiahrote/lib/i18n/).

---

## License

MIT © RupiahRoute contributors.
