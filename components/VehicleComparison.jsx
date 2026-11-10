"use client";

import Image from "next/image";
import Link from "next/link";
import { vehicleSpecifications } from "@/lib/vehicleSpecifications";
import { getMessage, getSpecificationLabel, getVehicleValue } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function VehicleComparison({ selectedCars, onEditSelection }) {
  const { language } = useLanguage();

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
      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-blue-400 hover:text-white"
    >
      {getMessage(language, "editSelection")}
    </button>
  ) : (
    <Link
      href="/"
      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-blue-400 hover:text-white"
    >
      {getMessage(language, "editSelection")}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-20 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <p className="text-xs font-black tracking-[0.28em] text-blue-300 uppercase">{getMessage(language, "compare")}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{getMessage(language, "comparison")}</h1>
          </div>
          {editSelection}
        </div>
      </header>

      <main className="container mx-auto mt-10 px-4">
        {highlights.length > 0 && (
          <section aria-label={getMessage(language, "comparisonHighlights")} className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {highlights.map(({ label, winner, value }) => (
              <article key={label} className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{label}</p>
                <p className="mt-3 text-lg font-black text-slate-900">{winner.brand} {winner.model}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{value}</p>
              </article>
            ))}
          </section>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedCars.map((car) => (
            <article key={car.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-50px_rgba(37,99,235,0.8)]">
              <div className="relative mb-4 flex h-36 items-center justify-center rounded-2xl bg-slate-50 p-4">
                <Image src={car.image} alt={car.model} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black tracking-[0.22em] text-blue-600 uppercase">{car.brand}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{car.model}</h2>
              </div>
            </article>
          ))}
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="min-w-[180px] border-b border-slate-200 p-4 text-left text-sm font-black tracking-[0.2em] text-slate-600 uppercase">
                    {getMessage(language, "comparisonFeature")}
                  </th>
                  {selectedCars.map((car) => (
                    <th key={`${car.id}-head`} className="min-w-[220px] border-b border-slate-200 p-4 text-center text-sm font-black tracking-[0.2em] text-slate-600 uppercase">
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
                    <tr key={specification.key} className="transition hover:bg-slate-50">
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
                            className={`border-b border-slate-200 p-4 text-center ${isBest ? "bg-blue-50/70" : ""}`}
                          >
                            <div className={`text-lg font-black ${isBest ? "text-blue-700" : "text-slate-800"}`}>
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
                                  className={`h-full rounded-full ${isBest ? "bg-blue-600" : "bg-slate-300"}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            )}
                            {isBest && (
                              <span className={`mt-1 block text-[10px] font-black uppercase tracking-wider ${isSimilar ? "text-amber-700" : "text-blue-600"}`}>
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
