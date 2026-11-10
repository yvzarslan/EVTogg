import Image from "next/image";
import { vehicleSpecifications } from "@/lib/vehicleSpecifications";
import { vehicleSpecificationIcons } from "@/lib/vehicleSpecificationIcons";
import { useLanguage } from "./LanguageProvider";
import { getMessage, getSpecificationLabel, getVehicleValue } from "@/lib/i18n";

export default function EVCard({ car, isSelected, onSelect, onDetails }) {
  const { language } = useLanguage();
  if (!car) return null;

  return (
    <div
      className={`group relative flex h-full w-full max-w-[420px] flex-col overflow-hidden rounded-[2rem] border bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.65)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_100px_-35px_rgba(59,130,246,0.5)] ${
        isSelected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-200/80'
      }`}
    >
      <div className="absolute right-4 top-4 z-10">
        <button
          type="button"
          onClick={onSelect}
          aria-label={getMessage(language, isSelected ? "removeFromCompare" : "addToCompare")}
          aria-pressed={isSelected}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-300'
          }`}
        >
          {isSelected && <span className="text-sm font-bold">✓</span>}
        </button>
      </div>

      <div className="rounded-b-[2rem] bg-gradient-to-br from-slate-100 via-white to-blue-50 p-5">
        <button
          type="button"
          onClick={onDetails}
          aria-label={`${car.brand} ${car.model}`}
          className="relative block h-44 w-full overflow-hidden rounded-[1.5rem] bg-white/80"
        >
          <Image
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="(max-width: 640px) 100vw, 420px"
            className="object-contain transition-all duration-500 group-hover:scale-110"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4">
          <div className="w-full min-w-0">
            <button
              type="button"
              onClick={onDetails}
              aria-label={`${car.brand} ${car.model}`}
              className="group/vehicleTitle block w-full cursor-pointer rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <h3 className="w-full text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover/vehicleTitle:text-blue-700 sm:text-xl">
                <span className="block">{car.brand}</span>
                <span className="mt-1 block max-w-full font-medium text-slate-500 underline decoration-blue-400 decoration-1 underline-offset-4 [overflow-wrap:anywhere]">{car.model}</span>
              </h3>
            </button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2">
          {vehicleSpecifications.map(({ label, key }) => {
            const Icon = vehicleSpecificationIcons[key];
            return (
              <div key={key} className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 p-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Icon aria-hidden="true" size={16} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold leading-tight text-slate-500">{getSpecificationLabel(language, key) || label}</span>
                  <b className="mt-1 block break-words text-sm text-slate-900">{getVehicleValue(language, car, key) || "—"}</b>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          className={`mt-6 w-full rounded-2xl py-3 text-xs font-black uppercase tracking-[0.14em] transition-all ${
          isSelected ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white hover:bg-blue-600'
          }`}
        >
          {getMessage(language, isSelected ? "removeFromCompare" : "addToCompare")}
        </button>
      </div>
    </div>
  );
}