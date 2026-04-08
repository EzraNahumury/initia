// Fetches tokens & chains from:
// 1. Initia Registry (https://github.com/initia-labs/initia-registry) — real Initia chains
// 2. Uniswap Token List (https://tokens.uniswap.org) — EVM tokens

export interface UniToken {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export interface UniChain {
  chainId: number;
  name: string;
  logo: string;
  color: string;
}

/* ── Initia mainnet chains from initia-registry ──────────── */

const INITIA_CHAINS: { name: string; prettyName: string; chainId: string; color: string }[] = [
  { name: "initia",    prettyName: "Initia",    chainId: "interwoven-1",    color: "#6366F1" },
  { name: "civitia",   prettyName: "Civitia",   chainId: "civitia-1",      color: "#F59E0B" },
  { name: "echelon",   prettyName: "Echelon",   chainId: "echelon-1",      color: "#10B981" },
  { name: "embr",      prettyName: "Embr.fun",  chainId: "embrmainnet-1",  color: "#EF4444" },
  { name: "inertia",   prettyName: "Inertia",   chainId: "inertia-2",      color: "#3B82F6" },
  { name: "intergaze", prettyName: "Intergaze", chainId: "intergaze-1",    color: "#8B5CF6" },
  { name: "rave",      prettyName: "Rave",      chainId: "rave-1",         color: "#EC4899" },
  { name: "strat",     prettyName: "Strat",     chainId: "strat-1",        color: "#14B8A6" },
  { name: "yominet",   prettyName: "Yominet",   chainId: "yominet-1",      color: "#F97316" },
  { name: "cabal",     prettyName: "Cabal",     chainId: "cabal-1",        color: "#6B7280" },
];

// Numeric IDs for Initia chains (negative to avoid EVM chainId conflicts)
function initiaChainNumericId(index: number): number {
  return -(index + 1); // -1, -2, -3, ...
}

/* ── EVM chain metadata ──────────────────────────────────── */

const EVM_CHAIN_META: Record<number, { name: string; logo: string; color: string }> = {
  1:     { name: "Ethereum",   logo: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg",  color: "#627EEA" },
  10:    { name: "OP Mainnet", logo: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg",  color: "#FF0420" },
  56:    { name: "BNB Chain",  logo: "https://icons.llamao.fi/icons/chains/rsz_binance.jpg",   color: "#F0B90B" },
  130:   { name: "Unichain",  logo: "https://icons.llamao.fi/icons/chains/rsz_unichain.jpg",  color: "#FF007A" },
  137:   { name: "Polygon",   logo: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",   color: "#8247E5" },
  8453:  { name: "Base",      logo: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",      color: "#0052FF" },
  42161: { name: "Arbitrum",  logo: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg",   color: "#28A0F0" },
  43114: { name: "Avalanche", logo: "https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg", color: "#E84142" },
};

const REGISTRY_BASE = "https://raw.githubusercontent.com/initia-labs/initia-registry/main";

/* ── Fetch ───────────────────────────────────────────────── */

let cache: { tokens: UniToken[]; chains: UniChain[] } | null = null;

async function fetchInitiaRegistry(): Promise<{ tokens: UniToken[]; chains: UniChain[] }> {
  const tokens: UniToken[] = [];
  const chains: UniChain[] = [];

  await Promise.all(
    INITIA_CHAINS.map(async (chain, idx) => {
      const numId = initiaChainNumericId(idx);
      const logoUrl = `${REGISTRY_BASE}/mainnets/${chain.name}/chain.json`;

      // Fetch chain logo from chain.json
      let chainLogo = "";
      try {
        const cRes = await fetch(`${REGISTRY_BASE}/mainnets/${chain.name}/chain.json`);
        const cData = await cRes.json();
        chainLogo = cData.logo_URIs?.png || cData.images?.[0]?.png || "";
      } catch {}

      chains.push({
        chainId: numId,
        name: chain.prettyName,
        logo: chainLogo || `${REGISTRY_BASE}/images/${chain.prettyName === "Initia" ? "INIT" : chain.name}.png`,
        color: chain.color,
      });

      // Fetch assetlist
      try {
        const res = await fetch(`${REGISTRY_BASE}/mainnets/${chain.name}/assetlist.json`);
        const data = await res.json();
        for (const asset of data.assets || []) {
          const symbol = asset.symbol || asset.display || "?";
          const name = asset.name || symbol;
          const logo = asset.logo_URIs?.png || asset.images?.[0]?.png || "";
          const decUnit = (asset.denom_units || []).find(
            (u: { denom: string; exponent: number }) => u.denom === asset.display,
          );
          tokens.push({
            chainId: numId,
            address: asset.base || "",
            name,
            symbol,
            decimals: decUnit?.exponent ?? 6,
            logoURI: logo,
          });
        }
      } catch {}
    }),
  );

  // Add IDRX (Indonesian Rupiah stablecoin) to Initia L1 (chainId -1)
  tokens.push({
    chainId: initiaChainNumericId(0), // Initia L1
    address: "0x18bc5bCC660Cf2B9Ce3cD51a404aFe1a0cBd3C22",
    name: "IDRX",
    symbol: "IDRX",
    decimals: 2,
    logoURI: "https://assets.coingecko.com/coins/images/34883/standard/IDRX_BLUE_COIN_200x200.png",
  });

  // Sort chains by their original order
  chains.sort((a, b) => Math.abs(a.chainId) - Math.abs(b.chainId));

  return { tokens, chains };
}

export async function fetchUniswapTokenList(): Promise<{
  tokens: UniToken[];
  chains: UniChain[];
}> {
  if (cache) return cache;

  // Fetch both sources in parallel
  const [initiaData, uniRes] = await Promise.all([
    fetchInitiaRegistry().catch(() => ({ tokens: [] as UniToken[], chains: [] as UniChain[] })),
    fetch("https://tokens.uniswap.org").then((r) => r.json()).catch(() => ({ tokens: [] })),
  ]);

  // Parse Uniswap tokens
  const uniTokens: UniToken[] = (uniRes.tokens || []).map((t: UniToken) => ({
    chainId: t.chainId,
    address: t.address,
    name: t.name,
    symbol: t.symbol,
    decimals: t.decimals,
    logoURI: t.logoURI,
  }));

  // Extract EVM chains
  const evmChainIds = [...new Set(uniTokens.map((t) => t.chainId))];
  const evmChains: UniChain[] = evmChainIds
    .map((id) => {
      const meta = EVM_CHAIN_META[id];
      if (!meta) return null;
      return { chainId: id, ...meta };
    })
    .filter(Boolean) as UniChain[];

  evmChains.sort((a, b) => {
    const cA = uniTokens.filter((t) => t.chainId === a.chainId).length;
    const cB = uniTokens.filter((t) => t.chainId === b.chainId).length;
    return cB - cA;
  });

  // Combine: Initia chains first, then EVM chains
  const allChains = [...initiaData.chains, ...evmChains];
  const allTokens = [...initiaData.tokens, ...uniTokens];

  cache = { tokens: allTokens, chains: allChains };
  return cache;
}
