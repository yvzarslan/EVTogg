"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EVCard from "./EVCard";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

export default function ComparisonWrapper({ displayCars }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const router = useRouter();
  const { language } = useLanguage();

  const evcarleSelection = (car) => {
    setSelectedCars((prev) => {
      const isSelected = prev.find((c) => c.id === car.id);
      if (isSelected) return prev.filter((c) => c.id !== car.id);
      if (prev.length < 4) return [...prev, car];
      return prev;
    });
  };

  const goToCompare = () => {
    const ids = selectedCars.map(c => c.id).join(",");
    router.push(`/compare?ids=${ids}`);
  };

  return (
    <>
      <div
        className="grid w-full justify-items-center gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}
      >
        {displayCars.map((car) => (
          <EVCard
            key={car.id}
            car={car}
            isSelected={selectedCars.some((c) => c.id === car.id)}
            onSelect={() => evcarleSelection(car)}
          />
        ))}
      </div>

      {selectedCars.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-200 bg-white/90 p-4 shadow-[0_-15px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-5">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {selectedCars.map((car) => (
                <div key={car.id} className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 pr-8">
                  <div className="relative h-8 w-10 overflow-hidden rounded-lg bg-white">
                    <Image src={car.image} alt={car.model} fill className="object-contain" sizes="40px" />
                  </div>
                  <span className="max-w-[90px] truncate text-xs font-bold text-slate-800">{car.model}</span>
                  <button onClick={() => evcarleSelection(car)} className="absolute right-2 text-sm font-black text-red-500">✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={goToCompare}
              className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(59,130,246,0.4)] transition hover:bg-blue-500 md:w-auto"
            >
              {getMessage(language, "compare")} ({selectedCars.length})
            </button>
          </div>
        </div>
      )}
    </>
  );
}