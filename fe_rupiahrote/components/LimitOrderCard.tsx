"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, formatAmount, TOKENS, type Token } from "@/lib/contract";
import { routerContract } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { HiXMark, HiCheckCircle } from "react-icons/hi2";

export function LimitOrderCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiryHours, setExpiryHours] = useState(24);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const { data: activeOrders, refetch } = useReadContract({
    ...routerContract, functionName: "getActiveOrders",
    args: address ? [address] : undefined, query: { enabled: !!address },
  });

  const handlePlace = useCallback(() => {
    if (!amountIn || !targetPrice) return;
    writeContract({ ...routerContract, functionName: "placeLimitOrder",
      args: [tokenIn.address, tokenOut.address, parseAmount(amountIn, tokenIn.decimals), parseAmount(targetPrice, 18), BigInt(Math.floor(Date.now() / 1000) + expiryHours * 3600)],
    });
  }, [amountIn, targetPrice, tokenIn, tokenOut, expiryHours, writeContract]);

  useEffect(() => { if (isSuccess) { setAmountIn(""); setTargetPrice(""); refetch(); } }, [isSuccess, refetch]);

  const orders = (activeOrders as Array<{ owner: string; tokenIn: string; tokenOut: string; amountIn: bigint; targetPrice: bigint; expiry: bigint; executed: boolean; cancelled: boolean }>) || [];
  const busy = isPending || isConfirming;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/[0.04] p-5 space-y-3">
        <div className="px-1 pb-1">
          <h2 className="text-[16px] font-bold text-text">{t("limit.title")}</h2>
          <p className="text-[12px] text-text-muted mt-0.5">{t("limit.description")}</p>
        </div>

        <div className="rounded-xl bg-bg p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
          <span className="text-[12px] text-text-muted">{t("limit.sell")}</span>
          <div className="flex items-center gap-3 mt-2">
            <input type="number" placeholder="0" value={amountIn} onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
            <TokenSelector selected={tokenIn} onSelect={setTokenIn} disabledToken={tokenOut} />
          </div>
        </div>

        <div className="rounded-xl bg-bg p-4">
          <span className="text-[12px] text-text-muted">{t("limit.buy")}</span>
          <div className="mt-2"><TokenSelector selected={tokenOut} onSelect={setTokenOut} disabledToken={tokenIn} /></div>
        </div>

        <div className="rounded-xl bg-bg p-4 focus-within:ring-2 focus-within:ring-ring transition-all">
          <span className="text-[12px] text-text-muted">{t("limit.targetPrice")} ({t("limit.targetPriceHint", { tokenOut: tokenOut.symbol, tokenIn: tokenIn.symbol })})</span>
          <input type="number" placeholder="0" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 mt-2" />
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-text-muted">Gas fee</span>
          <span className="text-[12px] text-green font-medium">~0.001 GAS</span>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-[12px] text-text-muted">{t("limit.expiry")}</span>
          <select value={expiryHours} onChange={(e) => setExpiryHours(Number(e.target.value))}
            className="bg-bg border border-border rounded-xl px-2.5 py-1.5 text-[12px] text-text-sub">
            <option value={1}>{t("limit.hours1")}</option><option value={6}>{t("limit.hours6")}</option>
            <option value={24}>{t("limit.hours24")}</option><option value={72}>{t("limit.days3")}</option><option value={168}>{t("limit.days7")}</option>
          </select>
        </div>

        <button onClick={handlePlace}
          disabled={!isConnected || !amountIn || !targetPrice || busy}
          className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
            !isConnected || !amountIn || !targetPrice || busy ? "bg-neutral-100 text-text-muted cursor-not-allowed"
            : "bg-text text-white hover:bg-neutral-800"
          }`}>
          {!isConnected ? t("common.connectWallet") : busy ? t("common.processing") : t("limit.placeOrder")}
        </button>

        {isSuccess && (
          <div className="flex items-center justify-center gap-2 text-[13px] text-green bg-green-bg rounded-xl py-3 font-medium">
            <HiCheckCircle className="w-4 h-4" />{t("limit.orderPlaced")}
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-lg shadow-black/[0.04] p-5 space-y-2">
          <h3 className="text-[12px] font-semibold text-text-muted px-1">{t("limit.activeOrders")} ({orders.length})</h3>
          {orders.map((o, i) => {
            const inTk = TOKENS.find((t) => t.address.toLowerCase() === o.tokenIn.toLowerCase());
            const outTk = TOKENS.find((t) => t.address.toLowerCase() === o.tokenOut.toLowerCase());
            return (
              <div key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                <div>
                  <div className="text-[13px] font-semibold text-text">{formatAmount(o.amountIn, inTk?.decimals ?? 6)} {inTk?.symbol} → {outTk?.symbol}</div>
                  <div className="text-[11px] text-text-muted">Target: {formatAmount(o.targetPrice, 18)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber bg-amber-bg px-2 py-0.5 rounded-md font-medium">{t("limit.pending")}</span>
                  <button className="text-text-muted hover:text-red transition-colors cursor-pointer"><HiXMark className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
