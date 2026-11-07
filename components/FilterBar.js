"use client";
import { useEffect, useRef, useState } from "react";
import { bodyStyleLabels, segmentLabels } from "@/lib/vehicleFilters";
import { useLanguage } from "./LanguageProvider";
import { useFilters } from "./FilterProvider";
import { getMessage, getSegmentTranslation, getBodyStyleTranslation } from "@/lib/i18n";

export default function FilterBar({
  initialBrands = [],
  initialSegments = [],
  initialBodyStyles = [],
}) {
  const { language } = useLanguage();
  const { filters, updateFilters } = useFilters();
  const [isBrandListOpen, setIsBrandListOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const brandFilterRef = useRef(null);
  const brandTriggerRef = useRef(null);
  const brandSearchRef = useRef(null);
  const brandListRef = useRef(null);
  const filteredBrands = initialBrands.filter((brand) =>
    brand.toLocaleLowerCase(language).includes(brandSearch.trim().toLocaleLowerCase(language))
  );
  const selectedBrand = initialBrands.find((brand) => brand === filters.brand);

  useEffect(() => {
    if (!isBrandListOpen) return undefined;

    brandSearchRef.current?.focus();
    const closeOnOutsideClick = (event) => {
      if (!brandFilterRef.current?.contains(event.target)) {
        setIsBrandListOpen(false);
        setBrandSearch("");
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isBrandListOpen]);

  const closeBrandList = (restoreFocus = false) => {
    setIsBrandListOpen(false);
    setBrandSearch("");
    if (restoreFocus) brandTriggerRef.current?.focus();
  };

  const selectBrand = (brand) => {
    updateFilters((current) => ({ ...current, brand }));
    closeBrandList(true);
  };

  const focusBrandOption = (currentOption, direction) => {
    const options = brandListRef.current?.querySelectorAll('[role="option"]');
    if (!options?.length) return;

    const currentIndex = Array.from(options).indexOf(currentOption);
    const nextIndex = currentIndex < 0
      ? (direction > 0 ? 0 : options.length - 1)
      : (currentIndex + direction + options.length) % options.length;
    options[nextIndex].focus();
  };

  return (
    <div className={`relative rounded-[2rem] border border-slate-200 bg-white/85 p-4 shadow-[0_24px_90px_-45px_rgba(37,99,235,0.7)] backdrop-blur-sm sm:p-6 ${
      isBrandListOpen ? "z-40" : ""
    }`}>
      <div className="mb-4 flex items-center justify-end gap-3" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <label htmlFor="brand-filter" className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">{getMessage(language, "brand")}</label>
          <div className="relative" ref={brandFilterRef}>
            <button
              ref={brandTriggerRef}
              id="brand-filter"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isBrandListOpen}
              aria-controls="brand-filter-options"
              onClick={() => setIsBrandListOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <span>{selectedBrand || getMessage(language, "allBrands")}</span>
              <span aria-hidden="true" className="text-slate-400">{isBrandListOpen ? "▲" : "▼"}</span>
            </button>
            {isBrandListOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <input
                  ref={brandSearchRef}
                  type="search"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      closeBrandList(true);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      focusBrandOption(null, 1);
                    }
                  }}
                  placeholder={getMessage(language, "searchBrands")}
                  aria-label={getMessage(language, "searchBrands")}
                  aria-controls="brand-filter-options"
                  className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div
                  id="brand-filter-options"
                  ref={brandListRef}
                  role="listbox"
                  aria-label={getMessage(language, "brand")}
                  className="max-h-56 overflow-y-auto"
                >
                  <div
                    role="option"
                    aria-selected={!filters.brand}
                    tabIndex={0}
                    onClick={() => selectBrand("")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectBrand("");
                      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        focusBrandOption(event.currentTarget, event.key === "ArrowDown" ? 1 : -1);
                      } else if (event.key === "Escape") {
                        closeBrandList(true);
                      }
                    }}
                    className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-blue-50 focus:bg-blue-50 ${
                      !filters.brand ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    {getMessage(language, "allBrands")}
                  </div>
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand}
                      role="option"
                      aria-selected={filters.brand === brand}
                      tabIndex={0}
                      onClick={() => selectBrand(brand)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectBrand(brand);
                        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                          event.preventDefault();
                          focusBrandOption(event.currentTarget, event.key === "ArrowDown" ? 1 : -1);
                        } else if (event.key === "Escape") {
                          closeBrandList(true);
                        }
                      }}
                      className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-blue-50 focus:bg-blue-50 ${
                        filters.brand === brand ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {brand}
                    </div>
                  ))}
                  {filteredBrands.length === 0 && (
                    <p className="px-3 py-2.5 text-sm text-slate-500">
                      {getMessage(language, "noBrandsFound")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
          <label htmlFor="segment-filter" className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">{getMessage(language, "segment")}</label>
          <select
            id="segment-filter"
            value={filters.segment}
            onChange={(e) => updateFilters((current) => ({ ...current, segment: e.target.value }))}
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
            onChange={(e) => updateFilters((current) => ({ ...current, bodyStyle: e.target.value }))}
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
            onChange={(e) => updateFilters((current) => ({...current, range: e.target.value}))}
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
            onChange={(e) => updateFilters((current) => ({...current, accel: e.target.value}))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}