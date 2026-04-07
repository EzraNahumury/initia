"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggle = () => {
    const next = i18n.language === "id" ? "en" : "id";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <button onClick={mounted ? toggle : undefined}
      className="px-3 py-2 text-[13px] font-medium rounded-full border border-border hover:border-border-hover text-text-sub hover:text-text transition-colors cursor-pointer">
      {mounted ? (i18n.language === "id" ? "EN" : "ID") : "EN"}
    </button>
  );
}
