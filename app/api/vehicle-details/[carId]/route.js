import { scrapeEVData } from "@/lib/scraper";
import { getVehicleDetails } from "@/lib/vehicleDetails";

export async function GET(_request, { params }) {
  const { carId } = await params;
  if (!/^car-\d+$/.test(carId)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const car = (await scrapeEVData({})).find((vehicle) => vehicle.id === carId);
  if (!car) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const details = await getVehicleDetails(car);
  const imageBaseUrl = `/api/vehicle-image/${encodeURIComponent(car.id)}`;

  return Response.json(
    {
      car: {
        ...car,
        image: imageBaseUrl,
        battery: details.battery,
        range: details.range,
        efficiency: details.efficiency,
      },
      images: details.images.map((_, index) => `${imageBaseUrl}/${index}`),
      sourceAvailable: details.sourceAvailable,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
