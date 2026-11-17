"use client";

import Image from "next/image";
import { Hand, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { getMessage, getVehicleValue } from "@/lib/i18n";

const cardSpecs = [
  { key: "range", labelKey: "rangeFilter", icon: "↗" },
  { key: "power", labelKey: "specPowerCard", icon: "⚡" },
  { key: "accel", labelKey: "accelerationFilter", icon: "ϟ" },
  { key: "efficiency", labelKey: "specEfficiency", icon: "⌁" },
];

function formatPower(power, language) {
  if (!power) return "";

  const horsepower = String(power).match(/([\d.,]+)\s*(PS|hp)\b/i);
  if (!horsepower) return power;

  const unit = language === "tr" ? "bg" : horsepower[2].toUpperCase();
  return `${horsepower[1]} ${unit}`;
}

export default function EVCard({ car, isSelected, onSelect, onDetails, isFeatured }) {
  const { language } = useLanguage();
  const cardRef = useRef(null);
  const [shouldLoadPower, setShouldLoadPower] = useState(false);
  const [power, setPower] = useState(car?.power || "");

  useEffect(() => {
    if (car?.power) {
      setPower(car.power);
      return undefined;
    }

    if (isFeatured) {
      setShouldLoadPower(true);
      return undefined;
    }

    const cardElement = cardRef.current;
    if (!cardElement || !("IntersectionObserver" in window)) {
      setShouldLoadPower(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoadPower(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });

    observer.observe(cardElement);
    return () => observer.disconnect();
  }, [car?.id, car?.power, isFeatured]);

  useEffect(() => {
    if (!shouldLoadPower || car?.power || !car?.id) return undefined;

    const controller = new AbortController();
    const loadPower = async () => {
      try {
        const response = await fetch(`/api/vehicle-power/${encodeURIComponent(car.id)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Vehicle power request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (typeof data.power === "string") setPower(data.power);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(`Araç gücü yüklenemedi (${car.id}):`, error);
        }
      }
    };

    loadPower();
    return () => controller.abort();
  }, [car?.id, car?.power, shouldLoadPower]);

  if (!car) return null;
  const displayedPower = formatPower(power, language);
  const carWithPower = { ...car, power: displayedPower };
  const modelName = car.model.toLocaleLowerCase(language).startsWith(car.brand.toLocaleLowerCase(language))
    ? car.model
    : `${car.brand} ${car.model}`;

  return (
    <article ref={cardRef} className={`ev-card group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 ${
      isSelected ? "border-lime-500 ring-2 ring-lime-100" : "border-slate-200/80"
    }`}>
      <div className="group/image relative h-47.5 overflow-hidden bg-linear-to-br from-slate-100 via-slate-50 to-[#e6eef4]">
        <button
          type="button"
          onClick={onDetails}
          aria-label={modelName}
          className="absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-lime-600"
        >
          <Image
            src={car.image}
            alt={modelName}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="object-contain p-2 transition duration-500 group-hover:scale-[1.04]"
          />
        </button>
        <span
          data-vehicle-detail-cue
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 translate-y-1 items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition duration-200 group-hover/image:translate-y-0 group-hover/image:opacity-100 group-focus-within/image:translate-y-0 group-focus-within/image:opacity-100"
        >
          <Hand size={14} />
          {getMessage(language, "vehicleDetail")}
        </span>
        <button
          type="button"
          onClick={onSelect}
          aria-label={getMessage(language, isSelected ? "removeFromCompare" : "addToCompare")}
          aria-pressed={isSelected}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${
            isSelected ? "border-lime-500 bg-lime-400 text-slate-950" : "border-white/80 bg-white/90 text-slate-600 hover:text-lime-700"
          }`}
        >
          <Heart size={17} fill={isSelected ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={onDetails}
          className="mb-3 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
        >
          <h3 className="text-[17px] font-extrabold leading-tight tracking-tight text-[#122747]">
            {modelName}
          </h3>
        </button>

        <div className="grid grid-cols-4 divide-x divide-slate-200 border-y border-slate-100 py-3">
          {cardSpecs.map(({ key, labelKey, icon }) => (
            <div key={key} className="min-w-0 px-2 first:pl-0 last:pr-0">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <span aria-hidden="true" className="text-sm font-bold text-slate-700">{icon}</span>
                <span className="truncate">{getMessage(language, labelKey)}</span>
              </span>
              <span className="mt-1 block truncate text-xs font-extrabold text-[#1c3150]">
                {getVehicleValue(language, key === "power" ? carWithPower : car, key) || "—"}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          className={`mt-3 min-h-9 w-full rounded-full border px-3 text-xs font-bold transition ${
            isSelected
              ? "border-lime-500 bg-lime-50 text-slate-900 hover:bg-lime-100"
              : "border-slate-300 text-slate-700 hover:border-slate-500 hover:bg-slate-50"
          }`}
        >
          {getMessage(language, isSelected ? "removeFromCompare" : "addToCompare")}
          {!isSelected && <span className="ml-1 text-sm">＋</span>}
        </button>
      </div>
    </article>
  );
}
