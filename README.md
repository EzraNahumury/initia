# RupiahRoute - Smart Cross-Chain Router for Indonesian DeFi

> "Google Maps untuk Crypto Swap" - Routing IDRX ke WETH lewat jalur tercepat dan termurah di ekosistem Initia.

## Initia Hackathon Submission

**Project Name:** RupiahRoute
**Track:** DeFi
**VM:** EVM (Solidity / MiniEVM)
**Native Features:** Interwoven Bridge + Auto-Signing (Session UX)

### Overview

RupiahRoute adalah smart routing engine yang berjalan sebagai **Initia EVM appchain** sendiri. Platform ini memungkinkan pengguna Indonesia mengkonversi IDRX (stablecoin IDR) ke WETH melalui jalur paling optimal secara otomatis — memilih rute tercepat, termurah, dan paling likuid di seluruh ekosistem Initia.

**Problem:** On-ramp dari IDR ke aset DeFi global (ETH/WETH) masih ribet, mahal, dan membingungkan bagi pengguna Indonesia. User harus manual memilih chain, bridge, dan DEX — setiap langkah punya risiko dan biaya tersembunyi.

**Solution:** Satu klik swap dengan smart routing yang otomatis menentukan jalur terbaik. Seperti Google Maps yang memilihkan rute tercepat — RupiahRoute memilihkan jalur swap termurah.

**Target Users:** Pengguna crypto Indonesia yang ingin akses DeFi global tanpa kompleksitas multi-chain.

### Custom Implementation

- **Smart Routing Engine (Solidity):** Contract `RouteEngine.sol` yang mengevaluasi multiple path (direct swap, multi-hop, cross-pool) dan memilih yang optimal berdasarkan output amount, gas cost, dan estimated time. Menggunakan ConnectOracle (Slinky price feed) di `0x031ECb63480983FD216D17BB6e1d393f3816b72F` untuk real-time pricing.
- **On-Chain Liquidity Pools:** Contract `RupiahPool.sol` — AMM pool (IDRX/WETH, IDRX/USDC, USDC/WETH) yang berjalan langsung di appchain kita. Pool menggunakan StableSwap formula untuk pair stablecoin dan Weighted formula untuk volatile pair.
- **Route Aggregation:** Selain pool lokal, engine juga mengquery rute via Initia Router API (`/v2/fungible/route`) untuk menemukan jalur cross-chain terbaik di seluruh ekosistem Initia.
- **Cosmos Precompile Integration:** Memanfaatkan ICosmos precompile (`0xf1`) untuk cross-VM token interop dan IBC hooks untuk cross-chain contract calls.

### Native Feature: Interwoven Bridge

RupiahRoute mengintegrasikan **Interwoven Bridge** via InterwovenKit untuk:
- **Deposit:** User bridge IDRX dari Initia L1 ke RupiahRoute appchain dengan satu klik (`openDeposit`)
- **Withdraw:** Hasil swap (WETH) bisa ditarik kembali ke L1 atau chain lain (`openWithdraw`)
- **Cross-chain routing:** Bridge modal penuh untuk transfer antar chain (`openBridge`)

**UX Improvement:** Tanpa Interwoven Bridge, user harus manual bridge aset, switch network, lalu swap — 3+ langkah terpisah. Dengan integrasi ini, semua terjadi dalam satu flow seamless di dalam app.

### Native Feature: Auto-Signing (Session UX)

RupiahRoute menggunakan **Auto-Sign / Ghost Wallet** untuk:
- Menghilangkan popup wallet approval di setiap swap
- User approve sekali di awal session, semua swap berikutnya auto-sign
- Scoped hanya ke `/minievm.evm.v1.MsgCall` (aman, terbatas pada contract calls)
- Time-limited dengan expiration otomatis

**UX Improvement:** Untuk power user yang melakukan multiple swap (DCA, rebalancing), tidak perlu confirm wallet 5-10x. Satu approval, lalu swap seamlessly — pengalaman se-smooth Web2.

### How to Run Locally

```bash
# 1. Clone repository
git clone <repo_url>
cd rupiahroute

# 2. Setup Initia appchain (requires Docker, Go 1.22+)
npx skills add initia-labs/agent-skills
# Initialize EVM rollup
weave init    # Follow interactive setup, select EVM track
weave start

# 3. Deploy smart contracts
cd contracts
forge install
forge build
forge create src/RouteEngine.sol:RouteEngine \
  --rpc-url http://localhost:8545 \
  --private-key $DEPLOYER_KEY \
  --legacy
forge create src/RupiahPool.sol:RupiahPool \
  --rpc-url http://localhost:8545 \
  --private-key $DEPLOYER_KEY \
  --legacy

# 4. Start frontend
cd ../frontend
cp .env.example .env   # Set VITE_APPCHAIN_ID, VITE_JSON_RPC_URL, VITE_CONTRACT_ADDRESS
npm install
npm run dev
```

---

## Technical Architecture

```
+------------------------------------------------------------------+
|                     RupiahRoute Appchain                          |
|                   (Initia EVM Rollup, 100ms blocks)               |
|                                                                   |
|  +---------------+  +---------------+  +----------------------+   |
|  | RouteEngine   |  | RupiahPool    |  | ConnectOracle        |   |
|  | .sol          |  | .sol          |  | (Slinky @ 0x031..)   |   |
|  |               |  |               |  |                      |   |
|  | - findRoute   |  | - IDRX/WETH  |  | - Real-time prices   |   |
|  | - executeSwap |  | - IDRX/USDC  |  | - Price feeds        |   |
|  | - multiHop    |  | - USDC/WETH  |  |                      |   |
|  +-------+-------+  +-------+-------+  +----------------------+   |
|          |                  |                                      |
|  +-------+------------------+------------------------------------+ |
|  |          Cosmos Precompile (0xf1)                             | |
|  |  - Token mapping (ERC20 <-> Cosmos denom)                    | |
|  |  - IBC hooks for cross-chain calls                           | |
|  |  - Address conversion (EVM <-> bech32)                       | |
|  +---------------------------------------------------------------+ |
+------------------------------+-------------------------------------+
                               |
                  Interwoven Bridge (OPinit)
                               |
+------------------------------+-------------------------------------+
|                      Initia L1                                     |
|  +--------------+  +---------------+  +------------------------+   |
|  | InitiaDEX    |  | Minitswap     |  | IBC / LayerZero        |   |
|  | (AMM Pools)  |  | (L1<>L2)      |  | (External chains)      |   |
|  +--------------+  +---------------+  +------------------------+   |
+--------------------------------------------------------------------+

+--------------------------------------------------------------------+
|                    Frontend (React + Vite)                          |
|                                                                    |
|  +--------------------+  +--------------+  +-------------------+   |
|  | InterwovenKit      |  | Route Viz    |  | Indonesia UX      |   |
|  | - Wallet connect   |  | - Sankey     |  | - Bahasa UI       |   |
|  | - Auto-sign        |  | - Fee est.   |  | - IDR display     |   |
|  | - Bridge modal     |  | - Time est.  |  | - Local guide     |   |
|  +--------------------+  +--------------+  +-------------------+   |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  | wagmi + viem (EVM interaction layer)                         |  |
|  +--------------------------------------------------------------+  |
+--------------------------------------------------------------------+
```

## Smart Contracts

### RouteEngine.sol (Core)

Tanggung jawab:
- `findBestRoute(tokenIn, tokenOut, amountIn)` — Evaluasi semua path yang tersedia, return Route struct optimal
- `executeSwap(route, minAmountOut, deadline)` — Eksekusi swap sesuai route yang dipilih
- `multiHopSwap(path[], amounts[], deadline)` — Swap multi-hop (misal IDRX -> USDC -> WETH)
- `getQuote(tokenIn, tokenOut, amountIn)` — Estimasi output + gas + path tanpa eksekusi

Integrasi:
- Query ConnectOracle untuk real-time price comparison
- Query local pools (RupiahPool) untuk direct swap rates
- Compare dengan Initia Router API rates (off-chain, passed via frontend)
- Pilih jalur dengan output terbesar setelah dikurangi gas

### RupiahPool.sol (AMM)

Tanggung jawab:
- `addLiquidity(tokenA, tokenB, amountA, amountB)` — Tambah likuiditas, terima LP tokens
- `removeLiquidity(lpTokens)` — Tarik likuiditas
- `swap(tokenIn, tokenOut, amountIn, minOut)` — Eksekusi swap langsung
- `getReserves(tokenA, tokenB)` — Query reserve pool

Pool Types:
- **StableSwap:** IDRX/USDC (korrelasi tinggi, low slippage)
- **Weighted:** IDRX/WETH, USDC/WETH (volatile pair)

Fee Model:
- 0.3% swap fee ke LP providers
- Appchain gas fee 100% revenue untuk protocol (Initia value capture)

## Keunggulan Unik ("Twist" Pembeda)

### 1. Smart Routing Engine — Bukan Swap Biasa

```
User input: 10,000 IDRX -> WETH

Engine evaluates 3 paths:
  Path A: IDRX -> WETH direct     (pool lokal)      = 0.00312 WETH, gas $0.01
  Path B: IDRX -> USDC -> WETH    (multi-hop lokal)  = 0.00318 WETH, gas $0.02
  Path C: IDRX -> bridge L1 -> DEX (cross-chain)     = 0.00315 WETH, gas $0.05

Winner: Path B (+1.9% lebih banyak WETH, gas masih murah)
```

User tidak perlu tahu mekanisme di belakang — cukup masukkan jumlah, klik swap, dapat hasil terbaik.

### 2. Indonesia-First UX

- Full Bahasa Indonesia interface
- Semua nominal ditampilkan dalam Rupiah (Rp) + crypto
- Panduan onboarding untuk pemula crypto Indonesia
- Fee estimator dalam IDR ("Biaya gas: Rp 150" bukan "$0.01")

### 3. Session UX dengan Auto-Sign

- Power users bisa DCA (Dollar Cost Averaging) tanpa approve tiap transaksi
- Swap berulang untuk rebalancing portfolio — smooth tanpa popup
- Ghost wallet scoped dan time-limited, aman

### 4. Visual Route Map

- Sankey diagram menunjukkan alur token dari IDRX ke intermediary ke WETH
- Real-time fee dan time estimator sebelum swap
- Perbandingan visual: "Hemat 95% vs swap di Ethereum mainnet"

## Tech Stack

| Layer | Technology |
|---|---|
| **Appchain** | Initia MiniEVM Rollup (100ms blocks) |
| **Smart Contracts** | Solidity, Foundry (forge), OpenZeppelin |
| **Frontend** | React, Vite, TypeScript |
| **Wallet/UX** | InterwovenKit (`@initia/interwovenkit-react`), wagmi, viem |
| **Bridge** | Interwoven Bridge (OPinit) |
| **Oracle** | ConnectOracle / Slinky (precompile `0x031E...`) |
| **Cross-chain** | Cosmos Precompile (`0xf1`), IBC Hooks |
| **Routing API** | Initia Router API (`/v2/fungible/route`) |
| **Styling** | Tailwind CSS |
| **Localization** | i18next (Bahasa Indonesia + English) |

## Development Plan (13 Hari)

### Phase 1: Foundation (Day 1-3)
- [ ] Setup Initia EVM appchain dengan `weave init` (EVM track)
- [ ] Deploy RouteEngine.sol + RupiahPool.sol di local devnet
- [ ] Setup frontend boilerplate (React + Vite + InterwovenKit + wagmi)
- [ ] Integrasi InterwovenKit wallet connection
- [ ] Test basic contract interaction dari frontend

### Phase 2: Core DeFi Logic (Day 4-7)
- [ ] Implementasi AMM logic di RupiahPool.sol (StableSwap + Weighted)
- [ ] Implementasi smart routing di RouteEngine.sol
- [ ] Integrasi ConnectOracle untuk price feeds
- [ ] Integrasi Initia Router API untuk cross-chain route comparison
- [ ] Implementasi multi-hop swap logic
- [ ] Unit tests dengan Foundry (`forge test`)

### Phase 3: Native Features + UX (Day 8-10)
- [ ] Integrasi Interwoven Bridge (deposit IDRX, withdraw WETH)
- [ ] Implementasi Auto-Sign session UX
- [ ] Build route visualization (Sankey diagram)
- [ ] Build fee/time estimator component
- [ ] Indonesia localization (Bahasa UI, IDR display)

### Phase 4: Polish + Submit (Day 11-13)
- [ ] Deploy ke Initia testnet (`initiation-2`)
- [ ] End-to-end testing full flow
- [ ] Record demo video (1-3 menit)
- [ ] Finalisasi README.md
- [ ] Buat `.initia/submission.json`
- [ ] Final submission ke DoraHacks

## Revenue Model (Initia Value Capture)

Karena RupiahRoute berjalan sebagai **appchain sendiri**:
- **100% gas fee** dari setiap transaksi adalah revenue kita (bukan leaked ke chain lain)
- **Swap fee 0.3%** dari setiap trade ke LP providers + protocol treasury
- **Routing fee 0.05%** sebagai protocol revenue
- Block time 100ms = high throughput = more transactions = more revenue

Ini sesuai filosofi Initia: *"Every transaction your users make? That's revenue you keep."*

## Scoring Alignment

| Criteria | Weight | Our Approach |
|---|---|---|
| **Originality & Track Fit** | 20% | Smart routing engine khusus IDR-to-crypto di DeFi track. Bukan DEX clone — ini aggregator+router yang solve masalah real pengguna Indonesia. |
| **Technical Execution & Initia Integration** | 30% | Full EVM appchain, ConnectOracle, Cosmos Precompile, Router API, IBC hooks. Deep integration, bukan surface-level. |
| **Product Value & UX** | 20% | Indonesia-first (Bahasa, IDR), auto-sign session, visual route map. UX level Web2 untuk DeFi. |
| **Working Demo & Completeness** | 20% | End-to-end: deposit, route, swap, withdraw. Demo video menunjukkan full flow. |
| **Market Understanding** | 10% | Target jelas: 20M+ crypto users Indonesia. Kompetitor (Uniswap, 1inch) tidak punya IDR focus atau Initia integration. |

## Demo Script (1-3 Menit)

1. **Landing Page** — Tampilkan UI Bahasa Indonesia, connect wallet via InterwovenKit
2. **Deposit** — Bridge IDRX dari L1 ke appchain via Interwoven Bridge (1 klik)
3. **Smart Route** — Input 10,000 IDRX, pilih WETH. Engine tampilkan 3 rute + rekomendasi terbaik
4. **Visual** — Sankey diagram menunjukkan flow token, fee estimator tampilkan "Biaya: Rp 150"
5. **Swap** — Eksekusi swap, auto-sign aktif (tanpa popup wallet)
6. **Result** — Tampilkan WETH diterima + perbandingan savings vs Ethereum mainnet

## References

- [Initia Hackathon Docs](https://docs.initia.xyz/hackathon)
- [InterwovenKit Docs](https://docs.initia.xyz/build/interwovenkit/overview)
- [Initia Router API](https://router-api.initia.xyz)
- [MiniEVM Contracts](https://github.com/initia-labs/initia-evm-contracts)
- [Initia Examples](https://github.com/initia-labs/examples)
- [Foundry Book](https://book.getfoundry.sh/)
