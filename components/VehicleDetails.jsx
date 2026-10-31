"use client";

import Image from "next/image";
import { useState } from "react";
import { getMessage, getSpecificationLabel, getVehicleValue } from "@/lib/i18n";
import { vehicleSpecifications } from "@/lib/vehicleSpecifications";
import { vehicleSpecificationIcons } from "@/lib/vehicleSpecificationIcons";
import { useLanguage } from "./LanguageProvider";

export default function VehicleDetails({ car, images, sourceAvailable, onClose }) {
  const { language } = useLanguage();
  const gallery = images.length > 0 ? images : car.image ? [car.image] : [];
  const [activePhoto, setActivePhoto] = useState(0);
  const statistics = [
    { key: "battery", label: "usableBattery", value: car.battery, Icon: vehicleSpecificationIcons.battery },
    { key: "range", label: "realRange", value: car.range, Icon: vehicleSpecificationIcons.range },
    { key: "efficiency", label: "specEfficiency", value: car.efficiency, Icon: vehicleSpecificationIcons.efficiency },
  ];
  const specifications = vehicleSpecifications.filter(
    ({ key }) => !["battery", "range", "efficiency"].includes(key)
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <span aria-hidden="true">←</span>
          {getMessage(language, "backToVehicles")}
        </button>

        <section className="mt-6 grid min-w-0 grid-cols-1 gap-8 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.65)] sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:p-8">
          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-100 via-white to-blue-50">
              {gallery.length > 0 ? (
                <Image
                  key={gallery[activePhoto]}
                  src={gallery[activePhoto]}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain p-4"
                />
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
                    className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border bg-slate-50 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      activePhoto === index ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-600">
              {car.brand}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {car.model}
            </h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {getMessage(language, "vehicleDetail")}
            </p>

            <div className="mt-8 grid gap-3">
              {statistics.map(({ key, label, value, Icon }) => (
                <div
                  key={key}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
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
            </div>

            {!sourceAvailable && (
              <p role="status" className="mt-4 text-sm leading-6 text-amber-700">
                {getMessage(language, "vehicleSourceUnavailable")}
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-blue-600" />
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
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
