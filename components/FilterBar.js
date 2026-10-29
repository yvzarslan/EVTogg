"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { bodyStyleLabels, segmentLabels } from "@/lib/vehicleFilters";
import { useLanguage } from "./LanguageProvider";
import { getMessage, getSegmentTranslation, getBodyStyleTranslation } from "@/lib/i18n";

export default function FilterBar({
  initialBrands = [],
  initialSegments = [],
  initialBodyStyles = [],
  currentFilters,
}) {
  const router = useRouter();
  const { language } = useLanguage();
  //const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    brand: currentFilters.brand || "",
    range: currentFilters.range || 660,
    accel: currentFilters.accel || 10,
    segment: currentFilters.segment || "",
    bodyStyle: currentFilters.bodyStyle || "",
  });

  // Filtreler değiştiğinde URL'yi güncelle (Debounce ile)
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.segment) params.set("segment", filters.segment);
      if (filters.bodyStyle) params.set("bodyStyle", filters.bodyStyle);
      if (filters.range) params.set("range", filters.range);
      if (filters.accel) params.set("accel", filters.accel);

      // URL'yi güncelle (Sayfayı yenilemeden veriyi çeker)
      router.push(`?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(handler);
  }, [filters, router]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-4 shadow-[0_24px_90px_-45px_rgba(37,99,235,0.7)] backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-end gap-3" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <label htmlFor="brand-filter" className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">{getMessage(language, "brand")}</label>
          <select
            id="brand-filter"
            value={filters.brand}
            onChange={(e) => setFilters({...filters, brand: e.target.value})}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">{getMessage(language, "allBrands")}</option>
            {initialBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <label htmlFor="segment-filter" className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">{getMessage(language, "segment")}</label>
          <select
            id="segment-filter"
            value={filters.segment}
            onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">{getMessage(language, "allSegments")}</option>
            {initialSegments.map((segment) => (
              <option key={segment} value={segment}>{getSegmentTranslation(language, segment, segmentLabels[segment] || segment)}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <label htmlFor="body-style-filter" className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">{getMessage(language, "bodyStyle")}</label>
          <select
            id="body-style-filter"
            value={filters.bodyStyle}
            onChange={(e) => setFilters({ ...filters, bodyStyle: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">{getMessage(language, "allBodyStyles")}</option>
            {initialBodyStyles.map((bodyStyle) => (
              <option key={bodyStyle} value={bodyStyle}>{getBodyStyleTranslation(language, bodyStyle, bodyStyleLabels[bodyStyle] || bodyStyle)}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            <span>{getMessage(language, "rangeFilter")}</span>
            <span className="text-blue-600">{filters.range} km</span>
          </div>
          <input
            type="range"
            min="100"
            max="1000"
            value={filters.range}
            onChange={(e) => setFilters({...filters, range: e.target.value})}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            <span>{getMessage(language, "accelerationFilter")}</span>
            <span className="text-blue-600">{filters.accel} {getMessage(language, "seconds")}</span>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            step="0.1"
            value={filters.accel}
            onChange={(e) => setFilters({...filters, accel: e.target.value})}
            className="w-full accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}