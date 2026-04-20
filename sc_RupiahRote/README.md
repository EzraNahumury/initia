<div align="center">

# `sc_RupiahRote` — RupiahRoute Smart Contracts

**Solidity contracts powering the RupiahRoute routing engine on Initia MiniEVM.**
A single unified contract provides the AMM, the routing engine, limit orders
and batch swaps — with cross-VM hooks into Initia’s Cosmos precompiles.

[🔗 Frontend](../fe_rupiahrote/) &nbsp;•&nbsp;
[📘 Docs](https://docsrupiahroute.vercel.app/) &nbsp;•&nbsp;
[🏠 Landing](../landing_page_rp/)

</div>

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Contract Inventory](#contract-inventory)
3. [High-level Architecture](#high-level-architecture)
4. [Core Mechanics](#core-mechanics)
    - [AMM (x · y = k)](#amm-x--y--k)
    - [Smart Routing](#smart-routing)
    - [Limit Orders](#limit-orders)
    - [Batch Swap](#batch-swap)
    - [TokenFaucet (Testnet)](#tokenfaucet-testnet)
5. [Initia Precompiles](#initia-precompiles)
6. [Key Parameters](#key-parameters)
7. [Security Model](#security-model)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)
10. [Environment Variables](#environment-variables)
11. [Project Structure](#project-structure)

---

## Tech Stack

| Tool | Version |
|------|---------|
| Solidity | `0.8.24` |
| Framework | Foundry (Forge + Cast + Anvil) |
| EVM Target | `paris` (Initia MiniEVM-compatible) |
| Optimizer | enabled, 200 runs |
| Interfaces | `forge-std`, Initia Cosmos/Slinky precompiles |

---

## Contract Inventory

| Contract | Purpose | Size |
|----------|---------|------|
| **`RupiahRouter.sol`** | Core AMM + routing engine + limit orders + batch swap | ~1 file, monolithic by design |
| **`TokenFaucet.sol`** | Testnet utility hub: faucet + oracle-priced swap + bridge sim + username registry |  |
| **`MockERC20.sol`** | ERC20 with `mint` / `burn` for tests and seed liquidity |  |
| **`ICosmos.sol`** | Interface to the Initia Cosmos precompile (`0x00…f1`) |  |
| **`IConnectOracle.sol`** | Interface to the Slinky oracle precompile (`0x031E…b72F`) |  |

### Deployed Tokens (testnet)

| Symbol | Decimals | Faucet Amount | Notes |
|--------|----------|---------------|-------|
| INIT | 18 | 10,000 | Initia native |
| USDC | 6 | 10,000 | USD-pegged |
| WETH | 18 | 5 | Wrapped Ether |
| TIA | 6 | 10,000 | Celestia |
| IDRX | 2 | 100,000,000 | Indonesian Rupiah stablecoin |

---

## High-level Architecture

```mermaid
graph TB
    subgraph Router["RupiahRouter.sol"]
        direction TB
        AMM["AMM<br/>createPool · addLiquidity<br/>removeLiquidity · swap"]
        ROUTE["Routing Engine<br/>findBestRoute · executeRoute<br/>multiHopSwap · getQuote"]
        LIM["Limit Orders<br/>placeLimitOrder<br/>executeLimitOrder<br/>cancelLimitOrder"]
        BATCH["Batch Swap<br/>batchSwap (atomic)"]
    end

    subgraph Faucet["TokenFaucet.sol"]
        CLAIM["claimToken (1000 GAS)"]
        FSWAP["swap / batchSwap (500 GAS)"]
        BRG["bridgeDeposit / bridgeWithdraw (100 GAS)"]
        FLIM["placeLimitOrder / exec / cancel (500 GAS)"]
        USER["registerUsername<br/>sendToUsername (100 GAS)"]
    end

    subgraph Initia["Initia Precompiles"]
        COS["ICosmos 0x00…f1<br/>addr resolution · IBC"]
        ORA["IConnectOracle 0x031E…b72F<br/>Slinky price feeds"]
    end

    subgraph Tokens["MockERC20"]
        T1[INIT]
        T2[USDC]
        T3[WETH]
        T4[TIA]
        T5[IDRX]
    end

    Router --> Tokens
    Router --> ORA
    Router --> COS
    Faucet --> Tokens
    Faucet --> ORA

    classDef r fill:#9f29ff,color:#fff,stroke:#b44dff,stroke-width:2px
    classDef pc fill:#0d1f3c,color:#22d3ee,stroke:#22d3ee
    classDef tk fill:#1a1033,color:#f5f5f5,stroke:#a78bfa
    class AMM,ROUTE,LIM,BATCH,CLAIM,FSWAP,BRG,FLIM,USER r
    class COS,ORA pc
    class T1,T2,T3,T4,T5 tk
```

---

## Core Mechanics

### AMM (x · y = k)

```mermaid
sequenceDiagram
    actor User
    participant R as RupiahRouter
    participant P as Pool(tokenA,tokenB)

    User->>R: swap(poolId, tokenIn, amountIn, minOut)
    R->>P: read reserves (x, y)
    R->>R: amountOut = f(x, y, amountIn, fee=30bps)
    R->>P: update reserves
    Note over P: invariant k_new ≥ k_old
    R->>User: transfer amountOut
```

- Constant-product reserves per pool
- Default swap fee: **0.3 % (30 bps)**, stored per-pool so future pools can
  override
- **Minimum liquidity** of 1000 is permanently locked on first deposit to
  prevent inflation attacks
- LP tokens minted proportional to contribution

### Smart Routing

```mermaid
flowchart LR
    IN((INIT)) -- Direct: Pool 1 --> OUT((USDC))
    IN -- Hop 1: Pool 2 --> H1((WETH))
    H1 -- Hop 2: Pool 3 --> OUT
    IN -- Hop 1: Pool 4 --> H2((TIA))
    H2 -- Hop 2: Pool 5 --> OUT

    classDef start fill:#9f29ff,color:#fff
    classDef end fill:#22c55e,color:#fff
    class IN start
    class OUT end
```

- `findBestRoute(tokenIn, tokenOut, amountIn)` compares **direct** vs
  **multi-hop** (up to `MAX_HOPS = 3`) and returns the `Route` with the highest
  expected output.
- `executeRoute(Route, minOut, deadline)` performs the swap with
  **slippage protection** and **deadline validation**.
- A small **protocol fee** (500 wei per `executeRoute`) covers operational
  costs; configurable by the owner.

### Limit Orders

```mermaid
stateDiagram-v2
    [*] --> Placed: placeLimitOrder()<br/>(tokens locked in contract)
    Placed --> Executed: executeLimitOrder()<br/>price condition met
    Placed --> Cancelled: cancelLimitOrder()
    Placed --> Expired: block.timestamp > expiry
    Executed --> [*]: tokens → owner,<br/>0.1% keeper fee
    Cancelled --> [*]: refund owner
    Expired --> [*]: owner may cancel
```

- `tokenIn` is transferred and **held by the router** at placement time.
- Anyone can call `executeLimitOrder` (keeper pattern) — the executor earns a
  **0.1 % (10 bps) reward**.
- `expiry` is a unix timestamp enforced on-chain.

### Batch Swap

`batchSwap(BatchSwapParam[] calldata legs)` executes multiple independent
legs **atomically** in a single transaction — if any leg reverts, the entire
batch reverts. Used by the frontend `/batch` page for portfolio rebalancing.

```mermaid
flowchart LR
    START([User input]) --> BATCH[batchSwap]
    BATCH --> L1[Leg 1: A → B]
    BATCH --> L2[Leg 2: A → C]
    BATCH --> L3[Leg 3: A → D]
    L1 & L2 & L3 --> DONE[[All or nothing]]

    classDef atomic fill:#9f29ff,color:#fff
    class BATCH,DONE atomic
```

### TokenFaucet (Testnet)

`TokenFaucet` is an **all-in-one testnet utility** — it serves faucet claims,
simulates bridges, holds its own swap/limit flows, and hosts a lightweight
username registry.

| Action | GAS Fee | Notes |
|--------|---------|-------|
| `claimToken` | 1,000 | Mints 10k of each test token |
| `swap` / `batchSwap` | 500 | Oracle-priced, 0.3 % protocol fee |
| `bridgeDeposit` / `bridgeWithdraw` | 100 | Simulated L1 ↔ L2 movement |
| `placeLimitOrder` / `execute` / `cancel` | 500 | Oracle-priced |
| `registerUsername` / `sendToUsername` | 100 | Local registry |

> Pricing inside `TokenFaucet` uses an internal USD-cent oracle (constructor-seeded
> and adjustable), letting the UI demo limit orders without a real price
> feed in local dev.

---

## Initia Precompiles

```mermaid
flowchart LR
    RR[RupiahRouter] -- resolve("alice.init") --> COS((Cosmos<br/>0x00…f1))
    COS -- 0xABCD...1234 --> RR
    RR -- getPrice("INIT/USD") --> ORA((Slinky Oracle<br/>0x031E…b72F))
    ORA -- 985000 (6dp) --> RR

    classDef pc fill:#0d1f3c,color:#22d3ee,stroke:#22d3ee
    class COS,ORA pc
```

- **`ICosmos`** → `DEFAULT_COSMOS = 0x…f1` — username resolution + IBC transfers.
  Injectable at construction time for devnets or alternate chains.
- **`IConnectOracle`** → `DEFAULT_ORACLE = 0x031E…b72F` — Slinky price feeds
  for oracle-priced limit orders and cross-token quoting.

---

## Key Parameters

| Parameter | Value | Where |
|-----------|-------|-------|
| `FEE_DENOMINATOR` | `10000` (basis points) | `RupiahRouter` |
| Default swap fee | `30` bps = 0.3 % | `Pool.swapFeeRate` |
| `LIMIT_ORDER_EXEC_FEE` | `10` bps = 0.1 % | `RupiahRouter` |
| Protocol fee per `executeRoute` | `500` wei | `RupiahRouter` |
| `MAX_HOPS` | `3` | `RupiahRouter` |
| `MINIMUM_LIQUIDITY` | `1000` (locked) | `RupiahRouter` |
| `CLAIM_FEE` | `1000 ether` | `TokenFaucet` |
| `SWAP_FEE` / `LIMIT_FEE` | `500 ether` | `TokenFaucet` |

---

## Security Model

```mermaid
graph LR
    U[User tx] --> G1{slippage<br/>minOut check}
    G1 -->|fail| REVERT[revert]
    G1 --> G2{deadline<br/>block.timestamp}
    G2 -->|expired| REVERT
    G2 --> G3{ERC20 safe<br/>transfer}
    G3 -->|fail| REVERT
    G3 --> G4{k-invariant<br/>preserved}
    G4 -->|violated| REVERT
    G4 --> OK[✓ state updated]

    classDef bad fill:#7f1d1d,color:#fff,stroke:#ef4444
    classDef good fill:#14532d,color:#fff,stroke:#22c55e
    class REVERT bad
    class OK good
```

| Layer | Mechanism |
|-------|-----------|
| Slippage | `minOut` parameters on every trade entrypoint |
| Replay / stale TX | `deadline` checked against `block.timestamp` |
| Privilege | `onlyOwner` for fee updates, withdrawals, oracle swap |
| Token transfers | Safe-wrapper checks return data on `transfer` / `transferFrom` |
| Invariants | `k_new ≥ k_old` after every pool swap |
| Locked units | 1000 MINIMUM_LIQUIDITY burned on first LP mint |

---

## Development Workflow

```mermaid
flowchart LR
    A["forge build"] --> B["forge test -vv"]
    B --> C["forge script ... --broadcast"]
    C --> D["SetupPools.s.sol"]
    D --> E[Ready for fe_rupiahrote]

    classDef step fill:#9f29ff,color:#fff
    classDef done fill:#22c55e,color:#fff
    class A,B,C,D step
    class E done
```

```bash
# Compile
forge build

# Run the test suite
forge test -vv

# Gas snapshot
forge snapshot
```

The test suite lives in [`test/RupiahRouter.t.sol`](./test/RupiahRouter.t.sol)
and exercises pool creation, swaps, multi-hop routing, limit orders, batch
execution, and guard conditions.

---

## Deployment

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant F as Forge
    participant N as Initia MiniEVM
    participant FE as Frontend (.env.local)

    Dev->>F: forge script RupiahRouter.s.sol --broadcast
    F->>N: deploy RupiahRouter
    N-->>Dev: router address
    Dev->>F: forge script TokenFaucet.s.sol --broadcast
    F->>N: deploy TokenFaucet (+ 5 MockERC20)
    N-->>Dev: faucet + token addresses
    Dev->>F: forge script SetupPools.s.sol --broadcast
    F->>N: createPool × N + addLiquidity
    Dev->>FE: paste addresses into NEXT_PUBLIC_*
    FE-->>Dev: dApp online ✨
```

```bash
# 1. Deploy the router
forge script script/RupiahRouter.s.sol \
  --rpc-url $RPC_URL --private-key $DEPLOYER_KEY \
  --broadcast --legacy

# 2. Deploy the faucet (which deploys the 5 MockERC20s)
forge script script/TokenFaucet.s.sol \
  --rpc-url $RPC_URL --private-key $DEPLOYER_KEY \
  --broadcast --legacy

# 3. Seed pools and initial liquidity
forge script script/SetupPools.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast --legacy
```

> A helper `script/deploy.sh` runs the three steps in order for convenience.

---

## Environment Variables

```bash
DEPLOYER_KEY=       # Private key used by forge script
ROUTER_ADDRESS=     # Deployed RupiahRouter (consumed by SetupPools)
USER_ADDRESS=       # Optional: test user that receives seed tokens
RPC_URL=            # Initia MiniEVM RPC, e.g. http://localhost:8545
```

---

## Project Structure

```
sc_RupiahRote/
├── src/
│   ├── RupiahRouter.sol            # AMM + routing + limits + batch
│   ├── TokenFaucet.sol             # Testnet utility hub
│   ├── interfaces/
│   │   ├── ICosmos.sol             # Cosmos precompile interface
│   │   └── IConnectOracle.sol      # Slinky oracle interface
│   └── mocks/
│       └── MockERC20.sol           # Test ERC20 with mint/burn
├── script/
│   ├── RupiahRouter.s.sol          # Deploy router
│   ├── TokenFaucet.s.sol           # Deploy faucet + mock tokens
│   ├── SetupPools.s.sol            # Create pools + seed liquidity
│   └── deploy.sh                   # End-to-end deploy helper
├── test/
│   └── RupiahRouter.t.sol          # Comprehensive test suite
└── foundry.toml                    # Foundry configuration
```

---

<div align="center">

See the [frontend README](../fe_rupiahrote/README.md) for the dApp UI, or the
[docs site](https://docsrupiahroute.vercel.app/) for extended guides.

</div>
