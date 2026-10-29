"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import ScrollLink from "./ScrollLink";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

export default function SiteHeader({ showVehicleNews, showChargingStations }) {
  const { language } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <ScrollLink targetId="hero" className="flex shrink-0 items-center gap-3" aria-label={getMessage(language, "home")}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-blue-500/30">
            E
          </span>
          <span className="text-sm font-black tracking-[0.18em] text-slate-200 uppercase">Platform</span>
        </ScrollLink>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
          {showVehicleNews && <ScrollLink targetId="haberler" className="transition hover:text-blue-300">{getMessage(language, "news")}</ScrollLink>}
          {showChargingStations && <ScrollLink targetId="sarj" className="transition hover:text-blue-300">{getMessage(language, "chargingStations")}</ScrollLink>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
