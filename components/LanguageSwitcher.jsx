"use client";

import { useLanguage } from "./LanguageProvider";
import { getMessage, supportedLanguages } from "@/lib/i18n";

const languageNames = {
  tr: "Türkçe",
  en: "EN",
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
      className="rounded-full border border-white/15 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none transition focus:border-blue-400"
    >
      {supportedLanguages.map((option) => (
        <option key={option} value={option} className="bg-slate-900">
          {languageNames[option]}
        </option>
      ))}
    </select>
  );
}
