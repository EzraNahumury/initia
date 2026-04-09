"use client";

import { createPortal } from "react-dom";
import type { Token } from "@/lib/contract";
import { PriceImpactBadge } from "./PriceImpactBadge";
import { HiXMark, HiArrowLongRight, HiShieldCheck } from "react-icons/hi2";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  expectedOutput: string;
  minReceived: string;
  priceImpact: number;
  slippage: number;
  recipient?: string | null;
  gasEstimate: string;
  routeName: string;
  routeProtocol: string;
  savings?: string;
  isSwapping: boolean;
}

export function SwapConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  tokenIn,
  tokenOut,
  amountIn,
  expectedOutput,
  minReceived,
  priceImpact,
  slippage,
  recipient,
  gasEstimate,
  routeName,
  routeProtocol,
  savings,
  isSwapping,
}: Props) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 rounded-2xl glow-purple w-[400px] max-h-[90vh] overflow-y-auto p-6" style={{ background: "#0f0f23", border: "1px solid rgba(139,92,246,0.2)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-5 h-5 text-green" />
            <h2 className="text-[16px] font-bold text-text">Confirm Swap</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-bg flex items-center justify-center cursor-pointer transition-colors"
          >
            <HiXMark className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Route visualization */}
        <div className="rounded-xl bg-bg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-[11px] text-text-muted mb-1">You pay</div>
              <div className="text-[20px] font-bold text-text">{amountIn}</div>
              <div className="text-[12px] text-text-sub font-medium">{tokenIn.symbol}</div>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-3">
              <HiArrowLongRight className="w-5 h-5 text-text-muted" />
              <span className="text-[10px] text-text-muted">{routeName}</span>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-text-muted mb-1">You get</div>
              <div className="text-[20px] font-bold text-green">{expectedOutput}</div>
              <div className="text-[12px] text-text-sub font-medium">{tokenOut.symbol}</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-5">
          <DetailRow label="Route" value={`${routeName} (${routeProtocol})`} />
          <DetailRow
            label="Price impact"
            value={<PriceImpactBadge impact={priceImpact} />}
          />
          <DetailRow label="Min. received" value={`${minReceived} ${tokenOut.symbol}`} />
          <DetailRow label="Slippage tolerance" value={`${slippage}%`} />
          <DetailRow label="Gas estimate" value={gasEstimate} valueColor="text-green" />
          {savings && (
            <DetailRow label="Savings vs external" value={`+${savings} ${tokenOut.symbol}`} valueColor="text-green" />
          )}
          {recipient && (
            <DetailRow
              label="Recipient"
              value={
                <span className="font-mono text-[10px]">
                  {recipient.length > 20
                    ? `${recipient.slice(0, 8)}...${recipient.slice(-6)}`
                    : recipient}
                </span>
              }
            />
          )}
        </div>

        {/* Price impact danger warning */}
        {priceImpact >= 5 && (
          <div className="rounded-xl bg-red/5 border border-red/20 p-3 text-center mb-4">
            <div className="text-[12px] font-semibold text-red">
              High price impact: {priceImpact.toFixed(2)}%
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              You may receive significantly less than expected
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold border border-border text-text-sub hover:bg-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSwapping}
            className={`flex-1 py-3 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer ${
              isSwapping
                ? "bg-purple/30 text-white cursor-not-allowed"
                : priceImpact >= 5
                  ? "bg-red text-white hover:bg-red/90"
                  : "bg-purple text-white hover:bg-purple-light glow-purple-sm"
            }`}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Swapping...
              </span>
            ) : priceImpact >= 5 ? (
              "Swap Anyway"
            ) : (
              "Confirm Swap"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-text-muted">{label}</span>
      <span className={valueColor ?? "text-text-sub font-medium"}>{value}</span>
    </div>
  );
}
