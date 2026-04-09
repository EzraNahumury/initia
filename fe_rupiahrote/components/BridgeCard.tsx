"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { parseAmount, TOKENS, type Token } from "@/lib/contract";
import { addActivity } from "@/lib/activity";
import { TokenSelector } from "./TokenSelector";
import { HiArrowRight, HiCheckCircle, HiClock } from "react-icons/hi2";

const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const BRIDGE_FEE = 100n * 10n ** 18n;

const FAUCET_ABI = [
  { name: "bridgeDeposit", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "bridgeWithdraw", type: "function", stateMutability: "payable", inputs: [{ name: "token", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
] as const;

const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

type BridgeMode = "deposit" | "withdraw";

export function BridgeCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [mode, setMode] = useState<BridgeMode>("deposit");
  const [token, setToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [bridging, setBridging] = useState(false);
  const [bridgeSuccess, setBridgeSuccess] = useState(false);

  const isDeposit = mode === "deposit";
  const parsedAmount = amount ? parseAmount(amount, token.decimals) : 0n;

  // Balance check (only for withdraw — deposit mints new tokens)
  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const userBalance = tokenBalance ?? 0n;
  const insufficientBalance = !isDeposit && parsedAmount > 0n && userBalance < parsedAmount;
  const formattedBalance = Number(userBalance) / 10 ** token.decimals;

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleBridge = useCallback(() => {
    if (!amount || parsedAmount === 0n) return;
    setBridging(true);

    writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: isDeposit ? "bridgeDeposit" : "bridgeWithdraw",
      args: [token.address, parsedAmount],
      value: BRIDGE_FEE,
    });
  }, [amount, parsedAmount, token, isDeposit, writeContract]);

  useEffect(() => {
    if (isSuccess && address) {
      addActivity(address, {
        id: Date.now().toString(36) + "br",
        type: "bridge",
        timestamp: Date.now(),
        txHash,
        tokenIn: { symbol: token.symbol, amount: amount || "0" },
        tokenOut: { symbol: token.symbol, amount: amount || "0" },
        status: "confirmed",
        meta: { bridgeMode: isDeposit ? "deposit" : "withdraw" },
      });
      setBridging(false);
      setBridgeSuccess(true);
      setAmount("");
      setTimeout(() => setBridgeSuccess(false), 4000);
    }
  }, [isSuccess]);

  // Reset bridging state if tx fails
  useEffect(() => {
    if (!isPending && !isConfirming && bridging && !isSuccess) {
      setBridging(false);
    }
  }, [isPending, isConfirming]);

  const busy = isPending || isConfirming || bridging;
  const disabled = !isConnected || !amount || parsedAmount === 0n || insufficientBalance || busy;

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5 space-y-4">
      <div className="px-1">
        <h2 className="text-[10px] font-bold text-text">Interwoven Bridge</h2>
        <p className="text-[8px] text-text-muted mt-0.5">{t("bridge.description")}</p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl bg-bg p-1 border border-border">
        {(["deposit", "withdraw"] as BridgeMode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); setAmount(""); }}
            className={`relative flex-1 py-2.5 text-[14px] font-semibold rounded-lg transition-all cursor-pointer ${
              mode === m ? "text-white bg-purple shadow-sm" : "text-text-muted hover:text-text-sub"
            }`}>
            {t(`bridge.${m}`)}
          </button>
        ))}
      </div>

      {/* Chain flow */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl bg-bg p-3.5 border border-border text-center">
          <div className="text-[7px] text-text-muted">{t("common.from")}</div>
          <div className="text-[8px] font-bold mt-1 text-text">{isDeposit ? "Initia L1" : "RupiahRoute"}</div>
        </div>
        <HiArrowRight className="w-5 h-5 text-text-sub" />
        <div className="flex-1 rounded-xl bg-bg p-3.5 border border-border text-center">
          <div className="text-[7px] text-text-muted">{t("common.to")}</div>
          <div className="text-[8px] font-bold mt-1 text-text">{isDeposit ? "RupiahRoute" : "Initia L1"}</div>
        </div>
      </div>

      {/* Token & amount */}
      <div className={`rounded-xl bg-bg p-4 border ${insufficientBalance ? "border-red/30" : "border-transparent"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] text-text-muted">{t("bridge.tokenAmount")}</span>
          {!isDeposit && (
            <span className={`text-[7px] font-medium ${insufficientBalance ? "text-red" : "text-text-muted"}`}>
              Balance: {formattedBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.symbol}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
          <TokenSelector selected={token} onSelect={setToken} />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 px-1">
        <div className="flex justify-between text-[8px]">
          <span className="text-text-muted">{t("bridge.estimatedTime")}</span>
          <span className="text-green font-medium">~10 seconds</span>
        </div>
        <div className="flex justify-between text-[8px]">
          <span className="text-text-muted">{t("bridge.bridgeFee")}</span>
          <span className="text-green font-medium">100 GAS</span>
        </div>
        <div className="flex justify-between text-[8px]">
          <span className="text-text-muted">{t("bridge.protocol")}</span>
          <span className="text-text-sub font-medium">OPinit</span>
        </div>
      </div>

      {/* Button */}
      <button onClick={handleBridge} disabled={disabled}
        className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
          disabled ? "bg-purple/20 text-text-muted cursor-not-allowed"
          : "bg-purple text-white hover:bg-purple-light glow-purple-sm"
        }`}>
        {!isConnected ? t("common.connectWallet")
          : insufficientBalance ? `Insufficient ${token.symbol}`
          : busy ? (
            <span className="flex items-center justify-center gap-2">
              <HiClock className="w-4 h-4 animate-pulse" />
              Bridging...
            </span>
          )
          : !amount ? t("common.enterAmount")
          : isDeposit ? `Deposit ${amount} ${token.symbol}` : `Withdraw ${amount} ${token.symbol}`}
      </button>

      {bridgeSuccess && (
        <div className="flex items-center justify-center gap-2 text-[8px] text-green bg-green-bg rounded-xl py-3 font-medium">
          <HiCheckCircle className="w-4 h-4" />
          {isDeposit ? "Deposit successful! Tokens bridged to RupiahRoute" : "Withdraw successful! Tokens bridged to Initia L1"}
        </div>
      )}
    </div>
  );
}
