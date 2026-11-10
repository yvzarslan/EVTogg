"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

const initialInputs = {
  annualDistance: "15000",
  evConsumption: "18",
  homeChargingShare: "10",
  homeElectricityRate: "",
  publicElectricityRate: "",
  petrolConsumption: "7",
  petrolRate: "",
};

function parsePositiveNumber(value) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatCurrency(value, language, currency) {
  return new Intl.NumberFormat(language === "tr" ? "tr-TR" : language, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CostGuide() {
  const { language } = useLanguage();
  const [inputs, setInputs] = useState(initialInputs);
  const [currency, setCurrency] = useState("USD");
  const [priceData, setPriceData] = useState(null);
  const [rateStatus, setRateStatus] = useState("loading");
  const [rateRetry, setRateRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRateStatus("loading");

    async function loadCountryPrices() {
      try {
        const response = await fetch("/api/cost-prices", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Country price request failed with status ${response.status}`);
        }

        const data = await response.json();
        const rates = {
          homeElectricityRate: Number(data.rates?.homeElectricityRate),
          publicElectricityRate: Number(data.rates?.publicElectricityRate),
          petrolRate: Number(data.rates?.petrolRate),
        };
        if (
          !data.currency ||
          Object.values(rates).some((rate) => !Number.isFinite(rate) || rate <= 0)
        ) {
          throw new Error("The localized price estimate response is invalid.");
        }

        setInputs((current) => ({
          ...current,
          ...Object.fromEntries(Object.entries(rates).map(([name, rate]) => [
            name,
            current[name] === "" ? String(Number(rate.toFixed(6))) : current[name],
          ])),
        }));
        setCurrency(data.currency);
        setPriceData(data);
        setRateStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Could not load country-specific price estimates.", error);
        setRateStatus("error");
      }
    }

    loadCountryPrices();
    return () => controller.abort();
  }, [rateRetry]);

  const results = useMemo(() => {
    const annualDistance = parsePositiveNumber(inputs.annualDistance);
    const evConsumption = parsePositiveNumber(inputs.evConsumption);
    const homeShare = inputs.homeChargingShare.trim() === ""
      ? Number.NaN
      : Number(inputs.homeChargingShare);
    const petrolConsumption = parsePositiveNumber(inputs.petrolConsumption);
    const homeRate = inputs.homeElectricityRate.trim() === ""
      ? null
      : Number(inputs.homeElectricityRate);
    const publicRate = inputs.publicElectricityRate.trim() === ""
      ? null
      : Number(inputs.publicElectricityRate);
    const petrolRate = parsePositiveNumber(inputs.petrolRate);

    const validHomeShare = Number.isFinite(homeShare) && homeShare >= 0 && homeShare <= 100;
    const hasHomeRate = homeShare === 0 || (homeRate !== null && homeRate > 0);
    const hasPublicRate = homeShare === 100 || (publicRate !== null && publicRate > 0);
    const evAnnualCost = annualDistance && evConsumption && validHomeShare && hasHomeRate && hasPublicRate
      ? annualDistance * evConsumption / 100 * (
        homeShare / 100 * (homeRate || 0) +
        (100 - homeShare) / 100 * (publicRate || 0)
      )
      : null;
    const petrolAnnualCost = annualDistance && petrolConsumption && petrolRate
      ? annualDistance * petrolConsumption / 100 * petrolRate
      : null;
    const annualSavings = evAnnualCost !== null && petrolAnnualCost !== null
      ? petrolAnnualCost - evAnnualCost
      : null;
    return { evAnnualCost, petrolAnnualCost, annualSavings };
  }, [inputs]);

  const updateInput = (event) => {
    const { name, value } = event.target;
    setInputs((current) => ({ ...current, [name]: value }));
  };

  const updateGroupedInput = (event) => {
    const { name, value } = event.target;
    const parts = new Intl.NumberFormat(language).formatToParts(12345.6);
    const groupSeparator = parts.find((part) => part.type === "group")?.value;
    const decimalSeparator = parts.find((part) => part.type === "decimal")?.value;
    let normalized = groupSeparator ? value.split(groupSeparator).join("") : value;
    if (decimalSeparator && decimalSeparator !== ".") {
      normalized = normalized.replace(decimalSeparator, ".");
    }
    normalized = normalized.replace(/[^\d.]/g, "");
    if (name === "annualDistance") {
      normalized = normalized.replace(/\D/g, "");
    } else {
      const decimalIndex = normalized.indexOf(".");
      if (decimalIndex !== -1) {
        normalized = `${normalized.slice(0, decimalIndex + 1)}${normalized.slice(decimalIndex + 1).replace(/\./g, "")}`;
      }
    }
    setInputs((current) => ({ ...current, [name]: normalized }));
  };

  const fieldClassName = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const renderField = (name, label, unit, step = "1") => {
    const usesThousandsSeparator = name === "annualDistance";
    const value = usesThousandsSeparator && inputs[name] !== ""
      ? new Intl.NumberFormat(language, { maximumFractionDigits: name === "annualDistance" ? 0 : 2 }).format(Number(inputs[name]))
      : inputs[name];
    const currencyUnit = name === "homeElectricityRate" || name === "publicElectricityRate"
      ? `${currency}/kWh`
      : name === "petrolRate"
        ? `${currency}/L`
        : unit;

    return (
      <label key={name} className="block text-sm font-bold text-slate-700">
        {label}
        <span className="relative block">
          <input
            className={`${fieldClassName} ${unit ? "pr-14" : ""}`}
            type={usesThousandsSeparator ? "text" : "number"}
            inputMode={usesThousandsSeparator ? "numeric" : "decimal"}
            min={!usesThousandsSeparator && name === "homeChargingShare" ? "0" : !usesThousandsSeparator ? "0.01" : undefined}
            max={!usesThousandsSeparator && name === "homeChargingShare" ? "100" : undefined}
            step={!usesThousandsSeparator ? name === "homeChargingShare" ? "1" : step : undefined}
            name={name}
            value={value}
            onChange={usesThousandsSeparator ? updateGroupedInput : updateInput}
            aria-label={label}
          />
          {currencyUnit && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400">{currencyUnit}</span>}
        </span>
      </label>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <section className="bg-slate-950 px-4 py-14 text-white sm:py-20">
        <div className="container mx-auto max-w-5xl">
          <Link href="/" className="text-sm font-bold text-blue-300 transition hover:text-white">
            ← {getMessage(language, "home")}
          </Link>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{getMessage(language, "costGuideEyebrow")}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">{getMessage(language, "costGuideTitle")}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{getMessage(language, "costGuideIntro")}</p>
        </div>
      </section>

      <div className="container mx-auto mt-8 grid max-w-6xl gap-6 px-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900">{getMessage(language, "costCalculatorTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{getMessage(language, "costCalculatorIntro")}</p>

          <div className="mt-7 space-y-8">
            <fieldset>
              <legend className="mb-4 text-sm font-black uppercase tracking-wider text-blue-700">{getMessage(language, "costUsageTitle")}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("annualDistance", getMessage(language, "costAnnualDistance"), "km")}
                {renderField("evConsumption", getMessage(language, "costEvConsumption"), "kWh/100 km", "0.1")}
                {renderField("homeChargingShare", getMessage(language, "costHomeShare"), "%")}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-sm font-black uppercase tracking-wider text-blue-700">{getMessage(language, "costElectricityTitle")}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("homeElectricityRate", getMessage(language, "costHomeRate"), `${currency}/kWh`, "0.01")}
                {renderField("publicElectricityRate", getMessage(language, "costPublicRate"), `${currency}/kWh`, "0.01")}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-sm font-black uppercase tracking-wider text-blue-700">{getMessage(language, "costComparisonTitle")}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderField("petrolConsumption", getMessage(language, "costPetrolConsumption"), "L/100 km", "0.1")}
                {renderField("petrolRate", getMessage(language, "costPetrolRate"), `${currency}/L`, "0.01")}
              </div>
            </fieldset>
          </div>

          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {getMessage(language, "costInputNotice")}
          </p>
          <div className="mt-4 text-sm leading-6 text-slate-600" aria-live="polite">
            {rateStatus === "loading" && <p>{getMessage(language, "costPricesLoading")}</p>}
            {rateStatus === "error" && (
              <p role="alert" className="font-semibold text-rose-700">
                {getMessage(language, "costPricesError")}{" "}
                <button type="button" onClick={() => setRateRetry((attempt) => attempt + 1)} className="underline underline-offset-2">
                  {getMessage(language, "retry")}
                </button>
              </p>
            )}
            {rateStatus === "ready" && (
              <>
                <p>
                  {priceData?.sources
                    ? getMessage(language, "costPricesSourceNote")
                    : getMessage(language, "costPricesEstimateNote")}
                </p>
                {priceData?.electricityDataPeriod && (
                  <p className="mt-2">
                    {getMessage(language, "costPricesElectricityDataPeriod").replace(
                      "{period}",
                      priceData.electricityDataPeriod
                    )}
                  </p>
                )}
                {priceData?.location && (
                  <p className="mt-2">
                    {getMessage(
                      language,
                      priceData.locationIsFallback
                        ? "costPricesFallbackLocation"
                        : "costPricesLocation"
                    ).replace("{location}", priceData.location)}
                  </p>
                )}
                {priceData?.sources && (
                  <ul className="mt-2 space-y-1">
                    {[
                      ["homeElectricity", "costPricesSourceHome"],
                      ["publicCharging", "costPricesSourcePublic"],
                      ["petrol", "costPricesSourceFuel"],
                    ].map(([source, label]) => (
                      <li key={source}>
                        {getMessage(language, label)}:{" "}
                        <a
                          href={priceData.sources[source].url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-blue-700 underline underline-offset-2"
                        >
                          {priceData.sources[source].name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900">{getMessage(language, "costResultsTitle")}</h2>
          <dl className="mt-6 space-y-5">
            <div className="border-b border-blue-100 pb-4">
              <dt className="text-sm font-semibold text-slate-600">{getMessage(language, "costEvAnnual")}</dt>
              <dd className="mt-1 text-2xl font-black text-slate-900">
                {results.evAnnualCost === null ? "—" : formatCurrency(results.evAnnualCost, language, currency)}
              </dd>
            </div>
            <div className="border-b border-blue-100 pb-4">
              <dt className="text-sm font-semibold text-slate-600">{getMessage(language, "costPetrolAnnual")}</dt>
              <dd className="mt-1 text-2xl font-black text-slate-900">
                {results.petrolAnnualCost === null ? "—" : formatCurrency(results.petrolAnnualCost, language, currency)}
              </dd>
            </div>
            <div className="border-b border-blue-100 pb-4">
              <dt className="text-sm font-semibold text-slate-600">
                {results.annualSavings === null
                  ? getMessage(language, "costAnnualDifference")
                  : results.annualSavings >= 0
                    ? getMessage(language, "costAnnualSavings")
                    : getMessage(language, "costAnnualExtra")}
              </dt>
              <dd className={`mt-1 text-2xl font-black ${results.annualSavings === null ? "text-slate-400" : results.annualSavings >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {results.annualSavings === null ? "—" : formatCurrency(Math.abs(results.annualSavings), language, currency)}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-xs leading-5 text-slate-500">{getMessage(language, "costResultsNote")}</p>
        </aside>
      </div>

      <section className="container mx-auto mt-8 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-900">{getMessage(language, "costMethodTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{getMessage(language, "costMethodText")}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-900">{getMessage(language, "costLimitsTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{getMessage(language, "costLimitsText")}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
