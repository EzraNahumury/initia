"use client";

import { useState, useEffect } from "react";
import { getXP, xpForLevel, type XPState } from "@/lib/xp";
import { HiTrophy, HiBolt, HiArrowsRightLeft, HiArrowUpRight, HiPaperAirplane, HiQueueList, HiClock } from "react-icons/hi2";

const LEVEL_COLORS = [
  "from-neutral-400 to-neutral-500",
  "from-green-400 to-green-600",
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-amber-400 to-amber-600",
  "from-red-400 to-red-600",
];

const ACTION_META: Record<string, { icon: typeof HiBolt; label: string; xp: number }> = {
  swap: { icon: HiArrowsRightLeft, label: "Swaps", xp: 10 },
  bridge: { icon: HiArrowUpRight, label: "Bridges", xp: 15 },
  send: { icon: HiPaperAirplane, label: "Sends", xp: 5 },
  batch: { icon: HiQueueList, label: "Batch", xp: 20 },
  limit: { icon: HiClock, label: "Limits", xp: 12 },
};

export function XPDisplay({ address }: { address: string }) {
  const [xp, setXP] = useState<XPState>({ totalXP: 0, level: 0, actions: {} });

  useEffect(() => {
    setXP(getXP(address));
    const onStorage = () => setXP(getXP(address));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [address]);

  const nextLevel = xp.level + 1;
  const currentLevelXP = xpForLevel(xp.level);
  const nextLevelXP = xpForLevel(nextLevel);
  const progressXP = xp.totalXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPct = neededXP > 0 ? Math.min((progressXP / neededXP) * 100, 100) : 0;
  const colorIdx = Math.min(xp.level, LEVEL_COLORS.length - 1);

  return (
    <div className="glass rounded-2xl glow-purple-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        {/* Level badge */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${LEVEL_COLORS[colorIdx]} flex items-center justify-center shrink-0`}>
          <span className="text-white font-bold text-[16px]">{xp.level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-text">Level {xp.level}</span>
            <span className="text-[11px] text-text-muted">{xp.totalXP} XP</span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-2 bg-bg rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${LEVEL_COLORS[colorIdx]} transition-all duration-500`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px] text-text-muted mt-1">
            {progressXP} / {neededXP} XP to Level {nextLevel}
          </div>
        </div>
      </div>

      {/* Action breakdown */}
      {Object.keys(xp.actions).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(ACTION_META).map(([key, meta]) => {
            const count = xp.actions[key] ?? 0;
            if (count === 0) return null;
            const Icon = meta.icon;
            return (
              <div key={key} className="rounded-lg bg-bg px-2.5 py-2 text-center">
                <Icon className="w-3.5 h-3.5 text-text-muted mx-auto mb-0.5" />
                <div className="text-[13px] font-bold text-text">{count}</div>
                <div className="text-[9px] text-text-muted">{meta.label} (+{meta.xp})</div>
              </div>
            );
          })}
        </div>
      )}

      {xp.totalXP === 0 && (
        <div className="text-center py-3">
          <HiTrophy className="w-6 h-6 text-text-muted/30 mx-auto mb-1" />
          <p className="text-[11px] text-text-muted">Start swapping to earn XP</p>
        </div>
      )}
    </div>
  );
}
