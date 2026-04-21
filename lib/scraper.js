import * as cheerio from "cheerio";

// Cache mekanizması (Bellekte 1 saat tutar)
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 Saat

const parseNumber = (val) => {
  if (!val) return 0;
  // Performans için regex'i önceden tanımlayabiliriz ama bu hali de yeterli
  return parseFloat(val.replace(/[^\d.]/g, "")) || 0;
};

export async function scrapeEVData(filters = {}) {
  try {
    const now = Date.now();

    // 1. Önbellek Kontrolü: Veri varsa ve süresi dolmadıysa direkt cache'den oku
    if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
      return applyFilters(cachedData, filters);
    }

    const res = await fetch("https://ev-database.org/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 } // Next.js kullanıyorsanız fetch seviyesinde cache
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html, { lowerCaseTags: true }); // Daha hızlı parsing
    const cars = [];

    // 2. Performans: Seçicileri optimize et
    $(".list-item").each((i, el) => {
      const $el = $(el);
      const titleSpans = $el.find(".title span");
      const specs = $el.find(".specs span");

      // Veriyi bir kerede çekip değişkene atamak daha hızlıdır
      const car = {
        id: `car-${i}`,
        brand: titleSpans.first().text().trim(),
        model: titleSpans.last().text().trim(),
        range: specs.eq(1).text().trim(),
        battery: specs.eq(14).text().trim(),
        accel: specs.eq(9).text().trim(),
        long_total: specs.eq(11).text().trim(),
        cargo: $el.find(".cargo").text().trim(),
        image: $el.find("img").attr("src") || "",
      };

      if (car.image.startsWith("/")) {
        car.image = `https://ev-database.org${car.image}`;
      }

      cars.push(car);
    });

    // Cache'i güncelle
    cachedData = cars;
    lastFetchTime = now;

    return applyFilters(cars, filters);

  } catch (error) {
    console.error("SCRAPER HATA:", error);
    return cachedData ? applyFilters(cachedData, filters) : [];
  }
}

// 3. Filtreleme Mantığını Ayır (Clean Code & Reusability)
function applyFilters(cars, filters) {
  const { brand, range, accel } = filters;
  
  if (!brand && !range && !accel) return cars;

  const searchBrand = brand?.toLowerCase();
  const searchRange = Number(range);
  const searchAccel = Number(accel);

  return cars.filter((car) => {
    if (searchBrand && car.brand.toLowerCase() !== searchBrand) return false;
    if (searchRange && parseNumber(car.range) < searchRange) return false;
    if (searchAccel && parseNumber(car.accel) > searchAccel) return false;
    return true;
  });
}