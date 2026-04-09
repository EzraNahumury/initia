"use client";

import { useState } from "react";
import { HiCog6Tooth } from "react-icons/hi2";

const PRESETS = [0.1, 0.5, 1, 3];

export function SlippageSettings({
  slippage,
  onChange,
}: {
  slippage: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const isCustom = !PRESETS.includes(slippage);

  const handleCustom = (val: string) => {
    setCustom(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0 && n <= 50) onChange(n);
  };

  const handlePreset = (v: number) => {
    setCustom("");
    onChange(v);
  };

  const warning =
    slippage > 5
      ? "High slippage — you may lose value"
      : slippage < 0.05
        ? "Slippage too low — tx may fail"
        : null;

  return (
    <div className="flex items-center gap-2">
      {open && (
        <div className="flex items-center gap-1">
          {PRESETS.map((v) => (
            <button
              key={v}
              onClick={() => handlePreset(v)}
              className={`px-2 py-0.5 text-[11px] rounded-md font-medium cursor-pointer transition-colors ${
                slippage === v && !isCustom
                  ? "bg-text text-white"
                  : "bg-bg text-text-sub hover:bg-border"
              }`}
            >
              {v}%
            </button>
          ))}
          <div className="relative">
            <input
              type="number"
              placeholder="Custom"
              value={isCustom ? (custom || slippage.toString()) : custom}
              onChange={(e) => handleCustom(e.target.value)}
              className={`w-[58px] px-1.5 py-0.5 text-[11px] rounded-md font-medium outline-none border transition-colors text-right ${
                isCustom
                  ? "border-text bg-text text-white placeholder-white/50"
                  : "border-border bg-bg text-text-sub placeholder-text-muted"
              }`}
              step="0.01"
              min="0.01"
              max="50"
            />
            <span
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${
                isCustom ? "text-white/70" : "text-text-muted"
              }`}
            >
              %
            </span>
          </div>
        </div>
      )}
      {warning && open && (
        <span className={`text-[10px] font-medium ${slippage > 5 ? "text-amber" : "text-red"}`}>
          {warning}
        </span>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-bg text-text-muted hover:text-text-sub transition-colors cursor-pointer text-[12px]"
      >
        {slippage}%
        <HiCog6Tooth className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
