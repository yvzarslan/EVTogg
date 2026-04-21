import Hero from '@/components/Hero';
import FilterBar from '@/components/FilterBar';
import EVCard from '@/components/EVCard';
import NewsSection from '@/components/NewsSection';
import ChargingMap from '@/components/ChargingMap';
import { scrapeEVData } from '@/lib/scraper';

// ISR: Veriyi 24 saatte bir arka planda yeniler
export const revalidate = 86400; 

export default async function HomePage({ searchParams }) {
  // Scraper ile 10 adet aracı çekiyoruz
  
  const params = await searchParams;

  const filters = {
    brand: params.brand || "",
    range: params.range || "",
    accel: params.accel || "",
  };

  // Eğer hiçbir filtre yoksa sadece 12 araç getir, filtre varsa tüm sonuçları getir
  const isFiltered = filters.brand || filters.range || filters.accel;
  const displayCars = await scrapeEVData(filters, isFiltered ? null : 12);

  // Marka listesi için her zaman tüm veriyi (veya markaları) çekmemiz gerekebilir
  // Ancak performans için tüm araç listesini bir kez çekip markaları oradan ayıklıyoruz
  const allDataForFilter = await scrapeEVData({}); 
  const uniqueBrands = [...new Set(allDataForFilter.map(c => c.brand))].sort();
 

  return (
    <main className="bg-[#f8fafc] min-h-screen pb-20">
      {/* 1. Giriş Alanı (Togg Animasyonlu) */}
     <section id="hero">
      <Hero />
       </section>
      {/* 2. Arama ve Filtreleme (Hero'nun üzerine binen kısım) */}
      <section id="araclar" className="container mx-auto px-4">
        <FilterBar 
          initialBrands={uniqueBrands} 
          currentFilters={filters} 
        />
      </section>

      {/* 3. Popüler Araçlar Listesi (10 Araç) */}
      <section className="container mx-auto py-16 px-4">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
             Elektrikli Araçlar
          </h2>
        </div>

        {/* Grid yapısı: Mobilde 1, Tablette 2, Masaüstünde 4 sütun */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCars.length > 0 ? (
            displayCars.map((car) => (
              <EVCard key={car.id} car={car} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400">
              Seçilen kriterlerde uygun araç bulunamadı.
            </div>
          )}
        </div>
         
      </section>
      <section id="haberler">  
      {/* 4. Haberler ve Video İncelemeleri */}
          <NewsSection filters={filters} />
     </section>  
      <section id="sarj"> 
      {/* 5. Türkiye Şarj İstasyonları Haritası */}
      <ChargingMap />
      </section>  
      {/* 6. Footer (Opsiyonel Basit Bir Kapanış) */}
      <footer className="container mx-auto px-4 mt-20 pt-10 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2026 - Elektrikli Araç Platformu. Tüm hakları saklıdır.</p>
      </footer>
    </main>
  );
}