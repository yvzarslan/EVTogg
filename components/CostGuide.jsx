"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

const initialInputs = {
  annualDistance: "15000",
  evConsumption: "18",
  homeChargingShare: "80",
  homeElectricityRate: "",
  publicElectricityRate: "",
  petrolConsumption: "7",
  petrolRate: "",
  evPrice: "",
  petrolCarPrice: "",
};

const monetaryInputs = [
  "homeElectricityRate",
  "publicElectricityRate",
  "petrolRate",
  "evPrice",
  "petrolCarPrice",
];

const currencyByLanguage = {
  tr: "TRY",
  en: "USD",
  fr: "EUR",
  de: "EUR",
  ru: "RUB",
  zh: "CNY",
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
  const [currency, setCurrency] = useState(currencyByLanguage[language]);
  const [rateStatus, setRateStatus] = useState("ready");
  const [rateRetry, setRateRetry] = useState(0);
  const currencyRef = useRef(currencyByLanguage[language]);

  useEffect(() => {
    const targetCurrency = currencyByLanguage[language];
    if (targetCurrency === currencyRef.current) {
      setRateStatus("ready");
      return undefined;
    }

    const controller = new AbortController();
    setRateStatus("loading");

    async function convertInputs() {
      try {
        const response = await fetch("/api/exchange-rates", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Exchange rate request failed with status ${response.status}`);
        }

        const data = await response.json();
        const sourceRate = Number(data.rates?.[currencyRef.current]);
        const targetRate = Number(data.rates?.[targetCurrency]);
        if (!Number.isFinite(sourceRate) || sourceRate <= 0 || !Number.isFinite(targetRate) || targetRate <= 0) {
          throw new Error("The requested exchange rates are missing or invalid.");
        }

        const conversionFactor = targetRate / sourceRate;
        setInputs((current) => ({
          ...current,
          ...Object.fromEntries(monetaryInputs.map((name) => {
            const amount = current[name].trim() === "" ? null : Number(current[name]);
            return [
              name,
              amount !== null && Number.isFinite(amount)
                ? String(Number((amount * conversionFactor).toFixed(8)))
                : current[name],
            ];
          })),
        }));
        currencyRef.current = targetCurrency;
        setCurrency(targetCurrency);
        setRateStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Could not convert calculator values to the selected currency.", error);
        setRateStatus("error");
      }
    }

    convertInputs();
    return () => controller.abort();
  }, [language, rateRetry]);

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
    const evPrice = parsePositiveNumber(inputs.evPrice);
    const petrolCarPrice = parsePositiveNumber(inputs.petrolCarPrice);
    const pricePremium = evPrice && petrolCarPrice ? evPrice - petrolCarPrice : null;
    const paybackYears = pricePremium > 0 && annualSavings > 0
      ? pricePremium / annualSavings
      : null;

    return { evAnnualCost, petrolAnnualCost, annualSavings, pricePremium, paybackYears };
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
    const usesThousandsSeparator = ["annualDistance", "evPrice", "petrolCarPrice"].includes(name);
    const value = usesThousandsSeparator && inputs[name] !== ""
      ? new Intl.NumberFormat(language, { maximumFractionDigits: name === "annualDistance" ? 0 : 2 }).format(Number(inputs[name]))
      : inputs[name];
    const currencyUnit = name === "homeElectricityRate" || name === "publicElectricityRate"
      ? `${currency}/kWh`
      : name === "petrolRate"
        ? `${currency}/L`
        : name === "evPrice" || name === "petrolCarPrice"
          ? currency
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
                {renderField("evPrice", getMessage(language, "costEvPrice"), currency, "1000")}
                {renderField("petrolCarPrice", getMessage(language, "costPetrolCarPrice"), currency, "1000")}
              </div>
            </fieldset>
          </div>

          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {getMessage(language, "costInputNotice")}
          </p>
          <div className="mt-4 text-sm leading-6 text-slate-600" aria-live="polite">
            {rateStatus === "loading" && <p>{getMessage(language, "costExchangeLoading")}</p>}
            {rateStatus === "error" && (
              <p role="alert" className="font-semibold text-rose-700">
                {getMessage(language, "costExchangeError")}{" "}
                <button type="button" onClick={() => setRateRetry((attempt) => attempt + 1)} className="underline underline-offset-2">
                  {getMessage(language, "retry")}
                </button>
              </p>
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
            <div>
              <dt className="text-sm font-semibold text-slate-600">{getMessage(language, "costPayback")}</dt>
              <dd className="mt-1 text-2xl font-black text-slate-900">
                {results.paybackYears !== null
                  ? `${new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(results.paybackYears)} ${getMessage(language, "costYears")}`
                  : results.pricePremium !== null && results.pricePremium <= 0
                    ? getMessage(language, "costNoPremium")
                    : results.annualSavings !== null && results.annualSavings <= 0
                      ? getMessage(language, "costNoPayback")
                      : "—"}
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
