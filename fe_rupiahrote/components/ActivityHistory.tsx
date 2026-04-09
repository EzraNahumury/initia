"use client";

import { useState, useEffect } from "react";
import { getActivities, type ActivityRecord } from "@/lib/activity";
import { HiArrowsRightLeft, HiArrowUpRight, HiPaperAirplane, HiQueueList, HiClock } from "react-icons/hi2";

const TYPE_ICONS: Record<string, typeof HiArrowsRightLeft> = {
  swap: HiArrowsRightLeft,
  bridge: HiArrowUpRight,
  send: HiPaperAirplane,
  batch: HiQueueList,
  limit: HiClock,
};

const TYPE_COLORS: Record<string, string> = {
  swap: "bg-blue-500",
  bridge: "bg-purple-500",
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

export function ActivityHistory({ address }: { address: string }) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setActivities(getActivities(address));
  }, [address]);

  const visible = showAll ? activities : activities.slice(0, 8);

  if (activities.length === 0) {
    return (
      <div className="glass rounded-2xl glow-purple-sm p-5">
        <h3 className="text-[12px] font-semibold text-text-muted mb-3">Recent Activity</h3>
        <div className="text-center py-6">
          <HiArrowsRightLeft className="w-8 h-8 text-text-muted/30 mx-auto mb-2" />
          <p className="text-[12px] text-text-muted">No recent activity</p>
          <p className="text-[11px] text-text-muted/60 mt-0.5">Your swaps, bridges, and sends will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-semibold text-text-muted">Recent Activity</h3>
        <span className="text-[11px] text-text-muted">{activities.length} transactions</span>
      </div>
      <div className="space-y-1.5">
        {visible.map((a) => {
          const Icon = TYPE_ICONS[a.type] ?? HiArrowsRightLeft;
          return (
            <div key={a.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-bg/60 transition-colors">
              <div className={`w-7 h-7 rounded-lg ${TYPE_COLORS[a.type] ?? "bg-purple-500"} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[12px] font-medium text-text">
                  <span>{a.tokenIn.amount} {a.tokenIn.symbol}</span>
                  <span className="text-text-muted">→</span>
                  <span>{a.tokenOut.amount} {a.tokenOut.symbol}</span>
                </div>
                <div className="text-[10px] text-text-muted capitalize">{a.type} · {timeAgo(a.timestamp)}</div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_STYLES[a.status]}`}>
                {a.status}
              </span>
            </div>
          );
        })}
      </div>
      {activities.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 py-2 text-[11px] font-medium text-text-muted hover:text-text-sub transition-colors cursor-pointer"
        >
          {showAll ? "Show less" : `View all ${activities.length} transactions`}
        </button>
      )}
    </div>
  );
}
