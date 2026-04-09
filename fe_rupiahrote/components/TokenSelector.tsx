"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import { CORE_TOKENS, TOKENS, type Token } from "@/lib/contract";
import { tokenStyle } from "@/lib/tokens";
import { fetchUniswapTokenList, type UniToken, type UniChain } from "@/lib/uniswap-tokens";
import {
  HiChevronDown,
  HiMagnifyingGlass,
  HiStar,
  HiXMark,
  HiDocumentDuplicate,
} from "react-icons/hi2";

/* ── Props ───────────────────────────────────────────────── */

interface Props {
  selected: Token;
  onSelect: (t: Token) => void;
  disabledToken?: Token;
}

/* ── Component ───────────────────────────────────────────── */

export function TokenSelector({ selected, onSelect, disabledToken }: Props) {
  const [open, setOpen] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");
  const [chainSearch, setChainSearch] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [uniTokens, setUniTokens] = useState<UniToken[]>([]);
  const [uniChains, setUniChains] = useState<UniChain[]>([]);
  const [loading, setLoading] = useState(false);
  const { address: walletAddr } = useAccount();
  const inputRef = useRef<HTMLInputElement>(null);
  const ts = tokenStyle(selected.symbol);

  // Fetch Uniswap token list on first open
  useEffect(() => {
    if (!open || uniTokens.length > 0) return;
    setLoading(true);
    fetchUniswapTokenList().then(({ tokens, chains }) => {
      setUniTokens(tokens);
      setUniChains(chains);
      setLoading(false);
    });
  }, [open, uniTokens.length]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const closeModal = () => { setOpen(false); setTokenSearch(""); setChainSearch(""); };

  // Filter chains
  const filteredChains = useMemo(() => {
    const base: UniChain[] = [
      { chainId: 0, name: "RupiahRoute", logo: "/logo/logo.png", color: "#0a0a0a" },
      ...uniChains.filter((c) => c.chainId !== 0),
    ];
    if (!chainSearch) return base;
    const q = chainSearch.toLowerCase();
    return base.filter((c) => c.name.toLowerCase().includes(q));
  }, [uniChains, chainSearch]);

  // Build full token list: our core tokens + ALL Uniswap tokens
  const allTokens = useMemo(() => {
    const core: UniToken[] = CORE_TOKENS.map((t) => ({
      chainId: 0, address: t.address, name: t.name,
      symbol: t.symbol, decimals: t.decimals, logoURI: t.logoURI,
    }));
    return [...core, ...uniTokens];
  }, [uniTokens]);

  // Filter by chain + search
  const filteredTokens = useMemo(() => {
    let list = allTokens;

    // Chain filter
    if (selectedChainId !== null) {
      list = list.filter((t) => t.chainId === selectedChainId);
    }

    // Search filter (searches across all chains)
    if (tokenSearch) {
      const q = tokenSearch.toLowerCase();
      list = allTokens.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allTokens, tokenSearch, selectedChainId]);

  const totalTokenCount = allTokens.length;

  const handleCopy = (addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 1500);
  };

  const handleSelectToken = (t: UniToken) => {
    // Always preserve logoURI from the API data
    const existing = TOKENS.find((tk) => tk.symbol === t.symbol);
    onSelect({
      symbol: t.symbol,
      name: t.name,
      address: (existing?.address || t.address) as `0x${string}`,
      decimals: t.decimals,
      icon: existing?.icon || "",
      logoURI: t.logoURI || existing?.logoURI,
      denom: existing?.denom || t.symbol.toLowerCase(),
    });
    closeModal();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-border hover:border-border-hover transition-colors cursor-pointer"
      >
        <TokenIcon symbol={selected.symbol} logoURI={selected.logoURI} address={selected.address} size={26} />
        <span className="text-[14px] font-semibold text-text">{selected.symbol}</span>
        <HiChevronDown className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center animate-[fadeIn_0.12s_ease]"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative rounded-2xl glow-purple w-[640px] max-w-[94vw] h-[520px] max-h-[82vh] flex overflow-hidden animate-[slideUp_0.18s_ease]"
            style={{ background: "#0f0f23", border: "1px solid rgba(139,92,246,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Left: Chains ── */}
            <div className="w-[195px] shrink-0 border-r border-purple/20 flex flex-col">
              <div className="p-3">
                <div className="flex items-center gap-2 bg-purple/10 rounded-xl px-3 py-2 border border-purple/20">
                  <HiMagnifyingGlass className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Search chain"
                    value={chainSearch}
                    onChange={(e) => setChainSearch(e.target.value)}
                    className="flex-1 bg-transparent text-[8px] outline-none placeholder-text-muted/50 text-text"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-3">
                {/* All Chains button */}
                <button
                  onClick={() => setSelectedChainId(null)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[8px] mb-1 transition-colors cursor-pointer ${
                    selectedChainId === null ? "bg-purple text-white font-semibold" : "text-text-sub hover:bg-purple/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${
                    selectedChainId === null ? "bg-purple text-white" : "bg-purple/20 text-text-sub"
                  }`}>
                    <HiStar className="w-3.5 h-3.5" />
                  </div>
                  <span className="flex-1 text-left">All Chains</span>
                  <span className={`text-[7px] ${selectedChainId === null ? "text-white/60" : "text-text-muted"}`}>
                    {totalTokenCount}
                  </span>
                </button>

                <div className="h-px bg-purple/10 mx-1 my-1" />

                {filteredChains.map((chain) => {
                  const isActive = selectedChainId === chain.chainId;
                  const tokenCount = chain.chainId > 0
                    ? uniTokens.filter((t) => t.chainId === chain.chainId).length
                    : chain.chainId === 0 ? CORE_TOKENS.length : 0;

                  return (
                    <button
                      key={chain.chainId}
                      onClick={() => setSelectedChainId(chain.chainId === 0 ? 0 : chain.chainId)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[8px] mb-0.5 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-purple text-white font-semibold"
                          : "text-text-sub hover:bg-purple/10"
                      }`}
                    >
                      {/* Chain icon */}
                      {chain.logo ? (
                        <img
                          src={chain.logo}
                          alt={chain.name}
                          className="w-6 h-6 rounded-full shrink-0 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 ${chain.logo ? "hidden" : ""}`}
                        style={{
                          backgroundColor: isActive ? "#fff" : chain.color,
                          color: isActive ? "#0a0a0a" : chain.color === "#F0B90B" || chain.color === "#FFEEDA" ? "#1a1a2e" : "#fff",
                        }}
                      >
                        {chain.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-left">{chain.name}</span>
                      {tokenCount > 0 && (
                        <span className={`text-[7px] ${isActive ? "text-white/60" : "text-text-muted"}`}>
                          {tokenCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Right: Tokens ── */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Search + close */}
              <div className="flex items-center gap-2 p-3">
                <div className="flex-1 flex items-center gap-2 bg-purple/10 rounded-xl px-3 py-2 border border-purple/20">
                  <HiMagnifyingGlass className="w-4 h-4 text-text-muted shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search token name or paste address..."
                    value={tokenSearch}
                    onChange={(e) => setTokenSearch(e.target.value)}
                    className="flex-1 bg-transparent text-[8px] outline-none placeholder-text-muted/50 text-text"
                  />
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-purple/10 transition-colors cursor-pointer shrink-0"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Token list */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="py-14 text-center text-[8px] text-text-muted">
                    <div className="w-5 h-5 border-2 border-purple/20 border-t-purple/50 rounded-full animate-spin mx-auto mb-2" />
                    Loading tokens...
                  </div>
                ) : filteredTokens.length === 0 ? (
                  <div className="py-14 text-center text-[8px] text-text-muted">
                    No tokens found
                  </div>
                ) : (
                  filteredTokens.map((token, i) => (
                    <button
                      key={`${token.chainId}-${token.address}-${i}`}
                      disabled={disabledToken?.address?.toLowerCase() === token.address.toLowerCase()}
                      onClick={() => handleSelectToken(token)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        disabledToken?.address?.toLowerCase() === token.address.toLowerCase()
                          ? "opacity-20 cursor-not-allowed"
                          : selected.symbol === token.symbol
                            ? "bg-purple/10 cursor-pointer"
                            : "hover:bg-purple/10 cursor-pointer"
                      }`}
                    >
                      <TokenIcon symbol={token.symbol} logoURI={token.logoURI} address={token.address} size={28} />

                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] font-semibold text-text truncate">{token.name}</div>
                        <div className="flex items-center gap-1.5 text-[7px] text-text-muted">
                          <span className="font-medium">{token.symbol}</span>
                          <span className="text-text-muted/50">&middot;</span>
                          <span className="font-mono">
                            {token.address.slice(0, 6)}...{token.address.slice(-4)}
                          </span>
                          <span
                            role="button"
                            onClick={(e) => handleCopy(token.address, e)}
                            className="text-text-muted hover:text-text-sub transition-colors cursor-pointer ml-0.5"
                          >
                            <HiDocumentDuplicate className="w-3 h-3" />
                          </span>
                          {copiedAddr === token.address && (
                            <span className="text-[7px] text-green font-medium">Copied</span>
                          )}
                        </div>
                      </div>

                      {selected.symbol === token.symbol && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/* ── Token icon — tries logoURI → TrustWallet → colored circle ── */

function buildFallbackUrls(logoURI?: string, address?: string): string[] {
  const urls: string[] = [];
  if (logoURI) urls.push(logoURI);
  // TrustWallet assets fallback for EVM tokens (checksum address)
  if (address && address.startsWith("0x") && address.length === 42) {
    urls.push(
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    );
  }
  return urls;
}

function TokenIcon({ symbol, logoURI, address, size = 36 }: {
  symbol: string; logoURI?: string; address?: string; size?: number;
}) {
  const [srcIdx, setSrcIdx] = useState(0);
  const urls = useMemo(() => buildFallbackUrls(logoURI, address), [logoURI, address]);
  const s = tokenStyle(symbol);

  // Reset srcIdx when logoURI changes (new token selected)
  useEffect(() => { setSrcIdx(0); }, [logoURI, address]);

  const currentSrc = urls[srcIdx];

  if (currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={symbol}
        className="rounded-full shrink-0 object-cover bg-purple/10"
        style={{ width: size, height: size }}
        onError={() => setSrcIdx((i) => i + 1)}
      />
    );
  }

  return (
    <div
      className={`${s.bg} rounded-full flex items-center justify-center ring-2 ${s.ring} shrink-0`}
      style={{ width: size, height: size }}
    >
      <span className="font-bold text-white" style={{ fontSize: size * 0.35 }}>
        {symbol.length > 4 ? symbol.slice(0, 2) : symbol.charAt(0)}
      </span>
    </div>
  );
}
