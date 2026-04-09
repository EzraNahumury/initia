"use client";

import { useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const INIT_RE = /^[a-z0-9]+\.init$/;

export function RecipientToggle({
  recipient,
  onChange,
}: {
  recipient: string | null;
  onChange: (addr: string | null) => void;
}) {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => {
    if (enabled) {
      onChange(null);
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  };

  const isValid = recipient
    ? ADDR_RE.test(recipient) || INIT_RE.test(recipient)
    : false;

  return (
    <div className="mt-1">
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-1 py-1 text-[11px] text-text-muted hover:text-text-sub transition-colors cursor-pointer"
      >
        <div
          className={`w-7 h-4 rounded-full transition-colors relative ${
            enabled ? "bg-text" : "bg-border"
          }`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-3.5" : "translate-x-0.5"
            }`}
          />
        </div>
        Send to different address
      </button>

      {enabled && (
        <div className="mt-1.5 rounded-xl bg-bg p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="0x... or name.init"
              value={recipient ?? ""}
              onChange={(e) => onChange(e.target.value || null)}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder-text-muted/50 font-mono min-w-0"
            />
            {recipient && (
              isValid ? (
                <HiCheckCircle className="w-4 h-4 text-green shrink-0" />
              ) : (
                <HiXCircle className="w-4 h-4 text-red shrink-0" />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
