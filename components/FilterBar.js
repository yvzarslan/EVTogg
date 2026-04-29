"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function FilterBar({ initialBrands = [], currentFilters }) {
  const router = useRouter();
  //const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    brand: currentFilters.brand || "",
    range: currentFilters.range || 660,
    accel: currentFilters.accel || 10,
  });

  // Filtreler değiştiğinde URL'yi güncelle (Debounce ile)
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.brand) params.set("brand", filters.brand);
      if (filters.range) params.set("range", filters.range);
      if (filters.accel) params.set("accel", filters.accel);

      // URL'yi güncelle (Sayfayı yenilemeden veriyi çeker)
      router.push(`?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(handler);
  }, [filters, router]);

  return (
    <div className="bg-white p-6 shadow-xl rounded-3xl flex flex-wrap gap-6 items-end">
      {/* MARKA SEÇİMİ */}
      <div className="flex-1 min-w-[200]">
        <label className="text-sm font-bold text-gray-500 mb-2 block">Marka Seçin</label>
        <select
          value={filters.brand}
          onChange={(e) => setFilters({...filters, brand: e.target.value})}
          className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Markalar</option>
          {initialBrands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* MENZİL SLIDER */}
      <div className="flex-1 min-w-[150]">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold text-gray-500">Min. Menzil</span>
          <span className="text-blue-600 font-bold">{filters.range} km</span>
        </div>
        <input
          type="range"
          min="100"
          max="1000"
          value={filters.range}
          onChange={(e) => setFilters({...filters, range: e.target.value})}
          className="w-full"
        />
      </div>

      {/* HIZLANMA SLIDER */}
      <div className="flex-1 min-w-[200]">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold text-gray-500">Max. 0-100</span>
          <span className="text-blue-600 font-bold">{filters.accel} sn</span>
        </div>
        <input
          type="range"
          min="2"
          max="15"
          step="0.1"
          value={filters.accel}
          onChange={(e) => setFilters({...filters, accel: e.target.value})}
          className="w-full"
        />
      </div>
    </div>
  );
}