"use client";

import { useLanguage } from "./LanguageProvider";
import { getMessage, supportedLanguages } from "@/lib/i18n";

const languageNames = {
  tr: "Türkçe",
  en: "EN",
  fr: "Français",
  ru: "Русский",
  zh: "中文",
  de: "Deutsch",
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      aria-label={getMessage(language, "language")}
      value={language}
      onChange={(event) => setLanguage(event.target.value)}
      disabled
      className="cursor-not-allowed rounded-full border border-white/15 bg-slate-900 px-3 py-2 text-xs font-bold text-white opacity-50 outline-none transition"
    >
      {supportedLanguages.map((option) => (
        <option key={option} value={option} className="bg-slate-900">
          {languageNames[option]}
        </option>
      ))}
    </select>
  );
}
