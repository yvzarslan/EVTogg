// /app/api/cars/route.js
import { scrapeEVData } from "@/lib/scraper";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const filters = {
    brand: searchParams.get("brand") || "",
    range: searchParams.get("range") || "",
    accel: searchParams.get("accel") || "",
  };

  const cars = await scrapeEVData(filters);

  return Response.json(cars);
}