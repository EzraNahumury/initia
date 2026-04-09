/**
 * Real DEX Aggregator API integration.
 * Fetches live quotes from free, CORS-enabled APIs (no API key needed).
 * Falls back to CoinGecko-based estimation when token pair isn't supported.
 */

/* ── Ethereum Mainnet token addresses for API queries ────── */

const ETH_TOKENS: Record<string, { address: string; decimals: number }> = {
  USDC:  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  WETH:  { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
  ETH:   { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18 },
  USDT:  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  WBTC:  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
  DAI:   { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
};

export interface DexQuote {
  name: string;
  protocol: string;
  accent: string;
  outputAmount: number;
  gasUsd: string;
  isLive: boolean;
  error?: string;
}

function toWei(amount: number, decimals: number): string {
  return BigInt(Math.floor(amount * 10 ** Math.min(decimals, 8)) * 10 ** Math.max(decimals - 8, 0)).toString();
}

function fromWei(amount: string, decimals: number): number {
  return Number(BigInt(amount)) / 10 ** decimals;
}

/* ── Individual DEX fetchers ─────────────────────────────── */

async function fetchLiFi(
  inAddr: string, inDec: number,
  outAddr: string, outDec: number,
  amount: number,
): Promise<{ output: number; gasUsd: string } | null> {
  const amtWei = toWei(amount, inDec);
  const url = `https://li.quest/v1/quote?fromChain=1&toChain=1&fromToken=${inAddr}&toToken=${outAddr}&fromAmount=${amtWei}&fromAddress=0x0000000000000000000000000000000000000000&slippage=0.01`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  const output = fromWei(data.estimate?.toAmount ?? "0", outDec);
  const gas = data.estimate?.gasCosts?.[0]?.amountUSD ?? "0";
  return { output, gasUsd: `$${Number(gas).toFixed(2)}` };
}

async function fetchOpenOcean(
  inAddr: string, inDec: number,
  outAddr: string, outDec: number,
  amount: number,
): Promise<{ output: number; gasUsd: string } | null> {
  const amtWei = toWei(amount, inDec);
  const url = `https://open-api.openocean.finance/v3/1/quote?inTokenAddress=${inAddr}&outTokenAddress=${outAddr}&amount=${amtWei}&gasPrice=30`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.code !== 200 || !data.data) return null;
  const output = fromWei(data.data.outAmount ?? "0", outDec);
  return { output, gasUsd: `$${Number(data.data.estimatedGas ?? 0) * 30 * 1e-9 * 2500 > 0.01 ? (Number(data.data.estimatedGas ?? 0) * 30 * 1e-9 * 2500).toFixed(2) : "0.50"}` };
}

async function fetchKyberSwap(
  inAddr: string, _inDec: number,
  outAddr: string, outDec: number,
  amount: number, inDec: number,
): Promise<{ output: number; gasUsd: string } | null> {
  const amtWei = toWei(amount, inDec);
  const url = `https://aggregator-api.kyberswap.com/ethereum/api/v1/routes?tokenIn=${inAddr}&tokenOut=${outAddr}&amountIn=${amtWei}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { "x-client-id": "rupiahrote" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const amountOut = data.data?.routeSummary?.amountOut;
  if (!amountOut) return null;
  const output = fromWei(amountOut, outDec);
  const gasUsd = data.data?.routeSummary?.gasUsd ?? "1.50";
  return { output, gasUsd: `$${Number(gasUsd).toFixed(2)}` };
}

async function fetchParaswap(
  inAddr: string, inDec: number,
  outAddr: string, outDec: number,
  amount: number,
): Promise<{ output: number; gasUsd: string } | null> {
  const amtWei = toWei(amount, inDec);
  const url = `https://apiv5.paraswap.io/prices?srcToken=${inAddr}&destToken=${outAddr}&amount=${amtWei}&srcDecimals=${inDec}&destDecimals=${outDec}&side=SELL&network=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const data = await res.json();
  const destAmount = data.priceRoute?.destAmount;
  if (!destAmount) return null;
  const output = fromWei(destAmount, outDec);
  const gasCostUSD = data.priceRoute?.gasCostUSD ?? "3.00";
  return { output, gasUsd: `$${Number(gasCostUSD).toFixed(2)}` };
}

/* ── DEX definitions with fetch capability ───────────────── */

interface DexDef {
  name: string;
  protocol: string;
  accent: string;
  mult: number;        // fallback multiplier when API unavailable
  gasUsd: string;      // fallback gas
  fetcher?: "lifi" | "openocean" | "kyberswap" | "paraswap";
}

const ALL_DEXS: DexDef[] = [
  { name: "LI.FI",       protocol: "Aggregator",  accent: "#AA54FF", mult: 0, gasUsd: "",  fetcher: "lifi" },
  { name: "OpenOcean",   protocol: "Aggregator",  accent: "#1B6EF3", mult: 0, gasUsd: "",  fetcher: "openocean" },
  { name: "KyberSwap",   protocol: "Multi-chain", accent: "#31CB9E", mult: 0, gasUsd: "",  fetcher: "kyberswap" },
  { name: "ParaSwap",    protocol: "Aggregator",  accent: "#0058F7", mult: 0, gasUsd: "",  fetcher: "paraswap" },
];

/* ── Main quote fetcher ──────────────────────────────────── */

export async function fetchAllDexQuotes(
  tokenInSymbol: string,
  tokenOutSymbol: string,
  amountIn: number,
  _fallbackRate?: number,
): Promise<DexQuote[]> {
  const inToken = ETH_TOKENS[tokenInSymbol];
  const outToken = ETH_TOKENS[tokenOutSymbol];
  const canFetchLive = !!inToken && !!outToken && amountIn > 0;

  // Fire off live API calls in parallel for DEXs that have fetchers
  const fetcherMap: Record<string, (
    inA: string, inD: number, outA: string, outD: number, amt: number, inDec: number,
  ) => Promise<{ output: number; gasUsd: string } | null>> = {
    lifi: (a, b, c, d, e) => fetchLiFi(a, b, c, d, e),
    openocean: (a, b, c, d, e) => fetchOpenOcean(a, b, c, d, e),
    kyberswap: (a, _b, c, d, e, f) => fetchKyberSwap(a, _b, c, d, e, f),
    paraswap: (a, b, c, d, e) => fetchParaswap(a, b, c, d, e),
  };

  type ResultEntry = { dex: DexDef; result: { output: number; gasUsd: string } | null };

  let liveResults: ResultEntry[] = [];

  if (canFetchLive) {
    const promises = ALL_DEXS
      .filter((d) => d.fetcher)
      .map(async (dex): Promise<ResultEntry> => {
        try {
          const fn = fetcherMap[dex.fetcher!];
          const result = await fn(
            inToken.address, inToken.decimals,
            outToken.address, outToken.decimals,
            amountIn, inToken.decimals,
          );
          return { dex, result };
        } catch {
          return { dex, result: null };
        }
      });

    liveResults = await Promise.allSettled(promises).then((settled) =>
      settled
        .filter((s): s is PromiseFulfilledResult<ResultEntry> => s.status === "fulfilled")
        .map((s) => s.value),
    );
  }

  // Only return DEXs that returned a real live quote
  const quotes: DexQuote[] = [];
  for (const { dex, result } of liveResults) {
    if (result) {
      quotes.push({
        name: dex.name,
        protocol: dex.protocol,
        accent: dex.accent,
        outputAmount: result.output,
        gasUsd: result.gasUsd,
        isLive: true,
      });
    }
  }
  return quotes.sort((a, b) => b.outputAmount - a.outputAmount);
}
