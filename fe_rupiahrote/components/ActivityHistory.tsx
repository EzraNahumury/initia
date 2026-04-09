"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getActivities, type ActivityRecord } from "@/lib/activity";

const TYPE_LABELS: Record<string, string> = {
  swap: "Swap",
  bridge: "Bridge",
  send: "Send",
  batch: "Batch",
  limit: "Limit",
};

const TYPE_COLORS: Record<string, string> = {
  swap: "bg-blue-500",
  bridge: "bg-purple",
  send: "bg-cyan-500",
  batch: "bg-amber-500",
  limit: "bg-indigo-500",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber bg-amber/10",
  confirmed: "text-green bg-green/10",
  failed: "text-red bg-red/10",
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatDetail(a: ActivityRecord): string {
  switch (a.type) {
    case "swap":
      return `${a.tokenIn.amount} ${a.tokenIn.symbol} → ${a.tokenOut.amount} ${a.tokenOut.symbol}`;
    case "send":
      return `${a.tokenIn.amount} ${a.tokenIn.symbol}${a.recipient ? ` → ${a.recipient.length > 12 ? a.recipient.slice(0, 8) + "..." : a.recipient}` : ""}`;
    case "bridge": {
      const mode = a.meta?.bridgeMode === "withdraw" ? "Withdraw" : "Deposit";
      return `${mode} ${a.tokenIn.amount} ${a.tokenIn.symbol}`;
    }
    case "limit":
      return `${a.tokenIn.amount} ${a.tokenIn.symbol} → min ${a.tokenOut.amount} ${a.tokenOut.symbol}`;
    case "batch":
      return `${a.tokenIn.amount} ${a.tokenIn.symbol} → ${a.meta?.batchAllocations ?? a.tokenOut.symbol}`;
    default:
      return `${a.tokenIn.amount} ${a.tokenIn.symbol}`;
  }
}

function formatSubtext(a: ActivityRecord): string {
  const base = `${TYPE_LABELS[a.type] ?? a.type} · ${timeAgo(a.timestamp)}`;
  if (a.type === "limit" && a.meta?.limitExpiry) return `${base} · ${a.meta.limitExpiry}h expiry`;
  if (a.type === "bridge" && a.meta?.bridgeMode) return `${base} · ${a.meta.bridgeMode}`;
  return base;
}

/* ── Detail row inside popup ── */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-[7px] text-text-muted">{label}</span>
      <span className="text-[7px] font-medium text-text text-right max-w-[60%] break-all">{value}</span>
    </div>
  );
}

/* ── Detail popup ── */

function ActivityDetail({ activity, onClose }: { activity: ActivityRecord; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-[fadeIn_0.15s_ease]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative rounded-2xl glow-purple p-5 w-[360px] max-w-[90vw] animate-[slideUp_0.2s_ease]"
        style={{ background: "#0f0f23", border: "1px solid rgba(139,92,246,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[activity.type] ?? "bg-purple"}`} />
          <h3 className="text-[10px] font-bold text-text">{TYPE_LABELS[activity.type] ?? activity.type} Details</h3>
          <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${STATUS_STYLES[activity.status]}`}>
            {activity.status}
          </span>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-white cursor-pointer text-[8px] shrink-0"
            style={{ background: "rgba(159,41,255,0.15)" }}
          >
            &#x2715;
          </button>
        </div>

        {/* Details */}
        <div className="rounded-xl bg-bg border border-border px-3">
          <DetailRow label="Date" value={formatDate(activity.timestamp)} />

          {activity.type === "swap" && (() => {
            const amtIn = Number(activity.tokenIn.amount) || 0;
            const amtOut = Number(activity.tokenOut.amount) || 0;
            const rate = amtIn > 0 ? (amtOut / amtIn).toFixed(6) : "—";
            return (
              <>
                <DetailRow label="You Paid" value={`${activity.tokenIn.amount} ${activity.tokenIn.symbol}`} />
                <DetailRow label="You Got" value={`${activity.tokenOut.amount} ${activity.tokenOut.symbol}`} />
                <DetailRow label="Rate" value={`1 ${activity.tokenIn.symbol} = ${rate} ${activity.tokenOut.symbol}`} />
                {activity.priceImpact !== undefined && activity.priceImpact > 0 && (
                  <DetailRow label="Price Impact" value={`${activity.priceImpact.toFixed(2)}%`} />
                )}
                {activity.slippage !== undefined && (
                  <DetailRow label="Slippage" value={`${activity.slippage}%`} />
                )}
                <DetailRow label="Gas Fee" value="500 GAS" />
              </>
            );
          })()}

          {activity.type === "send" && (
            <>
              <DetailRow label="Token" value={activity.tokenIn.symbol} />
              <DetailRow label="Amount" value={`${activity.tokenIn.amount} ${activity.tokenIn.symbol}`} />
              {activity.recipient && (
                <DetailRow label="Recipient" value={activity.recipient} />
              )}
              <DetailRow label="Gas Fee" value="100 GAS" />
            </>
          )}

          {activity.type === "bridge" && (() => {
            const isDeposit = activity.meta?.bridgeMode !== "withdraw";
            return (
              <>
                <DetailRow label="Direction" value={isDeposit ? "Deposit" : "Withdraw"} />
                <DetailRow label="Token" value={activity.tokenIn.symbol} />
                <DetailRow label="Amount" value={`${activity.tokenIn.amount} ${activity.tokenIn.symbol}`} />
                <DetailRow label="From" value={isDeposit ? "External Chain" : "Initia (L2)"} />
                <DetailRow label="To" value={isDeposit ? "Initia (L2)" : "External Chain"} />
                <DetailRow label="Gas Fee" value="500 GAS" />
              </>
            );
          })()}

          {activity.type === "limit" && (
            <>
              <DetailRow label="Selling" value={`${activity.tokenIn.amount} ${activity.tokenIn.symbol}`} />
              <DetailRow label="Buying" value={activity.tokenOut.symbol} />
              <DetailRow label="Min Output" value={`${activity.tokenOut.amount} ${activity.tokenOut.symbol}`} />
              {activity.meta?.limitExpiry && (
                <DetailRow label="Expiry" value={`${activity.meta.limitExpiry} hours`} />
              )}
              <DetailRow label="Gas Fee" value="500 GAS" />
            </>
          )}

          {activity.type === "batch" && (() => {
            const raw = activity.meta?.batchAllocations ?? activity.tokenOut.symbol ?? "";
            const allocs = raw ? raw.split(", ").filter(Boolean) : [];
            return (
              <>
                <DetailRow label="Source" value={`${activity.tokenIn.amount} ${activity.tokenIn.symbol}`} />
                {allocs.length > 0 && (
                  <div className="py-2 border-b border-border">
                    <span className="text-[7px] text-text-muted block mb-1.5">Allocations</span>
                    <div className="space-y-1">
                      {allocs.map((a, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[7px] text-text">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <DetailRow label="Gas Fee" value="500 GAS" />
              </>
            );
          })()}

          {activity.txHash && (
            <DetailRow label="Tx Hash" value={`${activity.txHash.slice(0, 10)}...${activity.txHash.slice(-8)}`} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Main ── */

export function ActivityHistory({ address }: { address: string }) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [selected, setSelected] = useState<ActivityRecord | null>(null);

  useEffect(() => {
    setActivities(getActivities(address));
    const interval = setInterval(() => setActivities(getActivities(address)), 5000);
    return () => clearInterval(interval);
  }, [address]);

  if (activities.length === 0) {
    return (
      <div className="glass rounded-2xl glow-purple-sm p-5">
        <h3 className="text-[8px] font-semibold text-text-muted mb-3">Recent Activity</h3>
        <div className="text-center py-6">
          <p className="text-[8px] text-text-muted">No recent activity</p>
          <p className="text-[7px] text-text-muted/60 mt-0.5">Your swaps, bridges, and sends will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[8px] font-semibold text-text-muted">Recent Activity</h3>
        <span className="text-[7px] text-text-muted">{activities.length} txns</span>
      </div>
      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {activities.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-bg/60 transition-colors cursor-pointer text-left"
          >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_COLORS[a.type] ?? "bg-purple"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-medium text-text truncate">
                {formatDetail(a)}
              </div>
              <div className="text-[7px] text-text-muted">{formatSubtext(a)}</div>
            </div>
            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded shrink-0 ${STATUS_STYLES[a.status]}`}>
              {a.status}
            </span>
          </button>
        ))}
      </div>

      {selected && <ActivityDetail activity={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
