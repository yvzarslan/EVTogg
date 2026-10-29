import { scrapeEVData } from "@/lib/scraper";
import Link from "next/link";
import { cookies } from "next/headers";
import { defaultLanguage, getMessage, normalizeLanguage } from "@/lib/i18n";
import VehicleComparison from "@/components/VehicleComparison";

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const language = normalizeLanguage((await cookies()).get("ev-platform-language")?.value || defaultLanguage);
  const ids = params.ids?.split(",") || [];

  const allCars = await scrapeEVData({});
  const selectedCars = ids
    .map((id) => allCars.find((car) => car.id.toString() === id))
    .filter(Boolean);

  if (selectedCars.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h1 className="mb-4 text-2xl font-black text-slate-800">{getMessage(language, "noCarsToCompare")}</h1>
        <Link href="/" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500">
          {getMessage(language, "goBack")}
        </Link>
      </div>
    );
  }

  return <VehicleComparison selectedCars={selectedCars} />;
}
