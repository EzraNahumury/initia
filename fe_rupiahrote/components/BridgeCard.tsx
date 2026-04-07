"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { TOKENS, type Token } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { HiArrowRight } from "react-icons/hi2";

type BridgeMode = "deposit" | "withdraw";

export function BridgeCard() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [mode, setMode] = useState<BridgeMode>("deposit");
  const [token, setToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState("");
  const isDeposit = mode === "deposit";

  return (
    <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/[0.04] p-5 space-y-4">
      <div className="px-1">
        <h2 className="text-[16px] font-bold text-text">{t("bridge.title")}</h2>
        <p className="text-[12px] text-text-muted mt-0.5">{t("bridge.description")}</p>
      </div>

      {/* Mode */}
      <div className="flex rounded-xl bg-bg p-1 border border-border">
        {(["deposit", "withdraw"] as BridgeMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`relative flex-1 py-2.5 text-[14px] font-semibold rounded-lg transition-all cursor-pointer ${
              mode === m ? "text-text bg-white shadow-sm" : "text-text-muted hover:text-text-sub"
            }`}>
            {t(`bridge.${m}`)}
          </button>
        ))}
      </div>

      {/* Chain flow */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-bg p-3.5 border border-border text-center">
          <div className="text-[11px] text-text-muted">{t("common.from")}</div>
          <div className="text-[13px] font-bold mt-1 text-text">{isDeposit ? "Initia L1" : "RupiahRoute"}</div>
        </div>
        <HiArrowRight className="w-5 h-5 text-text-sub" />
        <div className="flex-1 rounded-xl bg-bg p-3.5 border border-border text-center">
          <div className="text-[11px] text-text-muted">{t("common.to")}</div>
          <div className="text-[13px] font-bold mt-1 text-text">{isDeposit ? "RupiahRoute" : "Initia L1"}</div>
        </div>
      </div>

      <div className="rounded-xl bg-bg p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
        <span className="text-[12px] text-text-muted">{t("bridge.tokenAmount")}</span>
        <div className="flex items-center gap-3 mt-2">
          <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
          <TokenSelector selected={token} onSelect={setToken} />
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <div className="flex justify-between text-[12px]"><span className="text-text-muted">{t("bridge.estimatedTime")}</span><span className="text-green font-medium">{t("bridge.seconds")}</span></div>
        <div className="flex justify-between text-[12px]"><span className="text-text-muted">{t("bridge.bridgeFee")}</span><span className="text-text-sub font-medium">{t("bridge.free")}</span></div>
        <div className="flex justify-between text-[12px]"><span className="text-text-muted">{t("bridge.protocol")}</span><span className="text-text-sub font-medium">OPinit</span></div>
      </div>

      <button disabled={!isConnected || !amount}
        className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
          !isConnected || !amount ? "bg-neutral-100 text-text-muted cursor-not-allowed"
          : "bg-text text-white hover:bg-neutral-800"
        }`}>
        {!isConnected ? t("common.connectWallet") : !amount ? t("common.enterAmount")
          : isDeposit ? t("bridge.depositButton", { token: token.symbol }) : t("bridge.withdrawButton", { token: token.symbol })}
      </button>
    </div>
  );
}
