import Hero from '@/components/Hero';
import FilterBar from '@/components/FilterBar';
import NewsSection from '@/components/NewsSection';
import ChargingMap from '@/components/ChargingMap';
import ComparisonWrapper from '@/components/ComparisonWrapper';
import ScrollLink from '@/components/ScrollLink';
import { scrapeEVData } from '@/lib/scraper';
import { showChargingStations, showVehicleNews } from '@/lib/features';
import { bodyStyleLabels, segmentLabels } from '@/lib/vehicleFilters';
import { cookies } from 'next/headers';
import { defaultLanguage, getMessage, normalizeLanguage } from '@/lib/i18n';

export const revalidate = 86400;

const matchesFilters = (car, filters) => {
  const brand = filters.brand?.toLowerCase();
  const range = Number(filters.range);
  const accel = Number(filters.accel);

  if (brand && car.brand.toLowerCase() !== brand) return false;
  if (filters.segment && car.segmentCode !== filters.segment) return false;
  if (filters.bodyStyle && car.bodyStyleCode !== filters.bodyStyle) return false;
  if (range && Number.parseFloat((car.range || '').replace(/[^\d.]/g, '')) < range) return false;
  if (accel && Number.parseFloat((car.accel || '').replace(/[^\d.]/g, '')) > accel) return false;

  return true;
};

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const language = normalizeLanguage((await cookies()).get('ev-platform-language')?.value || defaultLanguage);

  const filters = {
    brand: params.brand || '',
    range: params.range || '',
    accel: params.accel || '',
    segment: params.segment || '',
    bodyStyle: params.bodyStyle || '',
  };

  const isFiltered = Boolean(
    filters.brand || filters.range || filters.accel || filters.segment || filters.bodyStyle
  );
  const allCars = await scrapeEVData({});
  const sortedCars = [...allCars].sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand, 'tr');
    if (brandCompare !== 0) return brandCompare;
    return a.model.localeCompare(b.model, 'tr');
  });

  const uniqueBrands = [...new Set(sortedCars.map((car) => car.brand))].sort((a, b) =>
    a.localeCompare(b, 'tr')
  );
  const uniqueSegments = [...new Set(sortedCars.map((car) => car.segmentCode).filter(Boolean))]
    .sort((a, b) => segmentLabels[a].localeCompare(segmentLabels[b], 'tr'));
  const uniqueBodyStyles = [...new Set(sortedCars.map((car) => car.bodyStyleCode).filter(Boolean))]
    .sort((a, b) => bodyStyleLabels[a].localeCompare(bodyStyleLabels[b], 'tr'));

  const displayCars = isFiltered
    ? sortedCars.filter((car) => matchesFilters(car, filters))
    : sortedCars.slice(0, 12);
  const publicDisplayCars = displayCars.map((car) => ({
    ...car,
    image: `/api/vehicle-image/${encodeURIComponent(car.id)}`,
  }));

  return (
    <main className="bg-[#f8fafc] min-h-screen pb-20">
      <section id="hero">
        <Hero />
      </section>

      <section id="araclar" className="container mx-auto px-4">
        <FilterBar
          initialBrands={uniqueBrands}
          initialSegments={uniqueSegments}
          initialBodyStyles={uniqueBodyStyles}
          currentFilters={filters}
        />
      </section>

      <section className="container mx-auto py-16 px-4">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {getMessage(language, 'vehicleList')}
          </h2>
        </div>

        {displayCars.length > 0 ? (
          <ComparisonWrapper displayCars={publicDisplayCars} />
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-[3xl] border border-dashed border-slate-300 text-slate-400">
            {getMessage(language, 'noMatchingCars')}
          </div>
        )}
      </section>

      {showVehicleNews && (
        <section id="haberler">
          <NewsSection filters={filters} />
        </section>
      )}

      {showChargingStations && (
        <section id="sarj">
          <ChargingMap />
        </section>
      )}

      <section className="container mx-auto mt-20 px-4">
        <div className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_-45px_rgba(37,99,235,0.75)] backdrop-blur-sm md:grid-cols-3">
          {[
            {
              title: getMessage(language, 'featureComparison'),
              text: getMessage(language, 'featureComparisonDescription'),
            },
            ...(showChargingStations ? [{
              title: getMessage(language, 'featureCharging'),
              text: getMessage(language, 'featureChargingDescription'),
            }] : []),
            {
              title: getMessage(language, 'featureUpdates'),
              text: getMessage(language, 'featureUpdatesDescription'),
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">✓</div>
              <h3 className="mb-2 text-xl font-extrabold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t border-slate-200 bg-slate-950 text-slate-200">
        <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 text-lg font-black text-slate-950">E</span>
              <div>
                <div className="text-lg font-black tracking-[0.18em] text-white uppercase">Platform</div>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-300">
              {getMessage(language, 'footerDescription')}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-black tracking-[0.18em] text-blue-300 uppercase">{getMessage(language, 'footerMenu')}</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><ScrollLink targetId="hero" className="transition hover:text-white">{getMessage(language, 'home')}</ScrollLink></li>
              <li><ScrollLink targetId="araclar" className="transition hover:text-white">{getMessage(language, 'vehicles')}</ScrollLink></li>
              {showVehicleNews && <li><ScrollLink targetId="haberler" className="transition hover:text-white">{getMessage(language, 'news')}</ScrollLink></li>}
              {showChargingStations && <li><ScrollLink targetId="sarj" className="transition hover:text-white">{getMessage(language, 'chargingStations')}</ScrollLink></li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-black tracking-[0.18em] text-blue-300 uppercase">{getMessage(language, 'footerNote')}</h4>
            <p className="text-sm leading-6 text-slate-300">
              {getMessage(language, 'footerDisclaimer')}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-5 text-center text-xs text-slate-400">
            {getMessage(language, 'footerCopyright')}
          </div>
        </div>
      </footer>
    </main>
  );
}