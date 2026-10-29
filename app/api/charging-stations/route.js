const ISTANBUL_BOUNDS = "40.75,27.9,41.7,29.95";
const ISTANBUL_BOUNDARY = {
  south: 40.75,
  west: 27.9,
  north: 41.7,
  east: 29.95,
};
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OPEN_CHARGE_MAP_URL = "https://api.openchargemap.io/v3/poi/";
const CACHE_DURATION = 30 * 60 * 1000;
let cachedResponse = null;
let lastFetchTime = 0;

export async function GET() {
  if (cachedResponse && Date.now() - lastFetchTime < CACHE_DURATION) {
    return Response.json(cachedResponse);
  }

  const query = `
    [out:json][timeout:30];
    (
      nwr["amenity"="charging_station"](${ISTANBUL_BOUNDS});
      nwr["man_made"="charge_point"](${ISTANBUL_BOUNDS});
    );
    out center tags;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "EVPlatform/1.0 (Istanbul charging stations map)",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      throw new Error(`Overpass API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.elements)) {
      throw new Error("Overpass API returned an invalid response");
    }

    const openStreetMapStations = data.elements.flatMap((element) => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;

      if (!isInIstanbul(latitude, longitude)) {
        return [];
      }

      const tags = element.tags ?? {};

      return [{
        id: `${element.type}-${element.id}`,
        latitude,
        longitude,
        name: tags.name || tags.operator || tags.brand || "Şarj istasyonu",
        operator: tags.operator || "",
        brand: tags.brand || "",
      }];
    });

    const openChargeMapKey = process.env.OPEN_CHARGE_MAP_API_KEY;
    let openChargeMapStations = [];

    if (openChargeMapKey) {
      try {
        const openChargeMapUrl = new URL(OPEN_CHARGE_MAP_URL);
        openChargeMapUrl.search = new URLSearchParams({
          output: "json",
          countrycode: "TR",
          latitude: "41.0082",
          longitude: "28.9784",
          distance: "75",
          distanceunit: "KM",
          maxresults: "5000",
        }).toString();

        const openChargeMapResponse = await fetch(openChargeMapUrl, {
          headers: {
            "x-api-key": openChargeMapKey,
            "User-Agent": "EVPlatform/1.0 (Istanbul charging stations map)",
          },
          signal: AbortSignal.timeout(45000),
        });

        if (!openChargeMapResponse.ok) {
          throw new Error(`Open Charge Map request failed: ${openChargeMapResponse.status}`);
        }

        const openChargeMapData = await openChargeMapResponse.json();

        if (!Array.isArray(openChargeMapData)) {
          throw new Error("Open Charge Map returned an invalid response");
        }

        openChargeMapStations = openChargeMapData.flatMap((station) => {
          const address = station.AddressInfo;
          const latitude = address?.Latitude;
          const longitude = address?.Longitude;

          if (!isInIstanbul(latitude, longitude)) {
            return [];
          }

          const operator = station.OperatorInfo?.Title || "";

          return [{
            id: `ocm-${station.ID}`,
            latitude,
            longitude,
            name: address.Title || operator || "Şarj istasyonu",
            operator,
            brand: "",
          }];
        });
      } catch (error) {
        console.error("Open Charge Map verisi alınamadı:", error);
      }
    }

    const stations = [...openStreetMapStations];

    for (const station of openChargeMapStations) {
      if (!stations.some((existing) => areNearby(existing, station))) {
        stations.push(station);
      }
    }

    cachedResponse = {
      stations,
      sourceCounts: {
        openStreetMap: openStreetMapStations.length,
        openChargeMap: openChargeMapStations.length,
      },
      openChargeMapConfigured: Boolean(openChargeMapKey),
    };
    lastFetchTime = Date.now();

    return Response.json(cachedResponse);
  } catch (error) {
    console.error("Şarj istasyonları alınamadı:", error);
    return Response.json(
      { message: "Şarj istasyonları şu anda yüklenemiyor." },
      { status: 502 }
    );
  }
}

function isInIstanbul(latitude, longitude) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= ISTANBUL_BOUNDARY.south &&
    latitude <= ISTANBUL_BOUNDARY.north &&
    longitude >= ISTANBUL_BOUNDARY.west &&
    longitude <= ISTANBUL_BOUNDARY.east
  );
}

function areNearby(first, second) {
  const latitudeDifference = (first.latitude - second.latitude) * 111_000;
  const longitudeDifference =
    (first.longitude - second.longitude) *
    111_000 *
    Math.cos((first.latitude * Math.PI) / 180);

  return Math.hypot(latitudeDifference, longitudeDifference) < 50;
}
