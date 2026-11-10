import "server-only";
import * as cheerio from "cheerio";

const SOURCE_ORIGIN = "https://ev-database.org";
const detailRequests = new Map();
const DETAIL_CACHE_DURATION = 60 * 60 * 1000;

function getVehicleSourceUrl(car) {
  if (!/^\/(?:[a-z]{2}\/)?(?:car|auto|pkw)\/\d+\/[A-Za-z0-9-]+$/.test(car.detailPath || "")) {
    return "";
  }

  return new URL(car.detailPath, SOURCE_ORIGIN).href;
}

function getFallbackDetails(car) {
  return {
    battery: car.battery || "",
    range: car.range || "",
    efficiency: car.efficiency || "",
    realRangeEstimation: null,
    longDistanceSuitability: null,
    images: [],
    sourceAvailable: false,
  };
}

function getTableRows($, $container) {
  return $container.find("table tr").map((_, row) => {
    const cells = $(row).find("td");
    const label = cells.eq(0).text().replace(/\s+/g, " ").trim();
    const value = cells.eq(1).text().replace(/\s+/g, " ").trim();
    return label && value ? { label, value } : null;
  }).get().filter(Boolean);
}

async function fetchVehicleDetails(car) {
  const sourceUrl = getVehicleSourceUrl(car);
  if (!sourceUrl) return getFallbackDetails(car);
  const cachedRequest = detailRequests.get(sourceUrl);
  if (cachedRequest && cachedRequest.expiresAt > Date.now()) {
    return cachedRequest.promise;
  }
  detailRequests.delete(sourceUrl);

  const request = (async () => {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Vehicle detail request failed with status ${response.status}`);
    }

    const $ = cheerio.load(await response.text());
    const values = {
      battery: car.battery || "",
      range: car.range || "",
      efficiency: car.efficiency || "",
    };
    const realRange = $("#range");
    const rangeSummary = realRange.find("h2 span").first().text().replace(/\s+/g, " ").trim();
    const rangeBounds = rangeSummary.match(/([\d,.]+)\s*-\s*([\d,.]+)\s*(km|mi)/i);
    const realRangeValues = getTableRows($, realRange);
    const longDistance = $("#longdistance");
    const longDistanceValues = getTableRows($, longDistance);

    $("#icons .icon").each((_, element) => {
      const $icon = $(element);
      const label = $icon.find("p span").first().text().trim().toLowerCase();
      const value = $icon.find("p").clone().children().remove().end().text().trim();

      if (label.includes("battery")) values.battery = value || values.battery;
      if (label.includes("range")) values.range = value || values.range;
      if (label.includes("efficiency")) values.efficiency = value || values.efficiency;
    });

    const images = $(".img-main .fotorama a")
      .map((_, element) => $(element).attr("data-full") || $(element).attr("href"))
      .get()
      .map((path) => {
        if (!path) return "";
        try {
          const url = new URL(path, SOURCE_ORIGIN);
          return url.protocol === "https:" && url.hostname === "ev-database.org" ? url.href : "";
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .slice(0, 12);

    return {
      ...values,
      realRangeEstimation: rangeBounds && realRangeValues.length > 0
        ? {
          min: Number(rangeBounds[1].replace(/,/g, "")),
          max: Number(rangeBounds[2].replace(/,/g, "")),
          unit: rangeBounds[3].toLowerCase(),
          values: realRangeValues,
        }
        : null,
      longDistanceSuitability: longDistanceValues.length > 0
        ? { values: longDistanceValues }
        : null,
      images,
      sourceAvailable: true,
    };
  })();

  detailRequests.set(sourceUrl, {
    promise: request,
    expiresAt: Date.now() + DETAIL_CACHE_DURATION,
  });

  try {
    return await request;
  } catch (error) {
    detailRequests.delete(sourceUrl);
    console.error(`Araç detayları alınamadı (${car.id}):`, error);
    return getFallbackDetails(car);
  }
}

export function getVehicleDetails(car) {
  return fetchVehicleDetails(car);
}
