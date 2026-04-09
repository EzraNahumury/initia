import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import id from "./id";
import zh from "./zh";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
    zh: { translation: zh },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Client-side only: restore saved language preference
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("lang");
  if (saved && (saved === "en" || saved === "id" || saved === "zh")) {
    i18n.changeLanguage(saved);
  }
}

export default i18n;
