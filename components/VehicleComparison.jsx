"use client";

import Image from "next/image";
import Link from "next/link";
import { vehicleSpecifications } from "@/lib/vehicleSpecifications";
import { getMessage, getSpecificationLabel, getVehicleValue } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function VehicleComparison({ selectedCars, onEditSelection }) {
  const { language } = useLanguage();

  const getDisplayModel = (car) => {
    const brandPrefix = `${car.brand} `;
    return car.model.startsWith(brandPrefix)
      ? car.model.slice(brandPrefix.length)
      : car.model;
  };

  const getNumericValue = (value) => {
    const match = String(value ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0].replace(",", ".")) : null;
  };

  const getBestValue = (specification) => {
    if (specification.direction === "neutral") return null;

    const values = selectedCars
      .map((car) => getNumericValue(car[specification.key]))
      .filter((value) => value !== null);

    if (values.length === 0) return null;
    return specification.direction === "min" ? Math.min(...values) : Math.max(...values);
  };

  const highlights = [
    {
      label: getMessage(language, "longestRange"),
      specification: vehicleSpecifications.find(({ key }) => key === "range"),
    },
    {
      label: getMessage(language, "fastestAcceleration"),
      specification: vehicleSpecifications.find(({ key }) => key === "accel"),
    },
    {
      label: getMessage(language, "largestCargo"),
      specification: vehicleSpecifications.find(({ key }) => key === "cargo"),
    },
  ].flatMap(({ label, specification }) => {
    const bestValue = getBestValue(specification);
    const winner = selectedCars.find(
      (car) => getNumericValue(car[specification.key]) === bestValue
    );

    return winner
      ? [{ label, winner, value: getVehicleValue(language, winner, specification.key) }]
      : [];
  });

  const editSelection = onEditSelection ? (
    <button
      type="button"
      onClick={onEditSelection}
      className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
    >
      {getMessage(language, "editSelection")}
    </button>
  ) : (
    <Link
      href="/"
      className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
    >
      {getMessage(language, "editSelection")}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-20 text-slate-900">
      <header className="hero-section px-4 pb-5 pt-4 sm:px-6 lg:px-8">
        <div className="hero-panel mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-5 rounded-[26px] bg-[#edf2f7] px-6 py-8 sm:flex-row sm:items-center sm:px-10 md:min-h-[230px] md:px-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{getMessage(language, "compare")}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#102447] sm:text-5xl">{getMessage(language, "comparison")}</h1>
            <p className="mt-3 text-sm text-slate-600">{getMessage(language, "vehiclesCompared").replace("{count}", selectedCars.length)}</p>
          </div>
          {editSelection}
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {highlights.length > 0 && (
          <section aria-label={getMessage(language, "comparisonHighlights")} className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {highlights.map(({ label, winner, value }) => (
              <article key={label} className="rounded-[18px] border border-lime-100 bg-gradient-to-br from-white to-lime-50/70 p-5 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.35)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-700">{label}</p>
                <p className="mt-3 text-lg font-extrabold text-[#142746]">{winner.brand} {getDisplayModel(winner)}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{value}</p>
              </article>
            ))}
          </section>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedCars.map((car) => (
            <article key={car.id} className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.4)]">
              <div className="relative mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-[#e6eef4] p-4">
                <Image src={car.image} alt={car.model} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black tracking-[0.18em] text-lime-700 uppercase">{car.brand}</p>
                <h2 className="mt-2 text-xl font-extrabold text-[#142746]">{getDisplayModel(car)}</h2>
              </div>
            </article>
          ))}
        </div>

        <div className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.4)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafb]">
                  <th className="min-w-[180px] border-b border-slate-200 p-4 text-left text-sm font-black text-slate-600">
                    {getMessage(language, "comparisonFeature")}
                  </th>
                  {selectedCars.map((car) => (
                    <th key={`${car.id}-head`} className="min-w-[220px] border-b border-slate-200 p-4 text-center text-sm font-black text-slate-600">
                      {car.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicleSpecifications.map((specification) => {
                  const bestValue = getBestValue(specification);
                  const numericValues = selectedCars
                    .map((car) => getNumericValue(car[specification.key]))
                    .filter((value) => value !== null);
                  const hasTiedBestValue = numericValues.filter((value) => value === bestValue).length > 1;
                  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 0;
                  const minValue = numericValues.length > 0 ? Math.min(...numericValues) : 0;

                  return (
                    <tr key={specification.key} className="transition hover:bg-lime-50/30">
                      <td className="border-b border-slate-200 p-4 font-bold text-slate-600">{getSpecificationLabel(language, specification.key)}</td>
                      {selectedCars.map((car) => {
                        const rawValue = getVehicleValue(language, car, specification.key);
                        const numericValue = getNumericValue(car[specification.key]);
                        const isBest = numericValue !== null && numericValue === bestValue;
                        const isSimilar = isBest && hasTiedBestValue;
                        const barWidth = numericValue === null
                          ? 0
                          : specification.direction === "min"
                            ? (minValue / numericValue) * 100
                            : maxValue > 0
                              ? (numericValue / maxValue) * 100
                              : 0;

                        return (
                          <td
                            key={`${car.id}-${specification.key}`}
                            className={`border-b border-slate-200 p-4 text-center ${isBest ? "bg-lime-50/80" : ""}`}
                          >
                            <div className={`text-lg font-black ${isBest ? "text-lime-800" : "text-slate-800"}`}>
                              {rawValue || "—"}
                            </div>
                            {numericValue !== null && (
                              <div
                                className="mx-auto mt-2 h-1.5 max-w-32 overflow-hidden rounded-full bg-slate-100"
                                role="meter"
                                aria-label={`${getSpecificationLabel(language, specification.key)} ${getMessage(language, "relativeComparison")}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(barWidth)}
                              >
                                <div
                                  className={`h-full rounded-full ${isBest ? "bg-lime-500" : "bg-slate-300"}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            )}
                            {isBest && (
                              <span className={`mt-1 block text-[10px] font-black uppercase tracking-wider ${isSimilar ? "text-amber-700" : "text-lime-700"}`}>
                                {getMessage(language, isSimilar ? "similar" : "best")}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
