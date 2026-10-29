"use client";
import { useState } from 'react';
import { showChargingStations, showVehicleNews } from '@/lib/features';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-blue-300 transition hover:bg-white/10 focus:outline-none"
        aria-label="Mobil menü"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[220px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-col divide-y divide-slate-800">
            {[
              ['Haberler', '#haberler', showVehicleNews],
              ['Şarj Noktaları', '#sarj', showChargingStations],
            ].map(([label, href, enabled = true]) => enabled && (
              <a
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                className="px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-blue-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}