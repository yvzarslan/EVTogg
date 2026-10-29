import Hero from '@/components/Hero';
import FilterBar from '@/components/FilterBar';
import NewsSection from '@/components/NewsSection';
import ChargingMap from '@/components/ChargingMap';
import ComparisonWrapper from '@/components/ComparisonWrapper';
import { scrapeEVData } from '@/lib/scraper';
import { showChargingStations, showVehicleNews } from '@/lib/features';
import { bodyStyleLabels, segmentLabels } from '@/lib/vehicleFilters';

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
            Elektrikli Araçlar
          </h2>
        </div>

        {displayCars.length > 0 ? (
          <ComparisonWrapper displayCars={displayCars} />
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-[3xl] border border-dashed border-slate-300 text-slate-400">
            Seçilen kriterlerde uygun araç bulunamadı.
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
              title: 'Hızlı karşılaştırma',
              text: 'Marka, menzil ve 0-100 değerlerine göre en uygun modelleri tek ekranda gör.',
            },
            ...(showChargingStations ? [{
              title: 'Şarj görünürlüğü',
              text: 'İstanbul merkezli şarj noktalarını hızlıca keşfet ve yol planlamanı kolaylaştır.',
            }] : []),
            {
              title: 'Güncel takip',
              text: 'Piyasadaki yeni modeller, haberler ve trendler tek bir platformdan takip edilebiliyor.',
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
              Elektrikli araçlar için net karşılaştırma ve güncel içerik sunan modern bir rehber.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-black tracking-[0.18em] text-blue-300 uppercase">Menü</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="#hero" className="transition hover:text-white">Ana Sayfa</a></li>
              <li><a href="#araclar" className="transition hover:text-white">Araçlar</a></li>
              {showVehicleNews && <li><a href="#haberler" className="transition hover:text-white">Haberler</a></li>}
              {showChargingStations && <li><a href="#sarj" className="transition hover:text-white">Şarj Noktaları</a></li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-black tracking-[0.18em] text-blue-300 uppercase">Not</h4>
            <p className="text-sm leading-6 text-slate-300">
              Site bağımsız bilgilendirme ve karşılaştırma amacıyla hazırlanmıştır. Marka ve model adları yalnızca açıklama için kullanılır.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-5 text-center text-xs text-slate-400">
            © 2026 Elektrikli Araç Platformu. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </main>
  );
}