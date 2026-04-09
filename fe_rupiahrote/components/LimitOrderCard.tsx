"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useTranslation } from "react-i18next";
import { encodeFunctionData, decodeFunctionResult } from "viem";
import { parseAmount, formatAmount, TOKENS, type Token } from "@/lib/contract";
import { TokenSelector } from "./TokenSelector";
import { HiXMark, HiCheckCircle, HiClock, HiPlay } from "react-icons/hi2";

const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_CONTRACT ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const LIMIT_FEE = 500n * 10n ** 18n;

const FAUCET_ABI = [
  { name: "placeLimitOrder", type: "function", stateMutability: "payable", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }, { name: "targetPrice", type: "uint256" }, { name: "expiryHours", type: "uint256" }], outputs: [] },
  { name: "executeLimitOrder", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }], outputs: [] },
  { name: "cancelLimitOrder", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }], outputs: [] },
  { name: "getUserOrderCount", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "getUserOrderId", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "getOrder", type: "function", stateMutability: "view", inputs: [{ name: "orderId", type: "uint256" }], outputs: [{ name: "_owner", type: "address" }, { name: "_tokenIn", type: "address" }, { name: "_tokenOut", type: "address" }, { name: "_amountIn", type: "uint256" }, { name: "_targetPrice", type: "uint256" }, { name: "_expiry", type: "uint256" }, { name: "_executed", type: "bool" }, { name: "_cancelled", type: "bool" }] },
  { name: "getQuote", type: "function", stateMutability: "view", inputs: [{ name: "tokenIn", type: "address" }, { name: "tokenOut", type: "address" }, { name: "amountIn", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

interface OrderData {
  id: number;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  targetPrice: bigint;
  expiry: number;
  executed: boolean;
  cancelled: boolean;
}

export function LimitOrderCard() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [expiryHours, setExpiryHours] = useState(24);
  const [orders, setOrders] = useState<OrderData[]>([]);

  const parsedAmount = amountIn ? parseAmount(amountIn, tokenIn.decimals) : 0n;
  const parsedTarget = targetPrice ? parseAmount(targetPrice, tokenOut.decimals) : 0n;

  // Balance check
  const { data: tokenInBalance } = useReadContract({
    address: tokenIn.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const userBalance = tokenInBalance ?? 0n;
  const insufficientBalance = parsedAmount > 0n && userBalance < parsedAmount;

  // Get current quote
  const { data: currentQuote } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "getQuote",
    args: [tokenIn.address, tokenOut.address, parsedAmount],
    query: { enabled: parsedAmount > 0n },
  });

  // Place order
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isConfirming;

  const handlePlace = useCallback(() => {
    if (!amountIn || !targetPrice || parsedAmount === 0n || parsedTarget === 0n) return;
    writeContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "placeLimitOrder",
      args: [tokenIn.address, tokenOut.address, parsedAmount, parsedTarget, BigInt(expiryHours)],
      value: LIMIT_FEE,
    });
  }, [amountIn, targetPrice, parsedAmount, parsedTarget, tokenIn, tokenOut, expiryHours, writeContract]);

  useEffect(() => {
    if (isSuccess) {
      setAmountIn("");
      setTargetPrice("");
      refetchCount();
      setTimeout(loadOrders, 3000);
    }
  }, [isSuccess]);

  // Load user orders
  const { data: orderCount, refetch: refetchCount } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "getUserOrderCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const loadOrders = useCallback(async () => {
    if (!address || !orderCount) return;
    const count = Number(orderCount);
    if (count === 0) { setOrders([]); return; }

    const rpc = async (data: string) => {
      const res = await fetch("http://localhost:8545", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to: FAUCET_ADDRESS, data }, "latest"], id: 1 }),
      });
      return (await res.json()).result as string;
    };

    const loaded: OrderData[] = [];
    for (let i = count - 1; i >= Math.max(0, count - 10); i--) {
      try {
        const idData = encodeFunctionData({ abi: FAUCET_ABI, functionName: "getUserOrderId", args: [address, BigInt(i)] });
        const idResult = await rpc(idData);
        const orderId = Number(BigInt(idResult));

        const orderData = encodeFunctionData({ abi: FAUCET_ABI, functionName: "getOrder", args: [BigInt(orderId)] });
        const orderResult = await rpc(orderData);

        const decoded = decodeFunctionResult({ abi: FAUCET_ABI, functionName: "getOrder", data: orderResult as `0x${string}` });
        const [_owner, _tokenIn, _tokenOut, _amountIn, _targetPrice, _expiry, _executed, _cancelled] = decoded as [string, string, string, bigint, bigint, bigint, boolean, boolean];

        const tokenIn = TOKENS.find((t) => t.address.toLowerCase() === _tokenIn.toLowerCase());
        const tokenOut = TOKENS.find((t) => t.address.toLowerCase() === _tokenOut.toLowerCase());
        if (tokenIn && tokenOut) {
          loaded.push({
            id: orderId, tokenIn, tokenOut,
            amountIn: _amountIn, targetPrice: _targetPrice,
            expiry: Number(_expiry), executed: _executed, cancelled: _cancelled,
          });
        }
      } catch {}
    }
    setOrders(loaded);
  }, [address, orderCount]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Execute order
  const { writeContract: writeExec } = useWriteContract();
  const handleExecute = (orderId: number) => {
    writeExec({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "executeLimitOrder",
      args: [BigInt(orderId)],
    }, { onSuccess: () => { setTimeout(() => { refetchCount(); loadOrders(); }, 3000); } });
  };

  // Cancel order
  const { writeContract: writeCancel } = useWriteContract();
  const handleCancel = (orderId: number) => {
    writeCancel({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "cancelLimitOrder",
      args: [BigInt(orderId)],
    }, { onSuccess: () => { setTimeout(() => { refetchCount(); loadOrders(); }, 3000); } });
  };

  const disabled = !isConnected || !amountIn || !targetPrice || parsedAmount === 0n || parsedTarget === 0n || insufficientBalance || busy;

  const currentQuoteFormatted = currentQuote
    ? formatAmount(currentQuote as bigint, tokenOut.decimals)
    : "0";

  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl glow-purple-sm p-5 space-y-3">
        <div className="px-1 pb-1">
          <h2 className="text-[16px] font-bold text-text">{t("limit.title")}</h2>
          <p className="text-[12px] text-text-muted mt-0.5">{t("limit.description")}</p>
        </div>

        {/* Sell */}
        <div className={`rounded-xl bg-bg p-4 border ${insufficientBalance ? "border-red/30" : "border-transparent"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-text-muted">{t("limit.sell")}</span>
            <span className={`text-[11px] font-medium ${insufficientBalance ? "text-red" : "text-text-muted"}`}>
              Balance: {Number(userBalance) / 10 ** tokenIn.decimals} {tokenIn.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="0" value={amountIn} onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40 min-w-0" />
            <TokenSelector selected={tokenIn} onSelect={setTokenIn} disabledToken={tokenOut} />
          </div>
        </div>

        {/* Buy token */}
        <div className="rounded-xl bg-bg p-4">
          <span className="text-[12px] text-text-muted">{t("limit.buy")}</span>
          <div className="mt-2"><TokenSelector selected={tokenOut} onSelect={setTokenOut} disabledToken={tokenIn} /></div>
        </div>

        {/* Target price */}
        <div className="rounded-xl bg-bg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] text-text-muted">Min. output ({tokenOut.symbol})</span>
            {parsedAmount > 0n && (
              <span className="text-[11px] text-text-muted">
                Current: <span className="text-green font-medium">{currentQuoteFormatted}</span>
              </span>
            )}
          </div>
          <input type="number" placeholder="0" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-transparent text-[28px] font-semibold outline-none placeholder-text-muted/40" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 px-1">
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">Gas fee</span>
            <span className="text-green font-medium">500 GAS</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-muted">{t("limit.expiry")}</span>
            <select value={expiryHours} onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="bg-bg border border-border rounded-xl px-2.5 py-1.5 text-[12px] text-white" style={{ color: "#ffffff" }}>
              <option value={1}>{t("limit.hours1")}</option>
              <option value={6}>{t("limit.hours6")}</option>
              <option value={24}>{t("limit.hours24")}</option>
              <option value={72}>{t("limit.days3")}</option>
              <option value={168}>{t("limit.days7")}</option>
            </select>
          </div>
        </div>

        {/* Button */}
        <button onClick={handlePlace} disabled={disabled}
          className={`w-full py-4 rounded-xl text-[14px] font-bold cursor-pointer transition-all ${
            disabled ? "bg-purple/20 text-text-muted cursor-not-allowed"
            : "bg-purple text-white hover:bg-purple-light glow-purple-sm"
          }`}>
          {!isConnected ? t("common.connectWallet")
            : busy ? t("common.processing")
            : insufficientBalance ? `Insufficient ${tokenIn.symbol}`
            : !amountIn || !targetPrice ? "Enter amount & target"
            : t("limit.placeOrder")}
        </button>

        {isSuccess && (
          <div className="flex items-center justify-center gap-2 text-[13px] text-green bg-green-bg rounded-xl py-3 font-medium">
            <HiCheckCircle className="w-4 h-4" />{t("limit.orderPlaced")}
          </div>
        )}
      </div>

      {/* Active Orders */}
      {orders.length > 0 && (
        <div className="glass rounded-2xl glow-purple-sm p-5 space-y-2">
          <h3 className="text-[12px] font-semibold text-text-muted px-1">Active Orders ({orders.length})</h3>
          {orders.map((o) => {
            const isExpired = Date.now() / 1000 > o.expiry;
            return (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                <div>
                  <div className="text-[13px] font-semibold text-text">
                    {formatAmount(o.amountIn, o.tokenIn.decimals)} {o.tokenIn.symbol} &rarr; {o.tokenOut.symbol}
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Min: {formatAmount(o.targetPrice, o.tokenOut.decimals)} {o.tokenOut.symbol}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {o.executed ? (
                    <span className="text-[11px] text-green bg-green/10 px-2 py-0.5 rounded-md font-medium">Filled</span>
                  ) : o.cancelled ? (
                    <span className="text-[11px] text-red bg-red/10 px-2 py-0.5 rounded-md font-medium">Cancelled</span>
                  ) : isExpired ? (
                    <span className="text-[11px] text-amber bg-amber/10 px-2 py-0.5 rounded-md font-medium">Expired</span>
                  ) : (
                    <>
                      <button onClick={() => handleExecute(o.id)}
                        className="text-green hover:text-green/80 transition-colors cursor-pointer" title="Execute">
                        <HiPlay className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCancel(o.id)}
                        className="text-text-muted hover:text-red transition-colors cursor-pointer" title="Cancel">
                        <HiXMark className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] text-amber bg-amber/10 px-2 py-0.5 rounded-md font-medium">
                        <HiClock className="w-3 h-3 inline mr-0.5" />Pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

