"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeLanguage } from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children, initialLanguage }) {
  const [language, setLanguage] = useState(normalizeLanguage(initialLanguage));
  const router = useRouter();

  const value = useMemo(() => ({
    language,
    setLanguage(nextLanguage) {
      const next = normalizeLanguage(nextLanguage);
      if (next === language) return;

      document.cookie = `ev-platform-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
      setLanguage(next);
      router.refresh();
    },
  }), [language, router]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
