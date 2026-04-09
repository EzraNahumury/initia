"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, TOKENS, type Token } from "@/lib/contract";
import { routerContract } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { HiCheck, HiCheckCircle } from "react-icons/hi2";

export function SendCard() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState<Token>(TOKENS[1]);
  const [amount, setAmount] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isConfirming;

  const isInit = recipient.endsWith(".init");
  const isAddr = /^0x[a-fA-F0-9]{40}$/.test(recipient);
  const valid = isInit || isAddr;

  const handleSend = useCallback(() => {
    if (!recipient || !amount || !valid) return;
    if (isInit) writeContract({ ...routerContract, functionName: "sendToUsername", args: [recipient, token.address, parseAmount(amount, token.decimals)] });
  }, [recipient, amount, token, valid, isInit, writeContract]);

  useEffect(() => { if (isSuccess) { setAmount(""); setRecipient(""); } }, [isSuccess]);

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5 space-y-3">
      <div className="px-1 pb-1">
        <h2 className="text-[16px] font-bold text-text">{t("send.title")}</h2>
        <p className="text-[12px] text-text-muted mt-0.5">{t("send.description")}</p>
      </div>

      <div className="rounded-xl bg-bg p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
        <span className="text-[12px] text-text-muted">{t("send.recipientLabel")}</span>
        <input type="text" placeholder={t("send.recipientPlaceholder")} value={recipient} onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-transparent text-lg font-semibold outline-none placeholder-text-muted/40 mt-2" />
        {recipient && recipient.length > 2 && (
          <div className="mt-3 pt-3 border-t border-border overflow-hidden">
            {isInit && <div className="flex items-center gap-1.5 text-[12px] text-green font-medium"><HiCheck className="w-3.5 h-3.5" />@{recipient}</div>}
            {isAddr && <div className="flex items-center gap-1.5 text-[12px] text-green font-medium"><HiCheck className="w-3.5 h-3.5" /><span className="font-mono text-text-sub">{recipient.slice(0, 12)}...{recipient.slice(-6)}</span></div>}
            {!valid && <div className="text-[12px] text-red">Format: teman.init atau 0x...</div>}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-bg p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
        <span className="text-[12px] text-text-muted">{t("common.amount")}</span>
        <div className="flex items-center gap-3 mt-2">
          <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
          <TokenSelector selected={token} onSelect={setToken} />
        </div>
      </div>

      {valid && amount && (
        <div className="rounded-xl bg-bg p-4 text-center border border-border">
          <div className="text-[12px] text-text-muted">{isInit ? `→ @${recipient}` : `→ ${recipient.slice(0, 8)}...`}</div>
          <div className="text-[28px] font-bold mt-1 text-text">{amount} {token.symbol}</div>
          <div className="text-[11px] text-green mt-1 font-medium">Gas fee: ~0.001 GAS</div>
        </div>
      )}

      <button onClick={handleSend}
        disabled={!isConnected || !amount || !valid || busy}
        className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
          !isConnected || !amount || !valid || busy ? "bg-purple/20 text-text-muted cursor-not-allowed"
          : "bg-purple text-white hover:bg-purple-light"
        }`}>
        {!isConnected ? t("common.connectWallet") : busy ? t("common.processing") : !recipient ? t("send.recipientPlaceholder")
          : !valid ? "Invalid" : isInit ? t("send.sendButton", { username: recipient }) : `Send ${amount} ${token.symbol}`}
      </button>

      {isSuccess && (
        <div className="flex items-center justify-center gap-2 text-[13px] text-green bg-green-bg rounded-xl py-3 font-medium">
          <HiCheckCircle className="w-4 h-4" />{t("send.sendSuccess", { username: recipient })}
        </div>
      )}

      {/* Comparison */}
      <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-border text-[12px]">
        <div className="p-3 bg-red-bg border-r border-border">
          <div className="font-semibold text-red mb-1">Tanpa .init</div>
          <div className="text-text-muted font-mono text-[11px]">0x7fD385d69...</div>
        </div>
        <div className="p-3 bg-green-bg">
          <div className="font-semibold text-green mb-1">Dengan .init</div>
          <div className="text-text font-semibold">@teman.init</div>
        </div>
      </div>
    </div>
  );
}
