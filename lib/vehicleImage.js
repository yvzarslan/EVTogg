import { scrapeEVData } from "@/lib/scraper";
import { getVehicleDetails } from "@/lib/vehicleDetails";

const IMAGE_HOST = "ev-database.org";

export async function getVehicleImageResponse(carId, imageIndex = null) {
  if (!/^car-\d+$/.test(carId)) {
    return new Response("Not found", { status: 404 });
  }

  const car = (await scrapeEVData({})).find((item) => item.id === carId);
  if (!car) {
    return new Response("Not found", { status: 404 });
  }

  const sourceImage = imageIndex === null
    ? car.image
    : (await getVehicleDetails(car)).images[imageIndex];

  if (!sourceImage) {
    return new Response("Not found", { status: 404 });
  }

  const imageUrl = new URL(sourceImage);
  if (imageUrl.protocol !== "https:" || imageUrl.hostname !== IMAGE_HOST) {
    return new Response("Invalid image source", { status: 502 });
  }

  const upstream = await fetch(imageUrl, { next: { revalidate: 86400 } });
  if (!upstream.ok || new URL(upstream.url).hostname !== IMAGE_HOST) {
    return new Response("Image unavailable", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    return new Response("Invalid image response", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
