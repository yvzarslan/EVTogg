"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

export default function SiteHeader({ showVehicleNews, showChargingStations }) {
  const { language } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/#hero" className="flex shrink-0 items-center gap-3" aria-label={getMessage(language, "home")}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-blue-500/30">
            E
          </span>
          <span className="text-sm font-black tracking-[0.18em] text-slate-200 uppercase">Platform</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
          {showVehicleNews && <Link href="/#haberler" className="transition hover:text-blue-300">{getMessage(language, "news")}</Link>}
          {showChargingStations && <Link href="/#sarj" className="transition hover:text-blue-300">{getMessage(language, "chargingStations")}</Link>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#araclar"
            className="hidden rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20 sm:inline-flex"
          >
            {getMessage(language, "quickSearch")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
