import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import id from "./id";
import en from "./en";

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
  },
  lng: "id",
  fallbackLng: "id",
  interpolation: { escapeValue: false },
});

// Client-side only: restore saved language preference
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("lang");
  if (saved && (saved === "en" || saved === "id")) {
    i18n.changeLanguage(saved);
  }
}

export default i18n;
