"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, TOKENS, type Token } from "@/lib/contract";
import { routerContract } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { HiPlus, HiTrash, HiCheckCircle } from "react-icons/hi2";

interface Allocation { token: Token; percentage: number; }

export function BatchSwapCard() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [sourceToken, setSourceToken] = useState<Token>(TOKENS[0]);
  const [sourceAmount, setSourceAmount] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([
    { token: TOKENS[1], percentage: 40 }, { token: TOKENS[2], percentage: 30 }, { token: TOKENS[3], percentage: 30 },
  ]);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const total = allocations.reduce((s, a) => s + a.percentage, 0);
  const busy = isPending || isConfirming;

  const handleBatch = useCallback(() => {
    if (!sourceAmount || total !== 100) return;
    const totalIn = parseAmount(sourceAmount, sourceToken.decimals);
    writeContract({ ...routerContract, functionName: "batchSwap",
      args: [allocations.map((a) => ({ tokenIn: sourceToken.address, tokenOut: a.token.address,
        amountIn: (totalIn * BigInt(a.percentage)) / 100n, minOut: 0n })),
        BigInt(Math.floor(Date.now() / 1000) + 1200)],
    });
  }, [sourceAmount, sourceToken, allocations, total, writeContract]);

  useEffect(() => { if (isSuccess) setSourceAmount(""); }, [isSuccess]);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/[0.04] p-5 space-y-3">
      <div className="px-1 pb-1">
        <h2 className="text-[16px] font-bold text-text">{t("batch.title")}</h2>
        <p className="text-[12px] text-text-muted mt-0.5">{t("batch.description")}</p>
      </div>

      <div className="rounded-xl bg-bg p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
        <span className="text-[12px] text-text-muted">{t("batch.sourceToken")}</span>
        <div className="flex items-center gap-3 mt-2">
          <input type="number" placeholder="0" value={sourceAmount} onChange={(e) => setSourceAmount(e.target.value)}
            className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
          <TokenSelector selected={sourceToken} onSelect={setSourceToken} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-text-muted font-medium">{t("batch.allocation")}</span>
          <span className={`text-[12px] font-bold ${total === 100 ? "text-green" : "text-red"}`}>{total}%</span>
        </div>

        {allocations.map((alloc, i) => (
          <div key={alloc.token.symbol}
            className="flex items-center gap-2 p-3 rounded-xl bg-bg border border-border">
            <TokenSelector selected={alloc.token}
              onSelect={(tk) => setAllocations((p) => p.map((a, j) => j === i ? { ...a, token: tk } : a))}
              disabledToken={sourceToken} />
            <input type="range" min="5" max="95" step="5" value={alloc.percentage}
              onChange={(e) => setAllocations((p) => p.map((a, j) => j === i ? { ...a, percentage: Number(e.target.value) } : a))}
              className="flex-1 accent-accent h-1.5 rounded-full" />
            <span className="text-[13px] font-bold w-10 text-right text-text-sub">{alloc.percentage}%</span>
            {allocations.length > 1 && (
              <button onClick={() => setAllocations((p) => p.filter((_, j) => j !== i))}
                className="text-text-muted hover:text-red transition-colors cursor-pointer"><HiTrash className="w-4 h-4" /></button>
            )}
          </div>
        ))}

        {allocations.length < TOKENS.length - 1 && (
          <button
            onClick={() => { const used = new Set([sourceToken.symbol, ...allocations.map(a => a.token.symbol)]); const av = TOKENS.find(t => !used.has(t.symbol)); if (av) setAllocations(p => [...p, { token: av, percentage: 10 }]); }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-border text-[12px] text-text-muted hover:text-text-sub hover:border-text-sub/30 transition-all cursor-pointer">
            <HiPlus className="w-3.5 h-3.5" /> {t("batch.addToken")}
          </button>
        )}
      </div>

      {sourceAmount && total === 100 && (
        <div className="rounded-xl bg-bg p-3 space-y-1">
          {allocations.map((a, i) => (
            <div key={i} className="flex justify-between text-[12px] text-text-sub">
              <span>{((Number(sourceAmount) * a.percentage) / 100).toFixed(2)} {sourceToken.symbol} → {a.token.symbol}</span>
              <span className="font-semibold">{a.percentage}%</span>
            </div>
          ))}
          <div className="flex justify-between text-[12px] text-text-sub pt-1 mt-1 border-t border-border">
            <span className="text-text-muted">Gas fee ({allocations.length} swap, 1 tx)</span>
            <span className="text-green font-semibold">~0.001 GAS</span>
          </div>
        </div>
      )}

      <button onClick={handleBatch}
        disabled={!isConnected || !sourceAmount || total !== 100 || busy}
        className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
          !isConnected || !sourceAmount || total !== 100 || busy ? "bg-neutral-100 text-text-muted cursor-not-allowed"
          : "bg-text text-white hover:bg-neutral-800"
        }`}>
        {!isConnected ? t("common.connectWallet") : total !== 100 ? t("batch.totalMustBe100", { total }) : busy ? t("common.processing") : t("batch.batchButton", { count: allocations.length })}
      </button>

      {isSuccess && (
        <div className="flex items-center justify-center gap-2 text-[13px] text-green bg-green-bg rounded-xl py-3 font-medium">
          <HiCheckCircle className="w-4 h-4" />{t("batch.batchSuccess", { count: allocations.length })}
        </div>
      )}
    </div>
  );
}
