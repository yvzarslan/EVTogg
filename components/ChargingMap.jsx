"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader2, RotateCw, Zap } from "lucide-react";

const ChargingStationsMap = dynamic(() => import("./ChargingStationsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse bg-slate-100 md:h-[560px]" />
  ),
});

export default function ChargingMap() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStations() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/charging-stations", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Şarj istasyonları yüklenemedi.");
        }

        if (!Array.isArray(data.stations)) {
          throw new Error("Şarj istasyonu verisi geçersiz.");
        }

        setStations(data.stations);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Şarj istasyonları yüklenemedi."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStations();

    return () => controller.abort();
  }, [retryCount]);

  return (
    <section className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500 p-2.5 shadow-[0_20px_45px_rgba(16,185,129,0.35)]">
            <Zap className="text-white" size={20} fill="white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Şarj Noktaları</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 md:self-auto">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {loading ? "İstasyonlar yükleniyor" : `${stations.length} istasyon · İstanbul`}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-[0_35px_100px_-45px_rgba(22,163,74,0.45)]">
        <ChargingStationsMap stations={stations} />

        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="mb-4 animate-spin text-emerald-600" size={40} />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-600">
              İstasyonlar yükleniyor...
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/95 p-6 text-center">
            <p className="font-semibold text-slate-700">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <RotateCw size={16} />
              Yeniden dene
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
