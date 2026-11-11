"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getMessage, getSpecificationLabel, getVehicleDetailRowLabel, getVehicleValue } from "@/lib/i18n";
import { vehicleSpecifications } from "@/lib/vehicleSpecifications";
import { vehicleSpecificationIcons } from "@/lib/vehicleSpecificationIcons";
import { useLanguage } from "./LanguageProvider";

export default function VehicleDetails({
  car,
  images,
  sourceAvailable,
  isPhotoExpanded,
  onPhotoExpandedChange,
  onClose,
}) {
  const { language } = useLanguage();
  const gallery = images.length > 0 ? images : car.image ? [car.image] : [];
  const brandPrefix = `${car.brand} `;
  const modelName = car.model.toLocaleLowerCase(language).startsWith(brandPrefix.toLocaleLowerCase(language))
    ? car.model.slice(brandPrefix.length)
    : car.model;
  const [activePhoto, setActivePhoto] = useState(0);
  const fullscreenTouchStartX = useRef(null);
  const photoButtonRef = useRef(null);
  const fullscreenCloseButtonRef = useRef(null);
  const wasPhotoExpandedRef = useRef(false);
  const statistics = [
    { key: "battery", label: "usableBattery", value: car.battery, Icon: vehicleSpecificationIcons.battery },
    { key: "range", label: "realRange", value: car.range, Icon: vehicleSpecificationIcons.range },
    { key: "efficiency", label: "specEfficiency", value: car.efficiency, Icon: vehicleSpecificationIcons.efficiency },
  ];
  const specifications = vehicleSpecifications.filter(
    ({ key }) => !["battery", "range", "efficiency"].includes(key)
  );
  const changePhoto = useCallback((direction) => {
    setActivePhoto((current) => (current + direction + gallery.length) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (isPhotoExpanded) {
      fullscreenCloseButtonRef.current?.focus();
      const handlePhotoNavigation = (event) => {
        if (event.detail === -1 || event.detail === 1) changePhoto(event.detail);
      };
      window.addEventListener("vehicle-photo-navigation", handlePhotoNavigation);
      return () => window.removeEventListener("vehicle-photo-navigation", handlePhotoNavigation);
    } else if (wasPhotoExpandedRef.current) {
      photoButtonRef.current?.focus();
    }

    wasPhotoExpandedRef.current = isPhotoExpanded;
    return undefined;
  }, [changePhoto, isPhotoExpanded]);

  return (
    <main className="min-h-screen bg-[#f5f7fa] pb-20 text-slate-900">
      <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[26px] bg-[#edf2f7] px-6 py-7 pr-16 sm:px-10 sm:py-9 sm:pr-20">
          <button
            type="button"
            onClick={onClose}
            className="mb-6 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-lime-500 hover:bg-lime-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
          >
            <span aria-hidden="true">←</span>
            {getMessage(language, "backToVehicles")}
          </button>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{car.brand}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#102447] sm:text-5xl">
            {modelName}
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-600">{getMessage(language, "vehicleDetail")}</p>
        </section>

        <section className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-[#e6eef4]">
              {gallery.length > 0 ? (
                <button
                  type="button"
                  ref={photoButtonRef}
                  onClick={() => onPhotoExpandedChange(true)}
                  aria-label={getMessage(language, "viewPhotoFullscreen")}
                  className="absolute inset-0 block h-full w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-lime-600"
                >
                <Image
                  key={gallery[activePhoto]}
                  src={gallery[activePhoto]}
                  alt={`${car.brand} ${modelName}`}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain p-4"
                />
                </button>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                  {getMessage(language, "unknown")}
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div
                className="mt-4 flex gap-3 overflow-x-auto pb-2"
                aria-label={getMessage(language, "vehiclePhotos")}
              >
                {gallery.slice(0, 12).map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() => setActivePhoto(index)}
                    aria-label={`${getMessage(language, "photo")} ${index + 1}`}
                    aria-pressed={activePhoto === index}
                      className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 ${
                      activePhoto === index ? "border-lime-500 ring-2 ring-lime-100" : "border-slate-200 hover:border-lime-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="112px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid min-w-0 content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {statistics.map(({ key, label, value, Icon }) => (
              <div
                key={key}
                className="flex items-center gap-4 rounded-[18px] border border-lime-100 bg-gradient-to-br from-white to-lime-50/70 p-4 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.35)]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-800">
                  <Icon aria-hidden="true" size={24} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {getMessage(language, label)}
                  </p>
                  <p className="mt-1 break-words text-xl font-black text-slate-900">
                    {value || getMessage(language, "unknown")}
                  </p>
                </div>
              </div>
            ))}
            {!sourceAvailable && (
              <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 sm:col-span-2 lg:col-span-1">
                {getMessage(language, "vehicleSourceUnavailable")}
              </p>
            )}
          </div>
        </section>

        {(car.realRangeEstimation || car.longDistanceSuitability) && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {car.realRangeEstimation?.values?.length > 0 && (
              <article className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-slate-900">
                    {getMessage(language, "realRangeEstimation")}
                  </h2>
                  <p className="mt-2 text-sm font-bold text-lime-800">
                    {new Intl.NumberFormat(language).format(car.realRangeEstimation.min)}
                    {"–"}
                    {new Intl.NumberFormat(language).format(car.realRangeEstimation.max)}
                    {" "}
                    {car.realRangeEstimation.unit}
                  </p>
                </div>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {car.realRangeEstimation.values.map(({ label, value }, index) => (
                    <div key={`${label}-${index}`} className="rounded-xl bg-[#f5f7fa] p-3">
                      <dt className="text-xs font-semibold text-slate-500">
                        {getVehicleDetailRowLabel(language, label, value)}
                      </dt>
                      <dd className="mt-1 text-base font-black text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )}

            {car.longDistanceSuitability?.values?.length > 0 && (
              <article className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5">
                  <h2 className="text-xl font-black text-slate-900">
                    {getMessage(language, "longDistanceSuitability")}
                  </h2>
                </div>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {car.longDistanceSuitability.values.map(({ label, value }, index) => (
                    <div key={`${label}-${index}`} className="rounded-xl bg-[#f5f7fa] p-3">
                      <dt className="text-xs font-semibold text-slate-500">
                        {getVehicleDetailRowLabel(language, label, value)}
                      </dt>
                      <dd className="mt-1 text-base font-black text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            )}
          </section>
        )}

        {isPhotoExpanded && gallery[activePhoto] && (
          <div
            data-photo-lightbox
            role="dialog"
            aria-modal="true"
            aria-label={`${getMessage(language, "photo")} ${activePhoto + 1}`}
            className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/95 p-4 sm:p-8"
            onClick={(event) => {
              if (event.target === event.currentTarget) onPhotoExpandedChange(false);
            }}
            onTouchStart={(event) => {
              fullscreenTouchStartX.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (fullscreenTouchStartX.current === null) return;
              const distance = event.changedTouches[0].clientX - fullscreenTouchStartX.current;
              fullscreenTouchStartX.current = null;
              if (Math.abs(distance) > 50) changePhoto(distance < 0 ? 1 : -1);
            }}
          >
            <button
              type="button"
              ref={fullscreenCloseButtonRef}
              onClick={() => onPhotoExpandedChange(false)}
              aria-label={getMessage(language, "close")}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
            >
              <X aria-hidden="true" size={26} />
            </button>
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => changePhoto(-1)}
                  aria-label={getMessage(language, "previousPhoto")}
                  className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6 sm:h-14 sm:w-14"
                >
                  <ChevronLeft aria-hidden="true" size={30} />
                </button>
                <button
                  type="button"
                  onClick={() => changePhoto(1)}
                  aria-label={getMessage(language, "nextPhoto")}
                  className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:h-14 sm:w-14"
                >
                  <ChevronRight aria-hidden="true" size={30} />
                </button>
                <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white">
                  {activePhoto + 1} / {gallery.length}
                </p>
              </>
            )}
            <div className="relative h-full w-full">
              <Image
                key={`fullscreen-${gallery[activePhoto]}`}
                src={gallery[activePhoto]}
                alt={`${car.brand} ${modelName} — ${getMessage(language, "photo")} ${activePhoto + 1}`}
                fill
                loading="eager"
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        )}

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-lime-500" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {getMessage(language, "vehicleSpecifications")}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specifications.map(({ key }) => {
              const Icon = vehicleSpecificationIcons[key];
              return (
                <article
                  key={key}
                  className="flex items-center gap-4 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-700">
                    <Icon aria-hidden="true" size={21} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500">
                      {getSpecificationLabel(language, key)}
                    </p>
                    <p className="mt-1 break-words font-extrabold text-slate-900">
                      {getVehicleValue(language, car, key) || getMessage(language, "unknown")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
