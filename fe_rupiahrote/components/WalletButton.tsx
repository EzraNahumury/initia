"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useTranslation } from "react-i18next";
import { HiChevronDown } from "react-icons/hi2";
import { useState, useEffect, useRef } from "react";

function getWalletIcon(connectorName: string | undefined) {
  const icons: Record<string, string> = {
    MetaMask: "🦊",
    "Rabby Wallet": "🐰",
    "Coinbase Wallet": "🔵",
    Talisman: "🔮",
    "OKX Wallet": "⬛",
  };
  return connectorName ? icons[connectorName] || "💼" : "💼";
}

export function WalletButton() {
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { t } = useTranslation();
  const [gasBalance, setGasBalance] = useState("0");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          const wei = BigInt(data.result);
          const ether = Number(wei) / 1e18;
          setGasBalance(ether.toLocaleString(undefined, { maximumFractionDigits: 2 }));
        }
      } catch {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isConnected && address) {
    return (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          <span className="text-base leading-none">{getWalletIcon(connector?.name)}</span>
          <span className="font-mono font-medium text-emerald-400">{gasBalance} GAS</span>
          <span className="text-neutral-500">|</span>
          <span className="font-mono font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <HiChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showMenu ? "rotate-180" : ""}`} />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-[9999]">
            <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100 font-mono">
              {address.slice(0, 10)}...{address.slice(-8)}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(address); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 text-neutral-700 cursor-pointer">
              Copy Address
            </button>
            <button onClick={() => { disconnect(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer">
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 text-[13px] font-semibold rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer">
        {t("common.connectWallet")}
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-[9999]">
          <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-100 font-medium">
            Select Wallet
          </div>
          {connectors.map((c) => (
            <button key={c.uid} onClick={() => { connect({ connector: c }); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 text-neutral-700 flex items-center gap-2 cursor-pointer">
              <span>{getWalletIcon(c.name)}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
