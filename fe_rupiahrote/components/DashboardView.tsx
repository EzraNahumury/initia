"use client";

import { useAccount, useReadContract } from "wagmi";
import { useTranslation } from "react-i18next";
import { routerContract, formatAmount, formatRupiah } from "@/lib/contract";
import { HiChartBar, HiArrowTrendingUp, HiBolt, HiTrophy } from "react-icons/hi2";

const LEADERBOARD = [
  { name: "@toptrader.init", volume: "$12,500", swaps: 87 },
  { name: "@rupiahking.init", volume: "$8,200", swaps: 54 },
  { name: "@defimaster.init", volume: "$5,100", swaps: 32 },
  { name: "@hodler.init", volume: "$3,800", swaps: 21 },
  { name: "@newbie.init", volume: "$1,200", swaps: 8 },
];

function Stat({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-lg shadow-black/[0.04] p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[12px] text-text-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function DashboardView() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();

  const { data: swapCount } = useReadContract({ ...routerContract, functionName: "userSwapCount", args: address ? [address] : undefined, query: { enabled: !!address } });
  const { data: totalSavings } = useReadContract({ ...routerContract, functionName: "userTotalSavings", args: address ? [address] : undefined, query: { enabled: !!address } });
  const { data: poolCount } = useReadContract({ ...routerContract, functionName: "poolCount" });

  const swaps = Number(swapCount ?? 0n);
  const savings = totalSavings ?? 0n;
  const savingsFormatted = formatAmount(savings, 6);
  const savingsRupiah = formatRupiah(Number(savingsFormatted));

  if (!isConnected) {
    return (
      <div className="bg-white border border-border rounded-2xl shadow-lg shadow-black/[0.04] p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <HiChartBar className="w-6 h-6 text-text-muted" />
        </div>
        <h2 className="text-[16px] font-bold mb-1 text-text">{t("dashboard.title")}</h2>
        <p className="text-text-muted text-[13px]">{t("dashboard.connectPrompt")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={HiChartBar} label={t("dashboard.totalSwaps")} value={swaps.toString()} sub={t("dashboard.sinceStart")} color="bg-neutral-800" />
        <Stat icon={HiArrowTrendingUp} label={t("dashboard.totalSavings")} value={savingsRupiah} sub={`${savingsFormatted} USDC`} color="bg-green-600" />
        <Stat icon={HiBolt} label={t("dashboard.gasSaved")} value="~95%" sub={t("dashboard.vsEthereum")} color="bg-amber-500" />
        <Stat icon={HiTrophy} label={t("dashboard.activePools")} value={poolCount?.toString() ?? "0"} sub={t("dashboard.poolsSub")} color="bg-neutral-600" />
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-lg shadow-black/[0.04] p-5">
        <h3 className="text-[12px] font-semibold text-text-muted mb-4">{t("dashboard.performance")}</h3>
        <div className="grid grid-cols-3 gap-4">
          {[{ val: "100ms", label: t("dashboard.blockTime"), color: "text-text" },
            { val: "~Rp 0", label: t("dashboard.gasFee"), color: "text-green" },
            { val: "L2", label: t("dashboard.settlement"), color: "text-text-sub" }].map((item, i) => (
            <div key={i} className="text-center">
              <div className={`text-xl font-bold ${item.color}`}>{item.val}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-lg shadow-black/[0.04] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
            <HiTrophy className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-[12px] font-semibold text-text-muted">{t("dashboard.topTraders")}</h3>
        </div>
        <div className="space-y-0.5">
          {LEADERBOARD.map((trader, i) => (
            <div key={i}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-bg transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-[13px] font-bold w-5 ${i === 0 ? "text-amber-500" : i === 1 ? "text-text-sub" : i === 2 ? "text-amber-700" : "text-text-muted"}`}>
                  {i + 1}
                </span>
                <span className="text-[13px] font-semibold text-text">{trader.name}</span>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold text-text">{trader.volume}</div>
                <div className="text-[11px] text-text-muted">{trader.swaps} {t("dashboard.swaps")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
