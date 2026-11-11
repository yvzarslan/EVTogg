import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import { FilterProvider } from "@/components/FilterProvider";
import NewsSection from "@/components/NewsSection";
import ChargingMap from "@/components/ChargingMap";
import ComparisonWrapper from "@/components/ComparisonWrapper";
import ScrollLink from "@/components/ScrollLink";
import Link from "next/link";
import { ArrowRight, Calculator, Newspaper, Scale, Zap } from "lucide-react";
import { scrapeEVData } from "@/lib/scraper";
import { showChargingStations, showVehicleNews } from "@/lib/features";
import { bodyStyleLabels, segmentLabels } from "@/lib/vehicleFilters";
import { getMessage } from "@/lib/i18n";
import { getRequestLanguage } from "@/lib/requestLanguage";

export const revalidate = 86400;

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const language = await getRequestLanguage();

  const filters = {
    brand: params.brand || "",
    model: params.model || "",
    range: params.range || "",
    accel: params.accel || "",
    segment: params.segment || "",
    bodyStyle: params.bodyStyle || "",
  };

  const allCars = await scrapeEVData({});
  const sortedCars = [...allCars].sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand, "tr");
    if (brandCompare !== 0) return brandCompare;
    return a.model.localeCompare(b.model, "tr");
  });

  const uniqueBrands = [...new Set(sortedCars.map((car) => car.brand))].sort((a, b) =>
    a.localeCompare(b, "tr")
  );
  const brandOptions = uniqueBrands.map((brand) => ({
    brand,
    models: sortedCars
      .filter((car) => car.brand === brand)
      .map(({ id, model }) => ({ id, model })),
  }));
  const uniqueSegments = [...new Set(sortedCars.map((car) => car.segmentCode).filter(Boolean))]
    .sort((a, b) => (segmentLabels[a] || a).localeCompare(segmentLabels[b] || b, "tr"));
  const uniqueBodyStyles = [...new Set(sortedCars.map((car) => car.bodyStyleCode).filter(Boolean))]
    .sort((a, b) => (bodyStyleLabels[a] || a).localeCompare(bodyStyleLabels[b] || b, "tr"));

  const publicDisplayCars = sortedCars.map((car) => ({
    ...car,
    image: `/api/vehicle-image/${encodeURIComponent(car.id)}`,
  }));

  const featureCards = [
    {
      title: getMessage(language, "featureComparison"),
      text: getMessage(language, "featureComparisonDescription"),
      icon: Scale,
      target: "araclar",
      linkLabel: getMessage(language, "viewVehicles"),
    },
    {
      title: getMessage(language, "costGuideNav"),
      text: getMessage(language, "featureCostDescription"),
      icon: Calculator,
      href: "/maliyet-hesaplama",
      linkLabel: getMessage(language, "costGuideNav"),
    },
    {
      title: getMessage(language, "featureUpdates"),
      text: getMessage(language, "featureUpdatesDescription"),
      icon: Newspaper,
      ...(showVehicleNews ? { target: "haberler" } : {}),
      linkLabel: getMessage(language, "news"),
    },
  ];

  return (
    <FilterProvider initialFilters={filters}>
      <main className="ev-home min-h-screen pb-16">
        <section id="hero" className="scroll-mt-20">
          <Hero />
        </section>

        <section id="araclar" className="scroll-mt-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-3 flex items-center gap-2 pl-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <Zap size={14} className="text-lime-600" />
              {getMessage(language, "quickSearch")}
            </div>
            <FilterBar
              initialBrands={brandOptions}
              initialSegments={uniqueSegments}
              initialBodyStyles={uniqueBodyStyles}
            />
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 pb-14 pt-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="mb-2 block h-[3px] w-8 rounded-full bg-lime-400" />
              <h2 className="text-2xl font-extrabold tracking-tight text-[#122747] sm:text-[28px]">
                {getMessage(language, "featuredModels")}
              </h2>
            </div>
            <ScrollLink targetId="araclar" className="hidden items-center gap-2 pb-1 text-xs font-bold text-slate-600 transition hover:text-slate-950 sm:inline-flex">
              {getMessage(language, "viewAllModels")} <ArrowRight size={14} />
            </ScrollLink>
          </div>
          <ComparisonWrapper allCars={publicDisplayCars} />
        </section>

        <section className="mx-auto max-w-[1240px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-3">
            {featureCards.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-600">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-[#142746]">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{item.text}</span>
                    {(item.href || item.target) && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                        {item.linkLabel}
                        <ArrowRight size={13} />
                      </span>
                    )}
                  </span>
                </>
              );

              return item.href ? (
                <Link key={item.title} href={item.href} className="feature-card flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-lg">
                  {content}
                </Link>
              ) : item.target ? (
                <ScrollLink key={item.title} targetId={item.target} className="feature-card flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-lg">
                  {content}
                </ScrollLink>
              ) : (
                <div key={item.title} className="feature-card flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4">
                  {content}
                </div>
              );
            })}
          </div>
        </section>

        {showVehicleNews && (
          <section id="haberler" className="scroll-mt-24">
            <NewsSection />
          </section>
        )}

        {showChargingStations && (
          <section id="sarj" className="scroll-mt-24">
            <ChargingMap />
          </section>
        )}

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <div className="brand-mark text-xl"><span className="brand-ev-badge">EV</span><span className="ml-1.5">Platform</span></div>
              <p className="mt-2 max-w-lg text-xs leading-5 text-slate-500">{getMessage(language, "footerDescription")}</p>
            </div>
            <p className="max-w-xl text-xs leading-5 text-slate-500">{getMessage(language, "footerDisclaimer")}</p>
            <p className="shrink-0 text-xs text-slate-400">{getMessage(language, "footerCopyright")}</p>
          </div>
        </footer>
      </main>
    </FilterProvider>
  );
}
