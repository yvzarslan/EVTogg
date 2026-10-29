"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';
import { showChargingStations } from '@/lib/features';
import { useLanguage } from './LanguageProvider';
import ScrollLink from './ScrollLink';
import { getMessage } from '@/lib/i18n';

export default function Hero() {
  const { language } = useLanguage();

  return (
    <section className="relative h-[80vh] min-h-[520px] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.35),_transparent_30%),linear-gradient(135deg,#020817_0%,#0f172a_40%,#1d4ed8_100%)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <Image src="/EVCar.jpeg" alt="EVCar" fill className="object-cover object-scale-down opacity-30" priority />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.25),rgba(15,23,42,0.7))]" />

      <div className="relative z-10 max-w-5xl px-4 text-center text-white">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl"
        >
          {getMessage(language, "heroTitle")} <span className="text-blue-300">{getMessage(language, "heroTitleAccent")}</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base text-slate-200 sm:text-xl"
        >
          {getMessage(language, "heroSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <ScrollLink targetId="araclar" className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-black text-white shadow-[0_18px_45px_rgba(59,130,246,0.5)] transition hover:bg-blue-400">
            {getMessage(language, "viewVehicles")}
          </ScrollLink>
          {showChargingStations && (
            <ScrollLink targetId="sarj" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/10">
              {getMessage(language, "chargingStations")}
            </ScrollLink>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 backdrop-blur-sm">
            <div className="text-sm font-black text-white">{getMessage(language, "modelCount")}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}