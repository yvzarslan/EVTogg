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
  return Response.json(
    { power: details.power },
    { headers: { "Cache-Control": "no-store" } }
  );
}
