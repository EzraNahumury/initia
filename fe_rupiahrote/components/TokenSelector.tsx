"use client";

import { useState, useRef, useEffect } from "react";
import { TOKENS, type Token } from "@/lib/contract";
import { tokenStyle } from "@/lib/tokens";
import { HiChevronDown } from "react-icons/hi2";

interface Props { selected: Token; onSelect: (t: Token) => void; disabledToken?: Token; }

export function TokenSelector({ selected, onSelect, disabledToken }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ts = tokenStyle(selected.symbol);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-border hover:border-border-hover transition-colors cursor-pointer">
        <div className={`w-6 h-6 rounded-full ${ts.bg} flex items-center justify-center ring-2 ${ts.ring}`}>
          <span className="text-[10px] font-bold text-white">{selected.symbol.charAt(0)}</span>
        </div>
        <span className="text-[14px] font-semibold text-text">{selected.symbol}</span>
        <HiChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 w-52 bg-white border border-border rounded-2xl shadow-lg shadow-black/5 py-1 overflow-hidden">
          {TOKENS.map((token) => {
            const s = tokenStyle(token.symbol);
            const disabled = disabledToken?.address === token.address;
            return (
              <button key={token.symbol} disabled={disabled}
                onClick={() => { onSelect(token); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                  disabled ? "opacity-20 cursor-not-allowed" : selected.symbol === token.symbol ? "bg-bg" : "hover:bg-bg"
                }`}>
                <div className={`w-7 h-7 rounded-full ${s.bg} flex items-center justify-center ring-2 ${s.ring}`}>
                  <span className="text-[10px] font-bold text-white">{token.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-text">{token.symbol}</div>
                  <div className="text-[12px] text-text-muted">{token.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
