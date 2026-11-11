import { scrapeEVData } from "@/lib/scraper";
import Link from "next/link";
import { getMessage } from "@/lib/i18n";
import { getRequestLanguage } from "@/lib/requestLanguage";
import VehicleComparison from "@/components/VehicleComparison";

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const language = await getRequestLanguage();
  const ids = params.ids?.split(",") || [];

  const allCars = await scrapeEVData({});
  const selectedCars = ids
    .map((id) => allCars.find((car) => car.id.toString() === id))
    .filter(Boolean);

  if (selectedCars.length === 0) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#f5f7fa] px-4 py-4 sm:px-6 lg:px-8">
        <section className="hero-panel mx-auto flex min-h-[330px] max-w-[1320px] flex-col items-start justify-center rounded-[26px] bg-[#edf2f7] px-6 py-10 sm:px-10 md:px-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">{getMessage(language, "compare")}</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-[-0.04em] text-[#102447] sm:text-5xl">
            {getMessage(language, "noCarsToCompare")}
          </h1>
          <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#9bea21] px-6 text-sm font-extrabold text-slate-950 transition hover:bg-[#8bd91a]">
            {getMessage(language, "goBack")}
          </Link>
        </section>
      </main>
    );
  }

  const publicSelectedCars = selectedCars.map((car) => ({
    ...car,
    image: `/api/vehicle-image/${encodeURIComponent(car.id)}`,
  }));

  return <VehicleComparison selectedCars={publicSelectedCars} />;
}
