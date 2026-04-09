"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useTranslation } from "react-i18next";
import { CORE_TOKENS, type Token } from "@/lib/contract";
import { getActivities, type ActivityRecord } from "@/lib/activity";
import { ActivityHistory } from "./ActivityHistory";
import { HiChartBar } from "react-icons/hi2";

const ERC20_BALANCE_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

/* ── Token balance row ── */

function BalanceRow({ token, address }: { token: Token; address: `0x${string}` }) {
  const { data: balance } = useReadContract({
    address: token.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { refetchInterval: 10000 },
  });

  const raw = balance ?? 0n;
  const num = Number(raw) / 10 ** token.decimals;
  const formatted = num > 0
    ? num.toLocaleString(undefined, { maximumFractionDigits: token.decimals <= 2 ? 0 : 2 })
    : "0";

  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-purple/5 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-purple/10 flex items-center justify-center shrink-0">
          {token.logoURI ? (
            <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="font-bold text-purple-light text-[7px]">{token.symbol.charAt(0)}</span>
          )}
        </div>
        <div>
          <span className="text-[8px] font-semibold text-white block">{token.symbol}</span>
          <span className="text-[7px] text-text-muted">{token.name}</span>
        </div>
      </div>
      <span className={`text-[8px] font-bold ${num > 0 ? "text-green" : "text-text-muted"}`}>
        {formatted}
      </span>
    </div>
  );
}

/* ── Calculate stats from activity ── */

function useActivityStats(address: string) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    setActivities(getActivities(address));
    const interval = setInterval(() => setActivities(getActivities(address)), 5000);
    return () => clearInterval(interval);
  }, [address]);

  return useMemo(() => {
    const confirmed = activities.filter((a) => a.status === "confirmed");
    const totalTxns = confirmed.length;

    // Count by type
    const byType: Record<string, number> = {};
    for (const a of confirmed) {
      byType[a.type] = (byType[a.type] ?? 0) + 1;
    }

    // Gas spent estimate
    const GAS_PER_TYPE: Record<string, number> = { swap: 500, limit: 500, batch: 500, bridge: 500, send: 100 };
    let gasSpent = 0;
    for (const a of confirmed) {
      gasSpent += GAS_PER_TYPE[a.type] ?? 500;
    }

    // Bridge breakdown — count by mode
    const bridges = confirmed.filter((a) => a.type === "bridge");
    const depositCount = bridges.filter((a) => (a.meta?.bridgeMode ?? "deposit") === "deposit").length;
    const withdrawCount = bridges.filter((a) => a.meta?.bridgeMode === "withdraw").length;

    // Limit orders
    const limits = confirmed.filter((a) => a.type === "limit");
    const activeLimit = limits.length;

    // Sends — unique recipients
    const sends = confirmed.filter((a) => a.type === "send");
    const uniqueRecipients = new Set(sends.map((a) => a.recipient).filter(Boolean)).size;

    return { totalTxns, byType, gasSpent, activities, depositCount, withdrawCount, activeLimit, uniqueRecipients, sendCount: sends.length };
  }, [activities]);
}

/* ── Type breakdown colors ── */

const TYPE_META: Record<string, { label: string; color: string }> = {
  swap: { label: "Swaps", color: "bg-blue-500" },
  send: { label: "Sends", color: "bg-cyan-500" },
  limit: { label: "Limits", color: "bg-indigo-500" },
  batch: { label: "Batch", color: "bg-amber-500" },
  bridge: { label: "Bridges", color: "bg-purple" },
};

/* ── Main ── */

export function DashboardView() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const { data: gasBalance } = useBalance({ address, query: { refetchInterval: 10000 } });

  const stats = useActivityStats(address ?? "");

  const gasFormatted = gasBalance
    ? (Number(gasBalance.value) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl glow-purple-sm p-10 text-center max-w-[520px] mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center mx-auto mb-4">
          <HiChartBar className="w-6 h-6 text-text-muted" />
        </div>
        <h2 className="text-[10px] font-bold mb-1 text-text">{t("dashboard.title")}</h2>
        <p className="text-text-muted text-[8px]">{t("dashboard.connectPrompt")}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      {/* Left: Portfolio + Stats */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Portfolio */}
        <div className="glass rounded-2xl glow-purple-sm p-5">
          <h3 className="text-[8px] font-semibold text-text-muted mb-3">Portfolio</h3>

          {/* Native GAS balance */}
          <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-purple/5 transition-colors mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-purple/20 flex items-center justify-center shrink-0">
                <span className="font-bold text-purple-light text-[7px]">G</span>
              </div>
              <div>
                <span className="text-[8px] font-semibold text-white block">GAS</span>
                <span className="text-[7px] text-text-muted">Native Gas Token</span>
              </div>
            </div>
            <span className={`text-[8px] font-bold ${Number(gasFormatted) > 0 ? "text-green" : "text-text-muted"}`}>
              {gasFormatted}
            </span>
          </div>

          <div className="h-px bg-border mx-2 my-1" />

          {/* ERC20 balances */}
          {CORE_TOKENS.map((token) => (
            <BalanceRow key={token.symbol} token={token} address={address!} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl glow-purple-sm p-4">
            <div className="text-[7px] text-text-muted mb-1">Transactions</div>
            <div className="text-[10px] font-bold text-text">{stats.totalTxns}</div>
          </div>
          <div className="glass rounded-2xl glow-purple-sm p-4">
            <div className="text-[7px] text-text-muted mb-1">Gas Spent</div>
            <div className="text-[10px] font-bold text-text">{stats.gasSpent.toLocaleString()} GAS</div>
          </div>
          <div className="glass rounded-2xl glow-purple-sm p-4">
            <div className="text-[7px] text-text-muted mb-1">Most Used</div>
            <div className="text-[10px] font-bold text-text">
              {Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Summaries + Activity */}
      <div className="w-[380px] shrink-0 space-y-4">
        {/* Per-feature summaries */}
        <div className="glass rounded-2xl glow-purple-sm p-5 space-y-3">
          <h3 className="text-[8px] font-semibold text-text-muted">Summary</h3>

          {stats.totalTxns === 0 ? (
            <p className="text-[7px] text-text-muted text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {/* Swaps */}
              {(stats.byType["swap"] ?? 0) > 0 && (
                <div className="rounded-xl bg-bg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[7px] text-text-sub">Swaps</span>
                  </div>
                  <span className="text-[8px] font-bold text-text">{stats.byType["swap"]}</span>
                </div>
              )}

              {/* Bridge */}
              {(stats.byType["bridge"] ?? 0) > 0 && (
                <div className="rounded-xl bg-bg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple" />
                      <span className="text-[7px] text-text-sub">Bridge</span>
                    </div>
                    <span className="text-[8px] font-bold text-text">{stats.byType["bridge"]} txns</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-green/5 border border-green/10 px-2 py-1.5 text-center">
                      <div className="text-[8px] font-bold text-green">{stats.depositCount}</div>
                      <div className="text-[7px] text-text-muted">Deposits</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-amber/5 border border-amber/10 px-2 py-1.5 text-center">
                      <div className="text-[8px] font-bold text-amber">{stats.withdrawCount}</div>
                      <div className="text-[7px] text-text-muted">Withdrawals</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sends */}
              {(stats.byType["send"] ?? 0) > 0 && (
                <div className="rounded-xl bg-bg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <div>
                      <span className="text-[7px] text-text-sub block">Sends</span>
                      <span className="text-[7px] text-text-muted">{stats.uniqueRecipients} recipient{stats.uniqueRecipients !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-text">{stats.sendCount}</span>
                </div>
              )}

              {/* Limit */}
              {(stats.byType["limit"] ?? 0) > 0 && (
                <div className="rounded-xl bg-bg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[7px] text-text-sub">Limit Orders</span>
                  </div>
                  <span className="text-[8px] font-bold text-text">{stats.activeLimit}</span>
                </div>
              )}

              {/* Batch */}
              {(stats.byType["batch"] ?? 0) > 0 && (
                <div className="rounded-xl bg-bg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[7px] text-text-sub">Batch Swaps</span>
                  </div>
                  <span className="text-[8px] font-bold text-text">{stats.byType["batch"]}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <ActivityHistory address={address!} />
      </div>
    </div>
  );
}
