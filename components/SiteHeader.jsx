"use client";

import ScrollLink from "./ScrollLink";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

export default function SiteHeader() {
  const { language } = useLanguage();

  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <nav aria-label={getMessage(language, "home")} className="mx-auto flex h-[72px] max-w-[1320px] items-center px-5 lg:px-8">
        <ScrollLink targetId="hero" className="brand-mark flex shrink-0 items-center" aria-label="EV Platform">
          <span className="brand-ev-badge">EV</span><span className="ml-1.5">Platform</span>
        </ScrollLink>
      </nav>
    </header>
  );
}
