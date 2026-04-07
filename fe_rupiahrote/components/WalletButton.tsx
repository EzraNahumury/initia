"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";
import { useTranslation } from "react-i18next";
import { HiChevronDown } from "react-icons/hi2";
import { useState, useEffect } from "react";

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
  const { open } = useWeb3Modal();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { t } = useTranslation();
  const [gasBalance, setGasBalance] = useState("0");

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

  if (isConnected && address) {
    return (
      <button onClick={() => open({ view: "Account" })}
        className="flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        style={{ position: "relative", zIndex: 9999, pointerEvents: "auto" }}>
        <span className="text-base leading-none">{getWalletIcon(connector?.name)}</span>
        <span className="font-mono font-medium text-emerald-400">{gasBalance} GAS</span>
        <span className="text-neutral-500">|</span>
        <span className="font-mono font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
        <HiChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>
    );
  }

  return (
    <button onClick={() => open()}
      className="px-4 py-2 text-[13px] font-semibold rounded-full bg-text text-white hover:bg-neutral-800 transition-colors cursor-pointer">
      {t("common.connectWallet")}
    </button>
  );
}
