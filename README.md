# RupiahRoute - Smart DeFi Router on Initia

> "Google Maps untuk DeFi" - Otomatis temukan jalur swap tercepat dan termurah di seluruh ekosistem Initia.

## Initia Hackathon Submission

**Project Name:** RupiahRoute
**Track:** DeFi
**VM:** EVM (Solidity / MiniEVM)
**Native Features:** Interwoven Bridge + Auto-Signing + Initia Usernames (semua 3 fitur diimplementasi)

### Overview

RupiahRoute adalah smart routing engine yang berjalan sebagai **Initia EVM appchain (L2)** sendiri. User cukup pilih token asal dan token tujuan — engine otomatis menemukan jalur swap paling optimal: direct swap, multi-hop, atau cross-chain routing via L1.

Semua transaksi terjadi di L2 appchain kita (100ms blocks, near-zero fee) dan settle ke L1 Initia — arsitektur yang menguntungkan user (murah, cepat) sekaligus appchain operator (revenue dari setiap transaksi).

**Problem:** DeFi di multi-chain itu membingungkan. User harus manual pilih DEX mana, route mana, bridge kemana, dan bayar gas berkali-kali. Tidak ada "Google Maps" yang otomatis carikan jalur terbaik.

**Solution:** Satu interface, satu klik. Input token A, output token B — engine handle sisanya: pilih pool terbaik, route paling murah, bridge kalau perlu. Plus fitur advanced seperti limit orders dan batch swap yang biasanya cuma ada di CEX, sekarang fully on-chain.

**Target Users:** DeFi users yang ingin swap optimal tanpa ribet routing manual. Khususnya pengguna Indonesia yang butuh akses DeFi global dengan UX sederhana dan familiar (Bahasa Indonesia, tampilan Rupiah).

---

### Custom Implementation Details

**1. Smart Routing Engine + Built-in AMM (Solidity)**

Contract `RupiahRouter.sol` menggabungkan AMM dan routing dalam satu unified contract:

```solidity
// === DATA STRUCTURES ===

struct Pool {
    address tokenA;
    address tokenB;
    uint256 reserveA;
    uint256 reserveB;
    uint256 totalLpSupply;
    uint256 swapFeeRate;       // default 30 = 0.3%
}

struct Route {
    uint8 routeType;           // 0=direct, 1=multiHop, 2=crossChain
    address[] path;            // token addresses in order
    uint256[] poolIds;         // pools to use at each hop
    uint256 expectedOut;       // estimated output amount
    uint256 estimatedGas;      // gas cost estimate
}

struct LimitOrder {
    address owner;
    address tokenIn;
    address tokenOut;
    uint256 amountIn;
    uint256 targetPrice;       // min output per input (scaled 1e18)
    uint256 expiry;            // block timestamp expiry
    bool executed;
}

// === AMM ENGINE (x * y = k) ===

function createPool(address tokenA, address tokenB, uint256 amountA, uint256 amountB)
    external returns (uint256 poolId);

function addLiquidity(uint256 poolId, uint256 amountA, uint256 amountB)
    external returns (uint256 lpTokens);

function removeLiquidity(uint256 poolId, uint256 lpTokens)
    external returns (uint256 amountA, uint256 amountB);

function swap(uint256 poolId, address tokenIn, uint256 amountIn, uint256 minOut)
    external returns (uint256 amountOut);

// === ROUTING ENGINE ===

function findBestRoute(address tokenIn, address tokenOut, uint256 amountIn)
    external view returns (Route memory bestRoute);
    // Evaluasi: direct pool → multi-hop → cross-chain
    // Return route dengan output terbesar setelah dikurangi gas

function executeRoute(Route calldata route, uint256 minAmountOut, uint256 deadline)
    external returns (uint256 amountOut);

function multiHopSwap(address[] calldata path, uint256[] calldata poolIds, uint256 amountIn, uint256 minFinalOut, uint256 deadline)
    external returns (uint256 finalAmount);

function getQuote(address tokenIn, address tokenOut, uint256 amountIn)
    external view returns (uint256 expectedOut, uint256 gasEstimate, Route memory route);

// === LIMIT ORDERS (Auto-Sign powered) ===

function placeLimitOrder(address tokenIn, address tokenOut, uint256 amountIn, uint256 targetPrice, uint256 expiry)
    external returns (uint256 orderId);

function executeLimitOrder(uint256 orderId)
    external returns (uint256 amountOut);
    // Cek harga via ConnectOracle → execute kalau memenuhi target
    // Callable oleh siapa saja (keeper/auto-sign ghost wallet)

function cancelLimitOrder(uint256 orderId) external;

function getActiveOrders(address user)
    external view returns (LimitOrder[] memory);

// === BATCH SWAP (Portfolio Rebalancing) ===

struct BatchSwapParam {
    address tokenIn;
    address tokenOut;
    uint256 amountIn;
    uint256 minOut;
}

function batchSwap(BatchSwapParam[] calldata swaps, uint256 deadline)
    external returns (uint256[] memory amountsOut);
    // Multiple swap dalam 1 transaksi
    // Masing-masing swap pakai findBestRoute untuk route optimal

// === SEND TO USERNAME ===

function sendToUsername(string calldata initUsername, address token, uint256 amount)
    external;
    // Resolve .init username → address via Cosmos precompile
    // Transfer token ke resolved address

// === ORACLE & HELPERS ===

function getOraclePrice(string calldata pair)
    external view returns (uint256 price);
    // Query ConnectOracle (Slinky) di 0x031ECb63...

function getPoolReserves(uint256 poolId)
    external view returns (uint256 reserveA, uint256 reserveB);

function getAmountOut(uint256 poolId, address tokenIn, uint256 amountIn)
    external view returns (uint256 amountOut);
    // Formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
```

**2. Initia-Specific Integrations**

```solidity
// Cosmos Precompile (0xf1) — cross-VM interop
ICosmos constant COSMOS = ICosmos(0x00000000000000000000000000000000000000f1);

// Convert ERC20 address ↔ Cosmos denom
string memory denom = COSMOS.to_denom(tokenAddress);
address erc20 = COSMOS.to_erc20(denom);

// Convert addresses EVM ↔ bech32
string memory bech32 = COSMOS.to_cosmos_address(evmAddress);
address evmAddr = COSMOS.to_evm_address(bech32Addr);

// Execute Cosmos SDK message dari Solidity (untuk IBC transfer, dll)
COSMOS.execute_cosmos(jsonMsg);

// ConnectOracle / Slinky — on-chain price feeds
IConnectOracle constant ORACLE = IConnectOracle(0x031ECb63480983FD216D17BB6e1d393f3816b72F);
```

**3. AMM Formula**

Constant product (x * y = k), sama seperti Uniswap V2:
- Simple dan proven
- Gas efficient di EVM
- Mudah di-audit

Pools menggunakan real testnet tokens (INIT, USDC, ETH, TIA) yang semuanya sudah tersedia di Initia testnet.

**4. Cross-Chain Route Aggregation**

Frontend query Initia Router API (`POST /v2/fungible/route`) untuk compare rate di InitiaDEX (L1) vs pool lokal (L2). Kalau L1 rate lebih baik, engine route via Interwoven Bridge → InitiaDEX → bridge back. User tidak perlu tahu complexity di belakang.

---

### Native Feature 1: Interwoven Bridge

Integrasi **Interwoven Bridge** via InterwovenKit untuk seamless L1↔L2 asset flow:

```tsx
// Frontend integration
const { openDeposit, openWithdraw, openBridge } = useInterwovenKit()

// Deposit: User bridge token dari L1 ke appchain (1 klik)
const handleDeposit = () => {
  openDeposit({
    denoms: ['uinit', 'uusdc', 'ueth', 'utia'],  // token yang bisa di-deposit
    chainId: 'rupiahroute-1',                      // appchain kita
  })
}

// Withdraw: Tarik hasil swap kembali ke L1
const handleWithdraw = () => {
  openWithdraw({
    denoms: ['uinit', 'uusdc'],
    chainId: 'rupiahroute-1',
  })
}

// Full bridge modal (source + destination selection)
const handleBridge = () => {
  openBridge({
    srcChainId: 'initiation-2',        // dari L1
    srcDenom: 'uinit',
    dstChainId: 'rupiahroute-1',       // ke appchain kita
  })
}
```

**UX Flow:**
1. User klik "Deposit" → Bridge modal muncul → pilih token & jumlah → 1 klik confirm
2. Token muncul di appchain dalam hitungan detik
3. Swap di appchain (100ms, near-zero fee)
4. Klik "Withdraw" → hasil swap kembali ke L1 atau chain lain

**Tanpa Interwoven Bridge:** User harus manual bridge (cari bridge UI, switch network, approve, tunggu) → switch network lagi → baru swap. Minimal 3+ langkah terpisah dengan multiple wallet popups.

**Dengan Interwoven Bridge:** Deposit-swap-withdraw = satu flow seamless dalam 1 app.

---

### Native Feature 2: Auto-Signing (Session UX)

Integrasi **Auto-Sign / Ghost Wallet** untuk frictionless trading:

```tsx
// Provider setup — enable auto-sign untuk EVM calls
<InterwovenKitProvider
  enableAutoSign={{
    'rupiahroute-1': ['/minievm.evm.v1.MsgCall'],  // scope: hanya contract calls
  }}
>

// Penggunaan di komponen
const { autoSign, submitTxBlock, estimateGas } = useInterwovenKit()

// Enable session (user approve 1x di awal)
const startSession = async () => {
  await autoSign.enable('rupiahroute-1')
  // Ghost wallet created, authz + feegrant granted
  // Semua swap setelah ini = auto-sign, tanpa popup
}

// Swap tanpa popup wallet (auto-signed oleh ghost wallet)
const executeSwap = async (route) => {
  const messages = [{
    typeUrl: '/minievm.evm.v1.MsgCall',
    value: {
      sender: bech32Address,
      contractAddr: ROUTER_CONTRACT,
      input: encodedSwapCalldata,
    }
  }]
  const gas = await estimateGas({ messages })
  const fee = calculateFee(Math.ceil(gas * 1.4), GasPrice.fromString('0.015uinit'))
  const { transactionHash } = await submitTxBlock({ messages, fee })
  // Langsung executed, tanpa popup wallet!
}

// Check session status
const isActive = autoSign.isEnabledByChain['rupiahroute-1']
const expiresAt = autoSign.expiredAtByChain['rupiahroute-1']

// Revoke session kapan saja
const endSession = () => autoSign.disable('rupiahroute-1')
```

**Security:**
- Scoped hanya ke `/minievm.evm.v1.MsgCall` (tidak bisa transfer langsung, hanya contract interaction)
- Time-limited dengan expiration otomatis
- User bisa revoke semua grants kapan saja
- Ghost wallet unik per app origin

**Killer Feature — Auto-Sign + Oracle = Limit Orders On-Chain:**

```
Bagaimana limit order bekerja:

1. User set: "Beli ETH kalau harga INIT/ETH > 0.05"
   → Contract menyimpan LimitOrder struct on-chain
   → User deposit tokenIn ke contract

2. Auto-sign aktif → ghost wallet jadi "keeper"
   → Periodic check: query ConnectOracle untuk harga terkini
   → Atau: siapa saja bisa call executeLimitOrder() (incentivized by fee)

3. Saat harga memenuhi target:
   → executeLimitOrder() triggered
   → Contract swap via best route
   → Hasil masuk ke wallet user
   → Execution fee 0.1% ke executor

4. User tidak perlu online — order execute otomatis

Ini fitur yang biasanya HANYA ada di CEX (Binance, dll).
Sekarang fully on-chain, non-custodial, di appchain Initia.
Possible karena: auto-sign + 100ms blocks + ConnectOracle.
```

---

### Native Feature 3: Initia Usernames (.init)

Integrasi **Initia Usernames** di seluruh UI:

```tsx
// Resolve .init username ke address
import { useUsernameQuery } from '@initia/interwovenkit-react'

// Di profile/header — tampilkan username, bukan hex
const ProfileHeader = () => {
  const { address } = useInterwovenKit()
  const { data: username } = useUsernameQuery(address)
  return <span>{username || truncateAddress(address)}</span>
  // Shows: "@rupiahking.init" instead of "0x7fD3...85c0"
}

// Send to username — kirim token ke nama, bukan ke hex
const SendToUsername = () => {
  const [recipient, setRecipient] = useState('')  // e.g. "teman.init"
  const { data: resolvedAddr } = useUsernameQuery(recipient)

  const handleSend = async () => {
    // Resolve username → address, lalu transfer
    await sendToUsername(recipient, tokenAddress, amount)
  }

  return (
    <div>
      <input placeholder="Masukkan username .init" value={recipient} />
      {resolvedAddr && <p>Kirim ke: {resolvedAddr}</p>}
      <button onClick={handleSend}>Kirim</button>
    </div>
  )
}

// Leaderboard — top traders pakai readable names
const Leaderboard = ({ traders }) => (
  <table>
    {traders.map(t => {
      const { data: name } = useUsernameQuery(t.address)
      return <tr><td>{name || truncate(t.address)}</td><td>{t.volume}</td></tr>
    })}
  </table>
)
```

**Implementasi di RupiahRoute:**

| Tempat | Tanpa .init | Dengan .init |
|---|---|---|
| Header wallet | `0x7fD3...85c0` | `@rupiahking.init` |
| Send token | Input hex address | Input `teman.init` |
| Swap history | `0x7f...→0xa3...` | `@aku.init → @dia.init` |
| Leaderboard | Hex addresses | `@toptrader.init: Vol $12,500` |
| Referral link | `?ref=0x7fD3...` | `?ref=rupiahking.init` |

**UX Improvement:** Address crypto `0x7fD385d6...` itu tidak manusiawi. Dengan `.init` usernames, DeFi terasa seperti Venmo/GoPay/OVO — kirim ke nama, bukan ke kode. Ini menurunkan barrier masuk untuk user baru.

---

### How to Run Locally

```bash
# 1. Clone repository
git clone <repo_url>
cd rupiahroute

# 2. Setup Initia EVM appchain (requires Docker Desktop, Go 1.22+, Foundry)
npx skills add initia-labs/agent-skills
weave init    # Select: EVM track, chain-id: rupiahroute-1, gas denom: umin
weave start

# 3. Start cross-chain infrastructure
weave opinit init executor && weave opinit start executor -d
weave relayer init && weave relayer start -d

# 4. Deploy smart contract
cd contracts
forge install initia-labs/initia-evm-contracts
forge build
forge create src/RupiahRouter.sol:RupiahRouter \
  --rpc-url http://localhost:8545 \
  --private-key $DEPLOYER_KEY \
  --legacy

# 5. Start frontend
cd ../frontend
cp .env.example .env   # Set: VITE_CHAIN_ID, VITE_RPC_URL, VITE_ROUTER_CONTRACT
npm install
npm run dev
```

---

## Technical Architecture

```
+=======================================================================+
||                     RupiahRoute Appchain (L2)                       ||
||               Initia EVM Rollup · 100ms blocks · near-zero gas      ||
||                                                                      ||
||  +---------------------------+    +-------------------------------+  ||
||  | RupiahRouter.sol          |    | System Precompiles            |  ||
||  |                           |    |                               |  ||
||  | AMM Engine (x*y=k):      |    | ConnectOracle (Slinky)        |  ||
||  |  Pool: INIT/USDC         |    | @ 0x031ECb63...               |  ||
||  |  Pool: INIT/ETH          |    | → INIT/USD, ETH/USD prices   |  ||
||  |  Pool: USDC/ETH          |    |                               |  ||
||  |  Pool: INIT/TIA          |    | Cosmos Precompile             |  ||
||  |                           |    | @ 0xf1                       |  ||
||  | Routing Engine:           |    | → Token mapping ERC20↔denom  |  ||
||  |  → findBestRoute()       |    | → IBC cross-chain calls      |  ||
||  |  → multiHopSwap()        |    | → Address conversion          |  ||
||  |  → getQuote()            |    |                               |  ||
||  |                           |    | ERC20Registry @ 0xf2          |  ||
||  | Limit Order Book:        |    | → Unified token model         |  ||
||  |  → placeLimitOrder()     |    +-------------------------------+  ||
||  |  → executeLimitOrder()   |                                       ||
||  |                           |    Users trade on L2:                ||
||  | Batch Operations:        |     - Instant (100ms confirm)         ||
||  |  → batchSwap()           |     - Cheap (near-zero gas)           ||
||  |  → sendToUsername()      |     - All gas → appchain revenue      ||
||  +---------------------------+                                       ||
+=================================+=====================================+
                                  |
                     Interwoven Bridge (OPinit)
                  L2 transactions settle ke L1
                                  |
+=================================+=====================================+
|                          Initia L1                                     |
|                                                                        |
|  +----------------+  +-----------------+  +--------------------------+ |
|  | InitiaDEX      |  | Minitswap       |  | IBC / LayerZero          | |
|  | (AMM on L1)    |  | (Fast L1↔L2)    |  | Bridges                  | |
|  |                |  |                 |  |                          | |
|  | Pools:         |  | - Bypass 7-day  |  | Inbound:                 | |
|  | - INIT/USDC    |  |   withdrawal    |  | - USDC (Noble)           | |
|  | - INIT/ETH     |  | - StableSwap    |  | - TIA (Celestia)         | |
|  | - INIT/TIA     |  |   virtual pools |  | - ETH (LayerZero)        | |
|  +----------------+  +-----------------+  | - milkTIA, milkINIT      | |
|                                           +--------------------------+ |
+========================================================================+

+========================================================================+
|                      Frontend (React + Vite + TypeScript)               |
|                                                                         |
| +---------------------+ +-------------------+ +---------------------+   |
| | InterwovenKit       | | Smart Swap UI     | | Indonesia UX        |   |
| | - Wallet connect    | | - Token selector  | | - Bahasa Indonesia  |   |
| | - Auto-sign toggle  | | - Route visualizer| | - Rupiah (Rp) fees  |   |
| | - Bridge deposit    | | - Quote preview   | | - IDR conversion    |   |
| | - Bridge withdraw   | | - Savings display | | - Onboarding guide  |   |
| | - .init username    | | - Limit order UI  | | - Familiar UX       |   |
| +---------------------+ | - Batch swap UI   | +---------------------+   |
|                          | - Leaderboard     |                          |
| +---------------------+ +-------------------+ +---------------------+   |
| | wagmi + viem        |                       | D3.js / React Flow  |   |
| | (EVM interaction)   |                       | (route animation)   |   |
| +---------------------+                       +---------------------+   |
+==========================================================================+
```

## Tokens (Real Initia Testnet — No Mocks Needed)

Semua token ini **sudah tersedia di Initia testnet** `initiation-2`:

| Token | Denom | Decimals | Cara Dapat |
|---|---|---|---|
| INIT | `uinit` | 6 | Faucet langsung (`faucet.testnet.initia.xyz`) |
| USDC | `uusdc` | 6 | Swap dari INIT di testnet DEX |
| ETH | `ueth` | 6 | Swap dari INIT di testnet DEX |
| TIA | `utia` | 6 | Swap dari INIT di testnet DEX |

Fee tokens yang diterima di testnet: `uinit`, `uusdc`, `ueth`, `utia`

InitiaDEX sudah punya **31 trading pairs** aktif di testnet, termasuk INIT/USDC, INIT/ETH, INIT/TIA — ini jadi benchmark untuk compare rate dengan pool lokal kita.

Di appchain (MiniEVM), setiap Cosmos token otomatis punya **ERC20 representation** via unified token model. Mapping: `evm/{contractAddress}` ↔ Cosmos denom.

---

## 6 Fitur Pembeda (Strategi Menang)

### Fitur 1: Smart Routing Engine — "Google Maps for DeFi"

**Kenapa ini beda dari DEX biasa:**

Semua DEX di Initia ecosystem saat ini = single-pool swap. User pilih pool, swap, selesai. Kalau ada route yang lebih murah lewat pool lain? User rugi tanpa sadar.

RupiahRoute **otomatis evaluasi semua kemungkinan jalur:**

```
Contoh: User swap 1000 INIT → USDC

Engine evaluasi 3 route:
  Route A: INIT → USDC direct (pool lokal)
    Output: 985.2 USDC | Gas: 0.001 INIT | Net: 985.19 USDC

  Route B: INIT → ETH → USDC (multi-hop, 2 pool lokal)
    Output: 987.8 USDC | Gas: 0.002 INIT | Net: 987.79 USDC

  Route C: INIT → Bridge L1 → InitiaDEX → Bridge back
    Output: 986.5 USDC | Gas: 0.01 INIT  | Net: 986.49 USDC

  WINNER: Route B (+2.6 USDC lebih banyak dari direct swap)
  Savings: "Anda hemat Rp 4,100 dibanding swap biasa"

Frontend menampilkan:
  [Animated Flow Diagram]  INIT ──→ ETH pool ──→ USDC pool ──→ 987.8 USDC
  [Fee Comparison]         Route A: 985.2 | Route B: 987.8 ✓ | Route C: 986.5
  [Savings Badge]          "Hemat Rp 4,100 (+0.26%)"
```

**Bagaimana routing bekerja secara teknis:**
1. `getQuote()` → query semua pool lokal untuk direct rate
2. Enumerate multi-hop paths (max 2 hop) → hitung expected output per path
3. Frontend query Initia Router API → compare cross-chain rate
4. Sort by `(expectedOut - gasCost)` → return best route
5. User confirm → `executeRoute()` → swap executed via optimal path

### Fitur 2: Semua 3 Native Features (Kebanyakan Peserta Cuma 1)

| Feature | Meaningful Use Case di RupiahRoute | Bukan Sekadar Checklist |
|---|---|---|
| **Interwoven Bridge** | Deposit token ke appchain untuk swap + withdraw hasil | Core flow: tanpa bridge, app tidak bisa dipakai |
| **Auto-Sign** | Session trading + limit order execution + batch swap | Enables fitur advanced yang mustahil tanpa auto-sign |
| **Initia Usernames** | Send-to-username + leaderboard + referral | Social layer yang bikin DeFi human-readable |

Kebanyakan project hackathon implement 1 native feature secara minimal. RupiahRoute implement **ketiga-tiganya** dan masing-masing **enables fitur lain** — bukan dekorasi, tapi integral ke product.

### Fitur 3: Limit Orders On-Chain (Auto-Sign + Oracle Combo)

**Ini fitur yang biasanya HANYA ada di CEX. Sekarang fully on-chain.**

```
User Story:
  1. Andi set limit order: "Beli 100 ETH kalau harga turun ke 0.045 INIT/ETH"
     → Contract: placeLimitOrder(INIT, ETH, 100e6, 0.045e18, block.timestamp + 7 days)
     → INIT di-lock di contract
     → Order tersimpan on-chain

  2. Auto-sign aktif → ghost wallet cek harga berkala
     → Query: ORACLE.getPrice("INIT/ETH")
     → Harga saat ini: 0.052 — belum memenuhi, skip

  3. Beberapa jam kemudian, harga turun ke 0.044
     → Condition met: currentPrice <= targetPrice
     → executeLimitOrder(orderId) triggered otomatis
     → Contract swap INIT → ETH via best route
     → ETH masuk ke wallet Andi
     → Execution fee 0.1% ke executor

  4. Andi buka app: "Order executed! Anda dapat 102.3 ETH"
     → Dia tidak perlu online saat eksekusi

Kenapa ini powerful:
  - Non-custodial (token di smart contract, bukan di exchange)
  - Transparent (semua on-chain, verifiable)
  - 100ms execution (jauh lebih cepat dari CEX settlement)
  - Revenue generator (0.1% execution fee per order)
```

**Kenapa ini possible di Initia tapi sulit di chain lain:**
- Auto-sign ghost wallet = keeper otomatis tanpa infra terpisah
- 100ms blocks = execution hampir instant saat condition met
- ConnectOracle (Slinky) = on-chain price feed reliable
- Near-zero gas = limit order execution tidak mahal

### Fitur 4: Batch Swap (Portfolio Rebalancing dalam 1 Tx)

```
Skenario: User punya 1000 INIT, mau diversifikasi

Input:
  Token: 1000 INIT
  Target: 40% USDC, 30% ETH, 30% TIA

Engine (batchSwap):
  Swap 1: 400 INIT → USDC (via Route B, multi-hop) → 394.2 USDC
  Swap 2: 300 INIT → ETH  (via Route A, direct)    → 0.0156 ETH
  Swap 3: 300 INIT → TIA  (via Route A, direct)    → 287.4 TIA

  Semua dalam 1 transaksi:
    ✓ 1 gas fee (bukan 3x)
    ✓ 1 wallet approval (atau 0 kalau auto-sign aktif)
    ✓ Setiap sub-swap tetap pakai best route
    ✓ Atomic: semua berhasil atau semua revert

Result:
  "Portfolio rebalanced! 3 swap, 1 tx, gas: Rp 50"
  "Anda hemat Rp 1,200 gas dibanding 3 transaksi terpisah"
```

**Use cases:**
- Portfolio rebalancing (DCA ke multiple aset)
- Take profit (jual 1 token, beli 3 token lain sekaligus)
- Token migration (swap semua holding lama ke holding baru)

### Fitur 5: Send-to-Username (DeFi rasa GoPay)

```
Tanpa .init usernames:
  "Kirim 100 USDC ke 0x7fD385d69908247436f49de2A1AFf6438d75C3c0"
  → User harus copy-paste address panjang
  → Salah 1 karakter = dana hilang
  → Tidak bisa di-verifikasi secara visual

Dengan .init usernames:
  "Kirim 100 USDC ke @teman.init"
  → Readable, memorable, verifiable
  → App resolve ke address yang benar
  → Confirmation: "Kirim ke @teman.init (0x7fD3...c0)?"

UI Flow:
  [Input Field: "Masukkan username .init atau address"]
  [Auto-resolve: "@teman.init → 0x7fD3...c0 ✓"]
  [Amount: "100 USDC"]
  [Button: "Kirim ke @teman.init"]
```

**Implementasi di seluruh app:**
- **Profile:** `@rupiahking.init` di header, bukan hex
- **Swap history:** `@aku.init swapped 1000 INIT → USDC`
- **Leaderboard:** `#1 @toptrader.init - Volume: $12,500`
- **Referral:** `rupiahroute.app/?ref=rupiahking.init` → referrer dapat 0.01% dari setiap swap referee
- **Social sharing:** "Swap di RupiahRoute, username saya @namauser.init"

### Fitur 6: Savings Dashboard (Impact yang Terlihat)

```
Dashboard menampilkan real-time:

+--------------------------------------------------+
|  Total Penghematan Anda                          |
|  Rp 125,000 (sejak mulai pakai RupiahRoute)     |
|                                                   |
|  Bulan ini:                                       |
|  ├─ 23 swap executed                              |
|  ├─ Avg savings: Rp 5,400 per swap               |
|  ├─ Best route dipilih 87% lebih murah            |
|  └─ Gas saved: 95% vs Ethereum mainnet            |
|                                                   |
|  Swap Terakhir:                                   |
|  ├─ 1000 INIT → 987.8 USDC (Route B, multi-hop)  |
|  ├─ Savings: Rp 4,100 vs direct swap              |
|  └─ Time: 0.3s (vs ~13s di Ethereum)              |
|                                                   |
|  Active Limit Orders: 2                           |
|  ├─ Buy ETH @ 0.045 INIT/ETH (pending)           |
|  └─ Sell TIA @ 1.2 INIT/TIA (pending)            |
+--------------------------------------------------+
```

**Data source:**
- Savings dihitung dari: `actualRoute.output - directSwap.output` per transaksi
- Accumulated on-chain di contract (emit event per swap, frontend aggregate)
- Gas comparison: L2 gas vs estimated L1 gas untuk operasi yang sama
- IDR conversion: hardcode rate (1 USD ~ Rp 16,000) atau fetch dari API

**Kenapa ini penting untuk judges:**
- Menunjukkan **tangible value** — bukan abstract "kami punya routing"
- Angka dalam **Rupiah** — relatable untuk Indonesia market narrative
- Dashboard = proof bahwa smart routing **actually saves money**

---

## Tech Stack

| Layer | Technology | Kenapa |
|---|---|---|
| **Appchain** | Initia MiniEVM Rollup | 100ms blocks, full EVM, Cosmos interop |
| **Smart Contract** | Solidity + Foundry | Industry standard, `--legacy` flag for MiniEVM |
| **Base Contracts** | `initia-evm-contracts` | InitiaERC20, ICosmos, IConnectOracle |
| **Frontend** | React + Vite + TypeScript | Fast dev, type safety |
| **Wallet** | InterwovenKit + wagmi + viem | Official Initia SDK, EVM compatibility |
| **Bridge** | Interwoven Bridge (OPinit) | Native L1↔L2, dalam InterwovenKit |
| **Oracle** | ConnectOracle / Slinky | On-chain precompile, no external dependency |
| **Cross-chain** | Cosmos Precompile + IBC Hooks | Native to MiniEVM |
| **Route API** | Initia Router API | Cross-chain route comparison |
| **Visualization** | React Flow / D3.js | Animated route diagrams |
| **Styling** | Tailwind CSS | Rapid UI development |
| **i18n** | i18next | Bahasa Indonesia + English toggle |

## Development Plan (13 Hari)

### Phase 1: Appchain + Contract Foundation (Day 1-3)
- [ ] `weave init` → setup EVM appchain (chain-id: `rupiahroute-1`)
- [ ] `weave opinit` + `weave relayer` → cross-chain infra
- [ ] `forge init` → Foundry project, install `initia-evm-contracts`
- [ ] Implement `RupiahRouter.sol`: Pool struct, createPool, addLiquidity, swap, getAmountOut
- [ ] Deploy ke local devnet + seed 4 pools dengan testnet tokens
- [ ] `forge test` → unit tests untuk AMM math
- [ ] Frontend boilerplate: React + Vite + InterwovenKit + wagmi provider setup

### Phase 2: Routing + Core DeFi (Day 4-7)
- [ ] Routing: findBestRoute (direct + multi-hop evaluation)
- [ ] Routing: executeRoute, multiHopSwap
- [ ] Routing: getQuote (preview tanpa eksekusi)
- [ ] ConnectOracle integration untuk price reference
- [ ] Frontend: swap UI (token selector, amount input, quote display)
- [ ] Frontend: route comparison display (3 routes side-by-side)
- [ ] Initia Router API integration (cross-chain route as option)
- [ ] `forge test` → routing logic tests

### Phase 3: Native Features + Advanced (Day 8-10)
- [ ] Interwoven Bridge: deposit/withdraw buttons dalam app
- [ ] Auto-Sign: enable/disable session, integrate dengan swap flow
- [ ] Limit Orders: placeLimitOrder, executeLimitOrder, cancelLimitOrder
- [ ] Limit Orders: UI (set price, view active orders, cancel)
- [ ] Batch Swap: batchSwap function + UI (multi-token target allocation)
- [ ] Initia Usernames: .init display di header, swap history
- [ ] Send-to-Username: input username, resolve, transfer
- [ ] `forge test` → limit order + batch swap tests

### Phase 4: UX Polish + Indonesia (Day 11-12)
- [ ] Route visualization (animated flow diagram: token mengalir antar pool)
- [ ] Savings dashboard (total hemat, per-swap breakdown, gas comparison)
- [ ] i18next setup: Bahasa Indonesia + English
- [ ] IDR conversion display (fee dalam Rupiah, savings dalam Rupiah)
- [ ] Leaderboard UI (top traders by volume, .init usernames)
- [ ] Mobile responsive
- [ ] Error states, loading spinners, edge cases

### Phase 5: Deploy + Submit (Day 13)
- [ ] Deploy RupiahRouter.sol ke Initia testnet (`initiation-2`)
- [ ] Seed pools dengan real testnet tokens (dari faucet)
- [ ] End-to-end test: deposit → swap → limit order → batch → withdraw → send-to-username
- [ ] Record demo video (1-3 menit, cover semua 8 demo steps)
- [ ] Finalisasi `README.md`
- [ ] Create `.initia/submission.json`
- [ ] Submit ke DoraHacks

### Priority Matrix

```
MUST HAVE (tanpa ini = diskualifikasi):
  1. Appchain deployed + valid chain ID
  2. InterwovenKit wallet connection
  3. Interwoven Bridge deposit/withdraw
  4. Minimal 1 working swap (AMM)
  5. .initia/submission.json + README + demo video

CRITICAL (tanpa ini = skor rendah, kemungkinan kalah):
  6. Smart routing (multi-path comparison + best route)
  7. Auto-sign session UX
  8. Multi-hop swap
  9. Bahasa Indonesia UI + IDR display

WINNING EDGE (ini yang bikin menang):
  10. Limit orders on-chain (auto-sign + oracle)
  11. Batch swap (portfolio rebalancing 1 tx)
  12. .init usernames (send-to-username, leaderboard, referral)
  13. Route visualization (animated flow diagram)
  14. Savings dashboard (Rupiah, tangible proof of value)
```

## Revenue Model (Initia Value Capture)

```
Karena RupiahRoute = appchain sendiri, semua value captured:

  Revenue Stream          | Rate     | Contoh (1000 swap/hari)
  ------------------------|----------|------------------------
  1. Gas fee (setiap tx)  | ~$0.001  | $1/hari
  2. Swap fee             | 0.30%    | $300/hari (at $100k vol)
  3. Routing fee           | 0.05%    | $50/hari
  4. Limit order exec fee | 0.10%    | $20/hari (est. 20% orders)
  ------------------------|----------|------------------------
  Total                   |          | ~$371/hari → $11k/bulan

  Scaling:
  - 100ms blocks = ~600 tx/menit capacity
  - More volume → more routing savings → more users → flywheel
  - Limit orders = sticky feature (user set & forget)
  - Referral (.init) = organic growth

  Filosofi Initia: "Every transaction your users make?
  That's revenue you keep, not value you leak."
  → RupiahRoute = living proof of this thesis.
```

## Scoring Alignment

| Criteria | Weight | RupiahRoute Advantage |
|---|---|---|
| **Originality & Track Fit** | 20% | Satu-satunya smart routing engine di Initia. Bukan DEX clone — ini DeFi infrastructure baru. Limit orders on-chain = novel. Indonesia-first = underserved market. |
| **Technical Execution & Initia Integration** | 30% | **Semua 3 native features** diimplementasi secara meaningful. ConnectOracle, Cosmos Precompile, Router API, IBC hooks, unified token model. Ini level integrasi terdalam yang possible. |
| **Product Value & UX** | 20% | Auto-sign limit orders (CEX on-chain). Batch swap (1 tx rebalancing). Send-to-username (DeFi rasa GoPay). Bahasa Indonesia + Rupiah. Visual route map. |
| **Working Demo & Completeness** | 20% | End-to-end dengan real testnet tokens. 8-step demo covering: connect → deposit → swap → limit order → batch → send → dashboard → withdraw. Tidak ada mock. |
| **Market Understanding** | 10% | Indonesia = 20M+ crypto users, largely underserved. Revenue model jelas dan sustainable. Tidak ada competitor di Initia ecosystem. Post-hackathon path: EIR → mainnet launch. |

## Demo Script (1-3 Menit)

```
[0:00-0:10] INTRO
  "RupiahRoute — Google Maps untuk DeFi di Initia"
  Buka app, tampilkan UI Bahasa Indonesia

[0:10-0:20] CONNECT
  Connect wallet via InterwovenKit
  Header shows: "@rupiahking.init" (bukan hex address)

[0:20-0:35] DEPOSIT (Native Feature: Interwoven Bridge)
  Klik "Deposit" → Bridge modal muncul
  Bridge 1000 INIT dari L1 ke RupiahRoute appchain
  "Token sampai dalam hitungan detik — tanpa switch network"

[0:35-1:00] SMART SWAP (Core Feature: Routing Engine)
  Input: 500 INIT → USDC
  Engine tampilkan 3 route + animated flow diagram
  "Route B (multi-hop) +0.26% lebih banyak USDC"
  "Hemat Rp 4,100 dibanding swap biasa"
  Klik swap → instant execution (100ms)

[1:00-1:15] AUTO-SIGN (Native Feature: Auto-Signing)
  Enable auto-sign session
  Swap lagi: 200 INIT → ETH — TANPA popup wallet
  "Trading se-smooth Binance, tapi non-custodial"

[1:15-1:35] LIMIT ORDER (Auto-Sign + Oracle Combo)
  Set: "Beli TIA kalau harga turun 5%"
  Order tersimpan on-chain, auto-execute nanti
  "Fitur CEX, sekarang fully on-chain di Initia"

[1:35-1:55] BATCH SWAP (Portfolio Rebalancing)
  Input: 300 INIT → 40% USDC + 30% ETH + 30% TIA
  1 transaksi, 3 swap, setiap swap pakai best route
  "Rebalance portfolio: 1 tx, 1 gas fee"

[1:55-2:10] SEND TO USERNAME (Native Feature: Initia Usernames)
  Kirim 50 USDC ke "@teman.init"
  "DeFi rasa GoPay — kirim ke nama, bukan ke kode"

[2:10-2:30] SAVINGS DASHBOARD
  "Total penghematan: Rp 125,000"
  "23 swap, 95% gas savings vs Ethereum"
  Show leaderboard: "@toptrader.init — Vol: $12,500"

[2:30-2:45] WITHDRAW
  Withdraw USDC ke L1 via Interwoven Bridge
  "Seamless in, seamless out"

[2:45-3:00] CLOSING
  "RupiahRoute: Smart routing, 3 native features,
   limit orders on-chain, Indonesia-first UX.
   Semua di L2 appchain Initia — cepat, murah, profitable."
```

## Submission Files

### `.initia/submission.json`
```json
{
  "project_name": "RupiahRoute",
  "repo_url": "https://github.com/<username>/rupiahroute",
  "commit_sha": "<40-char-hex>",
  "rollup_chain_id": "rupiahroute-1",
  "deployed_address": "<RupiahRouter.sol contract address>",
  "vm": "evm",
  "native_feature": "interwoven-bridge",
  "core_logic_path": "contracts/src/RupiahRouter.sol",
  "native_feature_frontend_path": "frontend/src/components/Bridge.tsx",
  "demo_video_url": "https://youtube.com/watch?v=<video_id>"
}
```

> Note: `native_feature` field hanya menerima 1 value. Kita pilih `"interwoven-bridge"` sebagai primary karena paling core ke DeFi flow. Tapi Auto-Sign dan Initia Usernames tetap diimplementasi dan di-demo.

## References

- [Initia Hackathon Docs](https://docs.initia.xyz/hackathon)
- [InterwovenKit Overview](https://docs.initia.xyz/build/interwovenkit/overview)
- [Interwoven Bridge API](https://docs.initia.xyz/build/interwovenkit/features/bridge)
- [Auto-Sign Docs](https://docs.initia.xyz/build/interwovenkit/features/autosign)
- [Initia Usernames](https://docs.initia.xyz/build/interwovenkit/features/usernames)
- [MiniEVM Reference](https://docs.initia.xyz/build/reference/evm)
- [ConnectOracle (Slinky)](https://docs.initia.xyz/build/reference/oracle)
- [Cosmos Precompile](https://docs.initia.xyz/build/reference/evm#cosmos-precompile)
- [Initia Router API](https://router-api.initia.xyz)
- [Initia EVM Contracts](https://github.com/initia-labs/initia-evm-contracts)
- [Initia Examples](https://github.com/initia-labs/examples)
- [Foundry Book](https://book.getfoundry.sh/)
