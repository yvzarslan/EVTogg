import Image from "next/image";
import { vehicleSpecifications } from "@/lib/vehicleSpecifications";

export default function EVCard({ car, isSelected, onSelect }) {
  if (!car) return null;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.65)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_100px_-35px_rgba(59,130,246,0.5)] ${
        isSelected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-200/80'
      }`}
    >
      <div className="absolute right-4 top-4 z-10">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-300'
        }`}>
          {isSelected && <span className="text-sm font-bold">✓</span>}
        </div>
      </div>

      <div className="rounded-b-[2rem] bg-gradient-to-br from-slate-100 via-white to-blue-50 p-5">
        <div className="relative h-44 overflow-hidden rounded-[1.5rem] bg-white/80">
          <Image
            src={car.image}
            alt={car.brand}
            width={600}
            height={240}
            className="h-full w-full object-contain transition-all duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-xl font-extrabold leading-tight text-slate-900">
              <span className="block">{car.brand}</span>
              <span className="mt-1 block font-medium text-slate-500">{car.model}</span>
            </h3>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2">
          {vehicleSpecifications.map(({ label, key }) => (
            <div key={key} className="min-w-0 rounded-xl bg-slate-50 p-3">
              <span className="block text-[10px] font-bold leading-tight text-slate-500">{label}</span>
              <b className="mt-1 block break-words text-sm text-slate-900">{car[key] || "—"}</b>
            </div>
          ))}
        </div>

        <button className={`mt-6 w-full rounded-2xl py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${
          isSelected ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white hover:bg-blue-600'
        }`}>
          {isSelected ? 'LİSTEDEN ÇIKAR' : 'KIYASLAMAYA EKLE'}
        </button>
      </div>
    </div>
  );
}