import { getVehicleImageResponse } from "@/lib/vehicleImage";

export async function GET(_request, { params }) {
  const { carId, imageIndex } = await params;

  if (!/^\d+$/.test(imageIndex)) {
    return new Response("Invalid image index", { status: 400 });
  }

  return getVehicleImageResponse(carId, Number(imageIndex));
}
