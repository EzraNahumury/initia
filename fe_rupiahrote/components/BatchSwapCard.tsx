"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, formatAmount, TOKENS, type Token } from "@/lib/contract";
import { addActivity } from "@/lib/activity";
import { TokenSelector } from "./TokenSelector";
import { HiPlus, HiTrash, HiCheckCircle } from "react-icons/hi2";

const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const SWAP_FEE = 500n * 10n ** 18n;

const FAUCET_ABI = [
  { name: "batchSwap", type: "function", stateMutability: "payable", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokensOut", type: "address[]" }, { name: "amounts", type: "uint256[]" }], outputs: [] },
  { name: "getQuote", type: "function", stateMutability: "view", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

interface Allocation { token: Token; percentage: number; }

export function BatchSwapCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [sourceToken, setSourceToken] = useState<Token>(TOKENS[0]);
  const [sourceAmount, setSourceAmount] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([
    { token: TOKENS[1], percentage: 40 },
    { token: TOKENS[2], percentage: 30 },
    { token: TOKENS[3], percentage: 30 },
  ]);

  const parsedTotal = sourceAmount ? parseAmount(sourceAmount, sourceToken.decimals) : 0n;
  const total = allocations.reduce((s, a) => s + a.percentage, 0);

  // Balance check
  const { data: tokenBalance } = useReadContract({
    address: sourceToken.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const userBalance = tokenBalance ?? 0n;
  const insufficientBalance = parsedTotal > 0n && userBalance < parsedTotal;
  const formattedBalance = Number(userBalance) / 10 ** sourceToken.decimals;

  // Batch swap
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isConfirming;

  const handleBatch = useCallback(() => {
    if (!sourceAmount || total !== 100 || parsedTotal === 0n) return;

    const tokensOut = allocations.map((a) => a.token.address);
    const amounts = allocations.map((a) =>
      (parsedTotal * BigInt(a.percentage)) / 100n
    );

    writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "batchSwap",
      args: [sourceToken.address, tokensOut, amounts],
      value: SWAP_FEE,
    });
  }, [sourceAmount, sourceToken, allocations, total, parsedTotal, writeContract]);

  useEffect(() => {
    if (isSuccess && address) {
      const targetSymbols = allocations.map((a) => `${a.percentage}% ${a.token.symbol}`).join(", ");
      addActivity(address, {
        id: Date.now().toString(36) + "b",
        type: "batch",
        timestamp: Date.now(),
        txHash,
        tokenIn: { symbol: sourceToken.symbol, amount: sourceAmount },
        tokenOut: { symbol: targetSymbols, amount: sourceAmount },
        status: "confirmed",
        meta: { batchAllocations: targetSymbols },
      });
      setSourceAmount("");
    }
  }, [isSuccess]);

  const disabled = !isConnected || !sourceAmount || parsedTotal === 0n || total !== 100 || insufficientBalance || busy;

  // Calculate estimated outputs
  const estimates = allocations.map((a) => {
    if (!sourceAmount || Number(sourceAmount) <= 0) return "0";
    const inputAmount = (Number(sourceAmount) * a.percentage) / 100;
    const inputParsed = parseAmount(inputAmount.toString(), sourceToken.decimals);
    // Simple rate calc (same as contract)
    return inputAmount > 0 ? (inputAmount * 0.997).toFixed(Math.min(a.token.decimals, 4)) : "0";
  });

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5 space-y-3">
      <div className="px-1 pb-1">
        <h2 className="text-[10px] font-bold text-text">{t("batch.title")}</h2>
        <p className="text-[8px] text-text-muted mt-0.5">{t("batch.description")}</p>
      </div>

      {/* Source token */}
      <div className={`rounded-xl bg-bg p-4 border ${insufficientBalance ? "border-red/30" : "border-transparent"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] text-text-muted">{t("batch.sourceToken")}</span>
          <span className={`text-[7px] font-medium ${insufficientBalance ? "text-red" : "text-text-muted"}`}>
            Balance: {formattedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {sourceToken.symbol}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input type="number" placeholder="0" value={sourceAmount} onChange={(e) => setSourceAmount(e.target.value)}
            className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
          <TokenSelector selected={sourceToken} onSelect={setSourceToken} />
        </div>
      </div>

      {/* Allocations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[8px] text-text-muted font-medium">{t("batch.allocation")}</span>
          <span className={`text-[8px] font-bold ${total === 100 ? "text-green" : "text-red"}`}>{total}%</span>
        </div>

        {allocations.map((alloc, i) => {
          const inputAmt = sourceAmount ? (Number(sourceAmount) * alloc.percentage / 100).toFixed(2) : "0";
          return (
            <div key={`${alloc.token.symbol}-${i}`}
              className="flex items-center gap-2 p-3 rounded-xl bg-bg border border-border">
              <TokenSelector selected={alloc.token}
                onSelect={(tk) => setAllocations((p) => p.map((a, j) => j === i ? { ...a, token: tk } : a))}
                disabledToken={sourceToken} />
              <input type="range" min="5" max="95" step="5" value={alloc.percentage}
                onChange={(e) => {
                  const newVal = Number(e.target.value);
                  if (newVal > alloc.percentage && total >= 100) return;
                  setAllocations((p) => p.map((a, j) => j === i ? { ...a, percentage: newVal } : a));
                }}
                className="flex-1 accent-purple h-1.5 rounded-full" />
              <span className="text-[8px] font-bold w-10 text-right text-text-sub">{alloc.percentage}%</span>
              {allocations.length > 1 && (
                <button onClick={() => setAllocations((p) => p.filter((_, j) => j !== i))}
                  className="text-text-muted hover:text-red transition-colors cursor-pointer"><HiTrash className="w-4 h-4" /></button>
              )}
            </div>
          );
        })}

        {allocations.length < TOKENS.length - 1 && (
          <button
            onClick={() => { const used = new Set([sourceToken.symbol, ...allocations.map(a => a.token.symbol)]); const av = TOKENS.find(t => !used.has(t.symbol)); if (av) setAllocations(p => [...p, { token: av, percentage: 10 }]); }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-border text-[8px] text-text-muted hover:text-text-sub hover:border-text-sub/30 transition-all cursor-pointer">
            <HiPlus className="w-3.5 h-3.5" /> {t("batch.addToken")}
          </button>
        )}
      </div>

      {/* Preview */}
      {sourceAmount && total === 100 && (
        <div className="rounded-xl bg-bg p-3 space-y-1">
          {allocations.map((a, i) => (
            <div key={i} className="flex justify-between text-[8px] text-text-sub">
              <span>{((Number(sourceAmount) * a.percentage) / 100).toFixed(2)} {sourceToken.symbol} &rarr; {a.token.symbol}</span>
              <span className="font-semibold">{a.percentage}%</span>
            </div>
          ))}
          <div className="flex justify-between text-[8px] text-text-sub pt-1 mt-1 border-t border-border">
            <span className="text-text-muted">Gas fee ({allocations.length} swap, 1 tx)</span>
            <span className="text-green font-semibold">500 GAS</span>
          </div>
        </div>
      )}

      {/* Button */}
      <button onClick={handleBatch} disabled={disabled}
        className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
          disabled ? "bg-purple/20 text-text-muted cursor-not-allowed"
          : "bg-purple text-white hover:bg-purple-light glow-purple-sm"
        }`}>
        {!isConnected ? t("common.connectWallet")
          : insufficientBalance ? `Insufficient ${sourceToken.symbol}`
          : total !== 100 ? t("batch.totalMustBe100", { total })
          : busy ? t("common.processing")
          : t("batch.batchButton", { count: allocations.length })}
      </button>

      {isSuccess && (
        <div className="flex items-center justify-center gap-2 text-[8px] text-green bg-green-bg rounded-xl py-3 font-medium">
          <HiCheckCircle className="w-4 h-4" />{t("batch.batchSuccess", { count: allocations.length })}
        </div>
      )}
    </div>
  );
}
