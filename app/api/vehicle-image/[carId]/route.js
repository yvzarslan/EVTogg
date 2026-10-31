import { getVehicleImageResponse } from "@/lib/vehicleImage";

export async function GET(_request, { params }) {
  const { carId } = await params;
  return getVehicleImageResponse(carId);
}
