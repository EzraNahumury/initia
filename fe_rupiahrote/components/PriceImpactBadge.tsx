"use client";

import { HiExclamationTriangle } from "react-icons/hi2";

export function PriceImpactBadge({ impact }: { impact: number }) {
  if (impact < 0.1) return null;

  if (impact >= 5) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red bg-red/10 px-2 py-0.5 rounded-full">
        <HiExclamationTriangle className="w-3 h-3" />
        {impact.toFixed(2)}%
      </span>
    );
  }

  if (impact >= 1) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
        <HiExclamationTriangle className="w-3 h-3" />
        {impact.toFixed(2)}%
      </span>
    );
  }

  return (
    <span className="text-[11px] font-medium text-green">
      {impact.toFixed(2)}%
    </span>
  );
}

export function PriceImpactWarning({ impact }: { impact: number }) {
  if (impact < 5) return null;
  return (
    <div className="rounded-xl bg-red/5 border border-red/20 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-red">
        <HiExclamationTriangle className="w-4 h-4" />
        Price impact is very high ({impact.toFixed(2)}%)
      </div>
      <div className="text-[11px] text-text-muted mt-0.5">
        You may receive significantly less than expected
      </div>
    </div>
  );
}
