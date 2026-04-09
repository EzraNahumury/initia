"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
  { code: "zh", label: "中文" },
] as const;

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0];

  const select = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={mounted ? () => setOpen(!open) : undefined}
        className="px-3 py-2 text-[8px] font-medium rounded-full border border-border hover:border-border-hover text-text-sub hover:text-text transition-colors cursor-pointer"
      >
        {mounted ? current.label : "EN"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-xl border border-border overflow-hidden z-50 animate-[fadeIn_0.1s_ease]"
          style={{ background: "#0f0f23" }}
        >
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => select(lang.code)}
              className={`w-full px-4 py-2 text-[8px] font-medium text-left transition-colors cursor-pointer ${
                lang.code === current.code
                  ? "bg-purple text-white"
                  : "text-text-sub hover:bg-purple/10"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
