import * as cheerio from "cheerio";
import { getBodyStyleLabel, getSegmentLabel } from "@/lib/vehicleFilters";

let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000;

const parseNumber = (val) => {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^\d.]/g, "")) || 0;
};

const getSpecText = ($el, selector) =>
  $el.find(`.specs .${selector}`).first().text().replace(/\s+/g, " ").trim();

export async function scrapeEVData(filters = {}, limit = null) {
  try {
    const now = Date.now();

    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return applyFilters(cachedData, filters, limit);
    }

    const res = await fetch("https://ev-database.org/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html, { lowerCaseTags: true });
    const cars = [];

    $(".list-item").each((i, el) => {
      const $el = $(el);
      const titleSpans = $el.find(".title span");
      const acceleration = getSpecText($el, "acceleration_p").replace(/\bsec(?:onds?)?\b/i, "sn");
      const cargo = getSpecText($el, "cargo").replace(/\s*L\b/i, " litre");
      const segmentClass = $el.find('.icons [class*="size-"]').first().attr("class") || "";
      const bodyStyleClass = $el.find('[class*="shape-"]').first().attr("class") || "";
      const segmentCode = segmentClass.match(/\bsize-([a-z])\b/)?.[1] || "";
      const bodyStyleCode = bodyStyleClass.match(/\bshape-([a-z]+)\b/)?.[1] || "";

      const car = {
        id: `car-${i}`,
        brand: titleSpans.first().text().trim(),
        model: titleSpans.last().text().trim(),
        segment: getSegmentLabel(segmentCode),
        segmentCode,
        body_style: getBodyStyleLabel(bodyStyleCode),
        bodyStyleCode,
        range: getSpecText($el, "erange_real"),
        efficiency: getSpecText($el, "efficiency"),
        weight: getSpecText($el, "weight_p"),
        accel: acceleration,
        long_total: getSpecText($el, "long_distance_total"),
        battery: getSpecText($el, "battery_p"),
        fastcharge: getSpecText($el, "fastcharge_speed_print"),
        cargo,
        image: $el.find("img").attr("src") || "",
      };

      if (car.image.startsWith("/")) {
        car.image = `https://ev-database.org${car.image}`;
      }

      cars.push(car);
    });

    cachedData = cars;
    lastFetchTime = now;

    return applyFilters(cars, filters, limit);
  } catch (error) {
    console.error("SCRAPER HATA:", error);
    return cachedData ? applyFilters(cachedData, filters, limit) : [];
  }
}

function applyFilters(cars, filters, limit = null) {
  const { brand, range, accel, segment, bodyStyle } = filters;

  if (!brand && !range && !accel && !segment && !bodyStyle) {
    return typeof limit === "number" ? cars.slice(0, limit) : cars;
  }

  const searchBrand = brand?.toLowerCase();
  const searchRange = Number(range);
  const searchAccel = Number(accel);
  const searchSegment = segment?.toLowerCase();
  const searchBodyStyle = bodyStyle?.toLowerCase();

  const filteredCars = cars.filter((car) => {
    if (searchBrand && car.brand.toLowerCase() !== searchBrand) return false;
    if (searchSegment && car.segmentCode !== searchSegment) return false;
    if (searchBodyStyle && car.bodyStyleCode !== searchBodyStyle) return false;
    if (searchRange && parseNumber(car.range) < searchRange) return false;
    if (searchAccel && parseNumber(car.accel) > searchAccel) return false;
    return true;
  });

  return typeof limit === "number" ? filteredCars.slice(0, limit) : filteredCars;
}