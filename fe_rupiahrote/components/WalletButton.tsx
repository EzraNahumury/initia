"use client";

import { useAccount, useConnect, useDisconnect, type Connector } from "wagmi";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HiWallet, HiDocumentDuplicate } from "react-icons/hi2";

/* ── Fallback colors for wallets without icon ────────────── */

const BRAND_COLORS: Record<string, string> = {
  MetaMask: "#F6851B",
  WalletConnect: "#3B99FC",
  "Coinbase Wallet": "#0052FF",
  "Rabby Wallet": "#7C8AFF",
  Rabby: "#7C8AFF",
  "OKX Wallet": "#000000",
  Talisman: "#D5FF5C",
  "Trust Wallet": "#3375BB",
  Rainbow: "#001AFF",
  Phantom: "#AB9FF2",
  Zerion: "#2962EF",
  Injected: "#6366F1",
};

/* ── Popular wallets (shown when not detected) ───────────── */

interface PopularWallet {
  name: string;
  url: string;
  color: string;
}

const POPULAR_WALLETS: PopularWallet[] = [
  { name: "Rabby Wallet", url: "https://rabby.io", color: "#7C8AFF" },
  { name: "OKX Wallet", url: "https://www.okx.com/web3", color: "#000000" },
  { name: "Trust Wallet", url: "https://trustwallet.com", color: "#3375BB" },
  { name: "Phantom", url: "https://phantom.app", color: "#AB9FF2" },
  { name: "Rainbow", url: "https://rainbow.me", color: "#001AFF" },
  { name: "Zerion", url: "https://zerion.io", color: "#2962EF" },
];

/* ── Wallet icon — uses real connector icon when available ── */

function WalletIcon({
  name,
  iconUrl,
  size = 36,
}: {
  name: string;
  iconUrl?: string;
  size?: number;
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="rounded-xl shrink-0 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const bg = BRAND_COLORS[name] || "#6B7280";
  const textColor = name === "Talisman" ? "#000" : "#fff";
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold shrink-0 select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: textColor,
        fontSize: size * 0.42,
        lineHeight: 1,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export function WalletButton() {
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { t } = useTranslation();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [gasBalance, setGasBalance] = useState("0");
  const [copied, setCopied] = useState(false);

  // Fetch GAS balance
  useEffect(() => {
    if (!address) return;
    const fetchBalance = async () => {
      try {
        const res = await fetch("http://localhost:8545", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1,
          }),
        });
        const data = await res.json();
        if (data.result) {
          const ether = Number(BigInt(data.result)) / 1e18;
          setGasBalance(
            ether.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          );
        }
      } catch {}
    };
    fetchBalance();
    const iv = setInterval(fetchBalance, 10000);
    return () => clearInterval(iv);
  }, [address]);

  // Auto-close modal on connection
  useEffect(() => {
    if (isConnected) {
      setShowConnectModal(false);
      setSelectedConnectorId(null);
    }
  }, [isConnected]);

  const handleCopy = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setShowAccountPopup(false);
  }, [disconnect]);

  // De-duplicate & clean connector list
  const uniqueConnectors = connectors.filter((c, i, arr) => {
    // Skip duplicates by name
    if (arr.findIndex((x) => x.name === c.name) !== i) return false;
    // Hide generic "Injected" / "Browser Wallet" when named wallets exist
    if (c.name === "Injected" || c.name === "Browser Wallet") {
      const hasNamed = arr.some(
        (x) =>
          x.name !== "Injected" &&
          x.name !== "Browser Wallet" &&
          x.name !== "WalletConnect" &&
          x.name !== "Coinbase Wallet" &&
          x.type === "injected",
      );
      if (hasNamed) return false;
    }
    return true;
  });

  // Popular wallets not already detected
  const detectedNames = new Set(uniqueConnectors.map((c) => c.name));
  const popularNotDetected = POPULAR_WALLETS.filter(
    (w) => !detectedNames.has(w.name),
  );

  const selectedConnector = connectors.find(
    (c) => c.uid === selectedConnectorId,
  );

  /* ────────────────────────── CONNECTED ────────────────────────── */

  if (isConnected && address) {
    return (
      <>
        <button
          onClick={() => setShowAccountPopup(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-full border border-purple/30 text-white hover:border-purple/50 hover:shadow-[0_0_10px_rgba(159,41,255,0.15)] transition-all cursor-pointer"
          style={{ background: "rgba(15,15,35,0.8)" }}
        >
          <WalletIcon
            name={connector?.name ?? ""}
            iconUrl={connector?.icon}
            size={20}
          />
          <span className="font-mono font-medium text-emerald-400">
            {gasBalance} GAS
          </span>
          <span style={{ color: "rgba(139,92,246,0.4)" }}>|</span>
          <span className="font-mono font-medium" style={{ color: "#ffffff" }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </button>

        {/* ── Account popup (portaled to body) ── */}
        {showAccountPopup && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center animate-[fadeIn_0.15s_ease]"
            onClick={() => setShowAccountPopup(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="relative rounded-2xl glow-purple p-6 w-[300px] flex flex-col items-center gap-3 animate-[slideUp_0.2s_ease]"
              style={{ background: "#0f0f23", border: "1px solid rgba(139,92,246,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAccountPopup(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-white cursor-pointer text-sm"
                style={{ background: "rgba(159,41,255,0.15)" }}
              >
                &#x2715;
              </button>

              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(159,41,255,0.1)" }}>
                <WalletIcon
                  name={connector?.name ?? ""}
                  iconUrl={connector?.icon}
                  size={40}
                />
              </div>

              <p className="font-bold text-lg font-mono" style={{ color: "#ffffff" }}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-sm" style={{ color: "#34d399" }}>{gasBalance} GAS</p>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-[12px] font-medium hover:bg-purple/10 transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(139,92,246,0.2)", color: "#ffffff" }}
                >
                  <HiDocumentDuplicate className="w-5 h-5" style={{ color: "#b78aff" }} />
                  {copied ? t("wallet.copied") : t("wallet.copyAddress")}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-[12px] font-medium hover:bg-red/10 transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(239,68,68,0.2)", color: "#ffffff" }}
                >
                  <HiWallet className="w-5 h-5" style={{ color: "#ef4444" }} />
                  {t("wallet.disconnect")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      </>
    );
  }

  /* ────────────────────── NOT CONNECTED ────────────────────── */

  return (
    <>
      <button
        onClick={() => setShowConnectModal(true)}
        className="px-4 py-2 text-[13px] font-semibold rounded-full bg-purple text-white hover:bg-purple-light transition-colors cursor-pointer"
      >
        {t("common.connectWallet")}
      </button>

      {/* ── Connect modal (portaled to body) ── */}
      {showConnectModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center animate-[fadeIn_0.15s_ease]"
          onClick={() => {
            setShowConnectModal(false);
            setSelectedConnectorId(null);
          }}
        >
          <div className="absolute inset-0 bg-black/60" />

          <div
            className="relative rounded-2xl glow-purple w-[560px] max-w-[92vw] h-[440px] max-h-[80vh] flex overflow-hidden animate-[slideUp_0.2s_ease]"
            style={{ background: "#0f0f23", border: "1px solid rgba(139,92,246,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* close */}
            <button
              onClick={() => {
                setShowConnectModal(false);
                setSelectedConnectorId(null);
              }}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-white cursor-pointer z-10 text-sm"
              style={{ background: "rgba(159,41,255,0.15)" }}
            >
              &#x2715;
            </button>

            {/* ─ Left: wallet list (scrollable) ─ */}
            <div className="w-[230px] shrink-0 border-r border-purple/10 flex flex-col">
              <h3 className="px-4 pt-5 pb-2 font-bold text-[15px] text-white">
                {t("wallet.connectTitle")}
              </h3>
              <p className="px-4 pb-2 text-xs font-semibold text-purple-light">
                {t("wallet.installed")}
              </p>

              {/* scrollable list */}
              <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.3) transparent" }}>
                {uniqueConnectors.map((c) => {
                  const isActive = selectedConnectorId === c.uid;
                  return (
                    <button
                      key={c.uid}
                      onClick={() => {
                        setSelectedConnectorId(c.uid);
                        connect({ connector: c });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-purple text-white"
                          : "text-text-sub hover:bg-purple-bg"
                      }`}
                    >
                      <WalletIcon
                        name={c.name}
                        iconUrl={c.icon}
                        size={28}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}

                {/* Popular (not installed) */}
                {popularNotDetected.length > 0 && (
                  <>
                    <p className="px-2 pt-3 pb-1 text-xs font-semibold text-text-muted">
                      {t("wallet.popular")}
                    </p>
                    {popularNotDetected.map((w) => (
                      <a
                        key={w.name}
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-purple-bg hover:text-text transition-colors cursor-pointer"
                      >
                        <WalletIcon name={w.name} size={28} />
                        <span className="truncate">{w.name}</span>
                      </a>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* ─ Right: info / connecting ─ */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-hidden">
              {selectedConnectorId && isPending ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <WalletIcon
                    name={selectedConnector?.name ?? ""}
                    iconUrl={selectedConnector?.icon}
                    size={64}
                  />
                  <p className="font-semibold text-lg">
                    {t("wallet.opening", {
                      wallet: selectedConnector?.name ?? "",
                    })}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t("wallet.confirmInExtension")}
                  </p>
                  <div className="w-6 h-6 border-2 border-purple/20 border-t-purple rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-5 max-w-[260px]">
                  <h3 className="font-bold text-xl text-white">
                    {t("wallet.whatIsWallet")}
                  </h3>

                  <div className="flex flex-col gap-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-bg flex items-center justify-center shrink-0">
                        <HiWallet className="w-5 h-5 text-purple-light" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {t("wallet.digitalHome")}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                          {t("wallet.digitalHomeDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-bg flex items-center justify-center shrink-0 text-lg">
                        &#x1F511;
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {t("wallet.newWayToLogin")}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                          {t("wallet.newWayToLoginDesc")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://ethereum.org/wallets"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-xl hover:bg-purple-light transition-colors"
                  >
                    {t("wallet.getWallet")}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
