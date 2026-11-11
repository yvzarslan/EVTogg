"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import ScrollLink from "./ScrollLink";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

export default function Hero() {
  const { language } = useLanguage();

  return (
    <section className="hero-section px-4 pb-5 pt-4 sm:px-6 lg:px-8">
      <div className="hero-panel relative mx-auto min-h-[530px] max-w-[1320px] overflow-hidden rounded-[26px] bg-[#edf2f7] md:min-h-[470px]">
        <div className="hero-image-desktop absolute inset-y-0 right-0 hidden w-[63%] md:block">
          <Image
            src="/EVCar.jpeg"
            alt="Modern elektrikli araç, şehir içi şarj noktasında"
            fill
            priority
            sizes="(max-width: 1280px) 60vw, 800px"
            className="object-cover object-[center_57%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#edf2f7] via-[#edf2f7]/25 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#dce5ed]/20 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 flex min-h-[530px] flex-col items-start px-6 pb-0 pt-9 sm:px-10 md:min-h-[470px] md:justify-center md:px-12 md:py-12"
        >
          <div className="hero-model-count absolute right-10 top-10 hidden rounded-xl border border-white/80 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md md:block">
            <span className="block text-2xl font-extrabold leading-none tracking-tight text-[#122747]">{getMessage(language, "modelCount")}</span>
          </div>

          <div className="relative z-10 max-w-[510px] pr-16 md:pr-0">
            <p className="mb-4 hidden text-xs font-bold uppercase tracking-[0.2em] text-slate-500 md:block">Elektrikli mobilite rehberi</p>
            <h1 className="max-w-[510px] text-[38px] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#102447] sm:text-5xl lg:text-[60px]">
              {getMessage(language, "heroTitle")}
              <span className="block">{getMessage(language, "heroTitleAccent")}</span>
            </h1>
            <p className="mt-4 max-w-[390px] text-sm leading-6 text-slate-600 sm:text-base">
              {getMessage(language, "heroSubtitle")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ScrollLink
                targetId="araclar"
                className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#9bea21] px-6 text-sm font-extrabold text-slate-950 shadow-[0_8px_24px_rgba(119,193,23,0.18)] transition hover:-translate-y-0.5 hover:bg-[#8bd91a]"
              >
                {getMessage(language, "viewVehicles")} <ArrowRight size={16} />
              </ScrollLink>
              <Link
                href="/maliyet-hesaplama"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300/90 bg-white/80 px-5 text-sm font-bold text-[#20334f] shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white"
              >
                <Calculator size={16} />
                {getMessage(language, "costGuideNav")}
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="hero-image-mobile absolute inset-x-0 bottom-0 h-[220px] md:hidden">
          <Image
            src="/EVCar.jpeg"
            alt=""
            fill
            priority
            sizes="(max-width: 767px) calc(100vw - 32px), 0px"
            className="object-cover object-[center_60%]"
          />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#edf2f7] to-transparent" />
        </div>
      </div>
    </section>
  );
}
