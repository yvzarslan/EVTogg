import { getRequestCity, getRequestCountry } from "@/lib/requestCountry";
import { costPriceEstimates } from "@/lib/costPriceEstimates";
import * as cheerio from "cheerio";

const turkeySources = {
  homeElectricity: {
    name: "GlobalPetrolPrices (EPDK/TEDAS references)",
    url: "https://www.globalpetrolprices.com/Turkey/electricity_prices/",
  },
  publicCharging: {
    name: "Trugo",
    url: "https://www.trugo.com.tr/price",
  },
  petrol: {
    name: "Petrol Ofisi",
    url: "https://www.petrolofisi.com.tr/akaryakit-fiyatlari",
  },
};

function normalizeLocation(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim()
    .toUpperCase();
}

function parseTurkishPrice(value) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function getTurkeyPrices() {
  const city = await getRequestCity();
  let sourceResponses;
  try {
    sourceResponses = await Promise.all([
      fetch(turkeySources.homeElectricity.url, { next: { revalidate: 3600 } }),
      fetch(turkeySources.publicCharging.url, { next: { revalidate: 3600 } }),
      fetch(turkeySources.petrol.url, { next: { revalidate: 3600 } }),
    ]);
  } catch (error) {
    console.error("Could not retrieve Turkish energy-price sources.", error);
    return {
      error: "One or more Turkish price sources are currently unavailable.",
      status: 502,
    };
  }

  const [electricityResponse, chargingResponse, petrolResponse] = sourceResponses;

  if (!electricityResponse.ok || !chargingResponse.ok || !petrolResponse.ok) {
    return {
      error: "One or more Turkish price sources are currently unavailable.",
      status: 502,
    };
  }

  const [electricityHtml, chargingHtml, petrolHtml] = await Promise.all([
    electricityResponse.text(),
    chargingResponse.text(),
    petrolResponse.text(),
  ]);
  const electricityText = cheerio.load(electricityHtml)("body").text().replace(/\s+/g, " ");
  const electricityMatch = electricityText.match(
    /residential electricity price in Turkey is TRY\s*([\d.,]+)\s*per kWh/i
  );
  const homeElectricityRate = electricityMatch
    ? parseTurkishPrice(electricityMatch[1])
    : null;
  const electricityDateMatch = electricityText.match(
    /retail prices were collected in ([A-Za-z]+ \d{4})/i
  );

  const chargingText = cheerio.load(chargingHtml)("body").text().replace(/\s+/g, " ");
  const dcMatch = chargingText.match(
    /DC cihazlar için\s*1 kWh ücreti\s*([\d.,]+)\s*TL\s*-\s*([\d.,]+)\s*TL/i
  );
  const acMatch = chargingText.match(
    /AC cihazlar için\s*1 kWh ücreti\s*([\d.,]+)\s*TL/i
  );
  const dcLow = dcMatch ? parseTurkishPrice(dcMatch[1]) : null;
  const dcHigh = dcMatch ? parseTurkishPrice(dcMatch[2]) : null;
  const acRate = acMatch ? parseTurkishPrice(acMatch[1]) : null;
  const publicElectricityRate =
    dcLow && dcHigh && acRate
      ? Number(((acRate + (dcLow + dcHigh) / 2) / 2).toFixed(2))
      : null;

  const $ = cheerio.load(petrolHtml);
  const rows = $("tr.price-row").toArray();
  const normalizedCity = city ? normalizeLocation(city).split(" (")[0] : null;
  const matchingRows = normalizedCity
    ? rows.filter((row) => {
        const district = $(row).attr("data-disctrict-name") || "";
        return normalizeLocation(district.split(" (")[0]) === normalizedCity;
      })
    : [];
  const locationIsFallback = matchingRows.length === 0;
  const petrolRow = (locationIsFallback
    ? rows.filter((row) => $(row).attr("data-disctrict-name") === "ISTANBUL (AVRUPA)")
    : matchingRows.find((row) =>
        $(row).attr("data-disctrict-name") === "ISTANBUL (AVRUPA)"
      ) || matchingRows[0]
  );
  const petrolCells = petrolRow ? $(petrolRow).find("td").toArray() : [];
  const petrolValue = petrolCells[1] ? $(petrolCells[1]).text().match(/[\d.,]+/)?.[0] : null;
  const petrolRate = petrolValue ? parseTurkishPrice(petrolValue) : null;
  const location = petrolRow ? $(petrolRow).attr("data-disctrict-name") : null;

  if (
    !homeElectricityRate ||
    !publicElectricityRate ||
    !petrolRate ||
    !location ||
    !electricityDateMatch
  ) {
    return {
      error: "A Turkish price source returned data in an unrecognized format.",
      status: 502,
    };
  }

  return {
    country: "TR",
    currency: "TRY",
    rates: { homeElectricityRate, publicElectricityRate, petrolRate },
    location,
    locationIsFallback,
    electricityDataPeriod: electricityDateMatch?.[1] || null,
    sources: turkeySources,
  };
}

export async function GET() {
  const country = await getRequestCountry();

  if (country === "TR") {
    const result = await getTurkeyPrices();
    if (result.error) {
      return Response.json(
        { error: result.error },
        { status: result.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  const estimate = country ? costPriceEstimates.get(country) : null;

  if (!country || !estimate) {
    return Response.json(
      { error: "Automatic price estimates are not available for this country." },
      { status: 422, headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    return Response.json(
      { error: "Currency conversion rates are currently unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const data = await response.json();
  const conversionRate = estimate.currency === "USD" ? 1 : Number(data?.rates?.[estimate.currency]);
  if (
    data?.result !== "success" ||
    data.base_code !== "USD" ||
    !Number.isFinite(conversionRate) ||
    conversionRate <= 0
  ) {
    return Response.json(
      { error: "The currency provider returned an invalid conversion rate." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    {
      country,
      currency: estimate.currency,
      type: "estimate",
      rates: {
        homeElectricityRate: estimate.householdElectricityUsd * conversionRate,
        publicElectricityRate:
          estimate.householdElectricityUsd * estimate.publicChargingMultiplier * conversionRate,
        petrolRate: estimate.gasolineUsd * conversionRate,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
