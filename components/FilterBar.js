"use client";
import { useEffect, useRef, useState } from "react";
import { bodyStyleLabels, segmentLabels } from "@/lib/vehicleFilters";
import { useLanguage } from "./LanguageProvider";
import { useFilters } from "./FilterProvider";
import { getMessage, getSegmentTranslation, getBodyStyleTranslation } from "@/lib/i18n";

function FilterSlider({ id, label, value, min, max, step = 1, formatValue, onChange }) {
  const [draftValue, setDraftValue] = useState(String(value));

  const commitValue = (nextValue) => {
    const numericValue = Number(nextValue);
    setDraftValue(String(numericValue));
    if (numericValue !== Number(value)) onChange(numericValue);
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        <label htmlFor={id}>{label}</label>
        <span className="text-blue-600">{formatValue(draftValue)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onPointerUp={(event) => commitValue(event.currentTarget.value)}
        onKeyUp={(event) => commitValue(event.currentTarget.value)}
        onBlur={(event) => commitValue(event.currentTarget.value)}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

function SearchableFilter({
  id,
  label,
  allLabel,
  searchPlaceholder,
  emptyMessage,
  options,
  value,
  onChange,
  language,
  isOpen,
  setOpenFilter,
}) {
  const [search, setSearch] = useState("");
  const filterRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const filteredOptions = options.filter((option) =>
    option.label.toLocaleLowerCase(language).includes(search.trim().toLocaleLowerCase(language))
  );
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    searchRef.current?.focus();
    const closeOnOutsideClick = (event) => {
      if (!filterRef.current?.contains(event.target)) {
        setOpenFilter(null);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen, setOpenFilter]);

  const closeList = (restoreFocus = false) => {
    setOpenFilter(null);
    setSearch("");
    if (restoreFocus) triggerRef.current?.focus();
  };

  const selectOption = (optionValue) => {
    onChange(optionValue);
    closeList(true);
  };

  const focusOption = (currentOption, direction) => {
    const optionElements = listRef.current?.querySelectorAll('[role="option"]');
    if (!optionElements?.length) return;

    const currentIndex = Array.from(optionElements).indexOf(currentOption);
    const nextIndex = currentIndex < 0
      ? (direction > 0 ? 0 : optionElements.length - 1)
      : (currentIndex + direction + optionElements.length) % optionElements.length;
    optionElements[nextIndex].focus();
  };

  const handleOptionKeyDown = (event, optionValue) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(optionValue);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(event.currentTarget, event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Escape") {
      closeList(true);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
      <label htmlFor={id} className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</label>
      <div className="relative" ref={filterRef}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-options`}
          onClick={() => {
            setSearch("");
            setOpenFilter(isOpen ? null : id);
          }}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <span>{selectedOption?.label || allLabel}</span>
          <span aria-hidden="true" className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
        </button>
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeList(true);
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusOption(null, 1);
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={`${id}-options`}
              className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div
              id={`${id}-options`}
              ref={listRef}
              role="listbox"
              aria-label={label}
              className="max-h-56 overflow-y-auto"
            >
              <div
                role="option"
                aria-selected={!value}
                tabIndex={0}
                onClick={() => selectOption("")}
                onKeyDown={(event) => handleOptionKeyDown(event, "")}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-blue-50 focus:bg-blue-50 ${
                  !value ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {allLabel}
              </div>
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  tabIndex={0}
                  onClick={() => selectOption(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, option.value)}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-blue-50 focus:bg-blue-50 ${
                    value === option.value ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  {option.label}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2.5 text-sm text-slate-500">{emptyMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FilterBar({
  initialBrands = [],
  initialSegments = [],
  initialBodyStyles = [],
}) {
  const { language } = useLanguage();
  const { filters, updateFilters } = useFilters();
  const [openFilter, setOpenFilter] = useState(null);
  const brandOptions = initialBrands.map((brand) => ({ value: brand, label: brand }));
  const segmentOptions = initialSegments.map((segment) => ({
    value: segment,
    label: getSegmentTranslation(language, segment, segmentLabels[segment] || segment),
  }));
  const bodyStyleOptions = initialBodyStyles.map((bodyStyle) => ({
    value: bodyStyle,
    label: getBodyStyleTranslation(language, bodyStyle, bodyStyleLabels[bodyStyle] || bodyStyle),
  }));

  return (
    <div className={`relative rounded-[2rem] border border-slate-200 bg-white/85 p-4 shadow-[0_24px_90px_-45px_rgba(37,99,235,0.7)] backdrop-blur-sm sm:p-6 ${
      openFilter ? "z-40" : ""
    }`}>
      <div className="mb-4 flex items-center justify-end gap-3" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <SearchableFilter
          id="brand-filter"
          label={getMessage(language, "brand")}
          allLabel={getMessage(language, "allBrands")}
          searchPlaceholder={getMessage(language, "searchBrands")}
          emptyMessage={getMessage(language, "noBrandsFound")}
          options={brandOptions}
          value={filters.brand}
          onChange={(brand) => updateFilters((current) => ({ ...current, brand }))}
          language={language}
          isOpen={openFilter === "brand-filter"}
          setOpenFilter={setOpenFilter}
        />
        <SearchableFilter
          id="segment-filter"
          label={getMessage(language, "segment")}
          allLabel={getMessage(language, "allSegments")}
          searchPlaceholder={getMessage(language, "searchSegments")}
          emptyMessage={getMessage(language, "noSegmentsFound")}
          options={segmentOptions}
          value={filters.segment}
          onChange={(segment) => updateFilters((current) => ({ ...current, segment }))}
          language={language}
          isOpen={openFilter === "segment-filter"}
          setOpenFilter={setOpenFilter}
        />
        <SearchableFilter
          id="body-style-filter"
          label={getMessage(language, "bodyStyle")}
          allLabel={getMessage(language, "allBodyStyles")}
          searchPlaceholder={getMessage(language, "searchBodyStyles")}
          emptyMessage={getMessage(language, "noBodyStylesFound")}
          options={bodyStyleOptions}
          value={filters.bodyStyle}
          onChange={(bodyStyle) => updateFilters((current) => ({ ...current, bodyStyle }))}
          language={language}
          isOpen={openFilter === "body-style-filter"}
          setOpenFilter={setOpenFilter}
        />

        <FilterSlider
          id="range-filter"
          label={getMessage(language, "rangeFilter")}
          value={filters.range}
          min={100}
          max={1000}
          formatValue={(value) => `${value} km`}
          onChange={(range) => updateFilters((current) => ({ ...current, range }))}
        />
        <FilterSlider
          id="acceleration-filter"
          label={getMessage(language, "accelerationFilter")}
          value={filters.accel}
          min={2}
          max={15}
          step={0.1}
          formatValue={(value) => `${value} ${getMessage(language, "seconds")}`}
          onChange={(accel) => updateFilters((current) => ({ ...current, accel }))}
        />
      </div>
    </div>
  );
}