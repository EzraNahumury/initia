"use client";

import { useTranslation } from "react-i18next";
import { TOKENS } from "@/lib/contract";
import { HiArrowLongRight, HiCheck } from "react-icons/hi2";

interface RouteInfo { routeType: number; path: string[]; expectedOut: string; estimatedGas: string; savings?: string; }

function sym(addr: string) {
  return TOKENS.find((t) => t.address.toLowerCase() === addr.toLowerCase())?.symbol || addr.slice(0, 6);
}

export function RouteDisplay({ routes, bestIndex }: { routes: RouteInfo[]; bestIndex: number }) {
  const { t } = useTranslation();
  if (!routes.length) return null;
  const label = (n: number) => n === 0 ? t("common.direct") : n === 1 ? t("common.multiHop") : t("common.crossChain");

  return (
    <div className="space-y-1.5">
      {routes.map((r, i) => (
        <div key={i} className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-[13px] ${
          i === bestIndex ? "bg-green-bg" : "bg-bg"
        }`}>
          <div className="flex items-center gap-2">
            {i === bestIndex && <HiCheck className="w-3.5 h-3.5 text-green" />}
            <span className="text-text-muted">{label(r.routeType)}</span>
            <span className="text-text-muted">·</span>
            {r.path.map((a, j) => (
              <span key={j} className="flex items-center gap-1 text-text-sub font-medium">
                {j > 0 && <HiArrowLongRight className="w-3 h-3 text-text-muted" />}
                {sym(a)}
              </span>
            ))}
          </div>
          <span className="font-semibold text-text">{r.expectedOut}</span>
        </div>
      ))}
      {routes[bestIndex]?.savings && (
        <div className="text-center text-[12px] text-green font-medium py-1">
          {t("swap.savings", { amount: routes[bestIndex].savings })}
        </div>
      )}
    </div>
  );
}
