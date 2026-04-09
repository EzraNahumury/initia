# API Reference — RupiahRoute Frontend

All external APIs, endpoints, and services used by the frontend.

---

## Live Data APIs

| API | Endpoint | Purpose | Refresh | File |
|-----|----------|---------|---------|------|
| CoinGecko Prices | `https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd` | Live token prices (INIT, ETH, USDC, TIA, ATOM, OSMO, INJ, SEI, WBTC, USDT) | 60s | `components/SwapView.tsx` |
| Uniswap Token List | `https://tokens.uniswap.org` | EVM token metadata for token selector | On demand | `lib/uniswap-tokens.ts` |
| Initia Chain Registry | `https://raw.githubusercontent.com/initia-labs/initia-registry/main/mainnets/{chain}/chain.json` | Chain metadata & logos for Initia ecosystem | On demand | `lib/uniswap-tokens.ts` |
| Initia Asset List | `https://raw.githubusercontent.com/initia-labs/initia-registry/main/mainnets/{chain}/assetlist.json` | Token lists for Initia chains | On demand | `lib/uniswap-tokens.ts` |

### CoinGecko Token ID Mapping

| Symbol | CoinGecko ID |
|--------|-------------|
| INIT | `initia` |
| USDC | `usd-coin` |
| ETH / WETH | `ethereum` |
| TIA | `celestia` |
| USDT | `tether` |
| ATOM | `cosmos` |
| OSMO | `osmosis` |
| INJ | `injective-protocol` |
| SEI | `sei-network` |
| WBTC / BTC | `bitcoin` |
| IDRX | Hardcoded (`1/16050 USD`) |

### Initia Registry Chains Fetched

`initia`, `civitia`, `echelon`, `embr`, `inertia`, `intergaze`, `rave`, `strat`, `yominet`, `cabal`

---

## Blockchain RPC

| Endpoint | Purpose | Refresh | File |
|----------|---------|---------|------|
| `http://localhost:8545` | Initia MiniEVM rollup (Rupiahrote-1) — JSON-RPC | Persistent | `lib/chain.ts`, `lib/wagmi.ts` |
| `http://localhost:8545` (eth_getBalance) | Wallet GAS balance | 10s | `components/WalletButton.tsx` |

### Smart Contract Calls (via wagmi)

| Function | Type | Purpose | File |
|----------|------|---------|------|
| `getQuote(tokenIn, tokenOut, amountIn)` | Read | Get swap quote + route | `components/SwapView.tsx` |
| `executeRoute(route, minOut, deadline)` | Write | Execute swap | `components/SwapView.tsx` |
| `placeLimitOrder(...)` | Write | Place limit order | `components/LimitOrderCard.tsx` |
| `getActiveOrders(address)` | Read | Fetch user's limit orders | `components/LimitOrderCard.tsx` |
| `batchSwap(...)` | Write | Batch swap execution | `components/BatchSwapCard.tsx` |
| `sendToUsername(...)` | Write | Send to .init username | `components/SendCard.tsx` |
| `userSwapCount(address)` | Read | Dashboard stats | `components/DashboardView.tsx` |

---

## Smart Contract Addresses

| Contract | Address | Source |
|----------|---------|--------|
| RupiahRouter | `0xfE416695bf63C7F120A85550fe74a7CA1E127a27` | `.env.local` (`NEXT_PUBLIC_ROUTER_CONTRACT`) |
| INIT Token | `0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32` | `lib/contract.ts` |
| USDC Token | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | `lib/contract.ts` |
| WETH Token | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | `lib/contract.ts` |
| TIA Token | `0x7C9f4C87d911613Fe9ca58b579f737911AAD2D43` | `lib/contract.ts` |
| IDRX Token | `0x18bc5bCC660Cf2B9Ce3cD51a404aFe1a0cBd3C22` | `lib/contract.ts` |

---

## Image CDNs

| Source | Base URL | Used For |
|--------|----------|----------|
| Initia Registry | `https://raw.githubusercontent.com/initia-labs/initia-registry/main/images/` | INIT, ETH, TIA, USDC token logos |
| TrustWallet Assets | `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/{address}/logo.png` | Fallback ERC-20 token logos |
| Llama.fi Icons | `https://icons.llamao.fi/icons/chains/` | Chain icons (Arbitrum, Optimism, Base, Polygon, etc.) |
| CoinGecko Assets | `https://assets.coingecko.com/coins/images/` | IDRX token logo |
| Cosmos Registry | `https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/` | ATOM logo |

---

## WalletConnect

| Key | Value | Source |
|-----|-------|--------|
| Project ID | `3e748713fd9de3b75b5aeb857d8a4150` | `.env.local` (`NEXT_PUBLIC_WC_PROJECT_ID`) |

---

## External Links (non-API)

| Link | Purpose | File |
|------|---------|------|
| `https://scan.testnet.initia.xyz` | Block explorer | `lib/chain.ts` |
| `https://rabby.io` | Rabby Wallet | `components/WalletButton.tsx` |
| `https://www.okx.com/web3` | OKX Wallet | `components/WalletButton.tsx` |
| `https://trustwallet.com` | Trust Wallet | `components/WalletButton.tsx` |
| `https://phantom.app` | Phantom Wallet | `components/WalletButton.tsx` |
| `https://rainbow.me` | Rainbow Wallet | `components/WalletButton.tsx` |
| `https://zerion.io` | Zerion Wallet | `components/WalletButton.tsx` |
| `https://ethereum.org/wallets` | Wallet info page | `components/WalletButton.tsx` |

---

## Chain Configuration

| Parameter | Value |
|-----------|-------|
| Chain ID | `1212385660403083` |
| Chain Name | Rupiahrote-1 |
| Gas Token | GAS (18 decimals) |
| RPC | `http://localhost:8545` |
| Block Explorer | `https://scan.testnet.initia.xyz` |

---

## Error Handling

| API | Fallback Behavior |
|-----|-------------------|
| CoinGecko | Falls back to `FALLBACK_RATES` in `SwapView.tsx`. Shows amber "Offline" indicator + warning banner. |
| Uniswap Token List | Token selector shows only core tokens (INIT, USDC, WETH, TIA, IDRX). |
| Initia Registry | Chain/token entries skipped silently. |
| Local RPC | Wallet shows "0 GAS" balance. Contract calls return error state. |
