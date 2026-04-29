import { scrapeEVData } from "@/lib/scraper";
import Link from "next/link";

export default async function ComparePage({ searchParams }) {
  const params = await searchParams;
  const ids = params.ids?.split(",") || [];

  // Tüm araç verilerini çekip sadece seçilen ID'lere sahip olanları filtreliyoruz
  const allCars = await scrapeEVData({});
  const selectedCars = allCars.filter((car) => ids.includes(car.id.toString()));

  if (selectedCars.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Kıyaslanacak araç bulunamadı.</h1>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Geri Dön</Link>
      </div>
    );
  }

  // Karşılaştırılacak özelliklerin listesi
  const features = [
    { label: "Menzil", key: "range" },
    { label: "Batarya Kapasitesi", key: "battery" },
    { label: "0-100 Hızlanma", key: "accel" },
    { label: "Bagaj Hacmi", key: "cargo" },
    { label: "Toplam Menzil (1 mola ile)", key: "long_total" },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Üst Header */}
      <div className="border-b bg-slate-900 text-white p-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">KIYASLAMA</h1>
          <Link href="/" className="text-slate-400 hover:text-white font-bold transition-colors">← Seçimi Düzenle</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Sol boş hücre (etiketler için) */}
                <th className="min-w-[200px] p-4 text-left border-b-2 border-slate-100">Özellikler</th>
                
                {/* Araç Resimleri ve İsimleri */}
                {selectedCars.map((car) => (
                  <th key={car.id} className="p-4 border-b-2 border-slate-100 min-w-[250px]">
                    <div className="flex flex-col items-center">
                      <img src={car.image} alt={car.brand} className="h-32 object-contain mb-4" />
                      <span className="text-blue-600 text-sm font-bold block">{car.brand}</span>
                      <span className="text-xl font-black text-slate-900">{car.model}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.key} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-bold text-slate-500 border-b border-slate-100">{feature.label}</td>
                  {selectedCars.map((car) => (
                    <td key={car.id} className="p-5 text-center border-b border-slate-100 text-lg font-bold text-slate-800">
                      {car[feature.key]} {feature.key === 'accel' ? 'sn' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}