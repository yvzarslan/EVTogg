"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EVCard from "./EVCard";
import VehicleComparison from "./VehicleComparison";
import VehicleDetails from "./VehicleDetails";
import ScrollToTop from "./ScrollToTop";
import { useLanguage } from "./LanguageProvider";
import { getMessage } from "@/lib/i18n";

export default function ComparisonWrapper({ displayCars }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [detailCar, setDetailCar] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState("");
  const comparisonScrollRef = useRef(null);
  const detailRequestRef = useRef(0);
  const { language } = useLanguage();

  useEffect(() => {
    if (!detailCar || showComparison) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setDetailCar(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [detailCar, showComparison]);

  const evcarleSelection = (car) => {
    setSelectedCars((prev) => {
      const isSelected = prev.find((c) => c.id === car.id);
      if (isSelected) return prev.filter((c) => c.id !== car.id);
      if (prev.length < 4) return [...prev, car];
      return prev;
    });
  };

  const goToCompare = () => {
    setShowComparison(true);
  };

  const showVehicleDetails = async (car) => {
    const requestId = ++detailRequestRef.current;
    setDetailCar(car);
    setDetailData(null);
    setDetailError("");
    setIsLoadingDetails(true);

    try {
      const response = await fetch(`/api/vehicle-details/${encodeURIComponent(car.id)}`);
      if (!response.ok) {
        throw new Error(`Vehicle details request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (requestId === detailRequestRef.current) setDetailData(data);
    } catch (error) {
      console.error(`Araç detayları yüklenemedi (${car.id}):`, error);
      if (requestId === detailRequestRef.current) {
        setDetailError(getMessage(language, "vehicleDetailsError"));
      }
    } finally {
      if (requestId === detailRequestRef.current) setIsLoadingDetails(false);
    }
  };

  const closeVehicleDetails = () => {
    detailRequestRef.current += 1;
    setDetailCar(null);
    setDetailData(null);
    setDetailError("");
  };

  return (
    <>
      {detailCar && !showComparison && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${detailCar.brand} ${detailCar.model}`}
          className="fixed inset-0 z-[1200] overflow-y-auto bg-slate-950/70 p-0 backdrop-blur-sm sm:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeVehicleDetails();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeVehicleDetails();
          }}
        >
          <div className="relative mx-auto min-h-full max-w-7xl overflow-hidden bg-slate-50 shadow-2xl sm:rounded-[2rem]">
            <button
              type="button"
              onClick={closeVehicleDetails}
              aria-label={getMessage(language, "close")}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-bold text-slate-700 shadow-md transition hover:bg-slate-100"
            >
              ×
            </button>
            {isLoadingDetails && (
              <p className="p-8 text-center text-sm font-semibold text-slate-600" role="status">
                {getMessage(language, "loadingVehicleDetails")}
              </p>
            )}
            {detailError && (
              <p className="p-8 text-center text-sm font-semibold text-red-600" role="alert">
                {detailError}
              </p>
            )}
            {detailData && (
              <VehicleDetails
                car={detailData.car}
                images={detailData.images}
                sourceAvailable={detailData.sourceAvailable}
                onClose={closeVehicleDetails}
              />
            )}
          </div>
        </div>
      )}
      {showComparison ? (
        <div className="fixed inset-0 z-[1100] bg-slate-100">
          <div ref={comparisonScrollRef} className="h-full overflow-y-auto">
            <VehicleComparison selectedCars={selectedCars} onEditSelection={() => setShowComparison(false)} />
          </div>
          <ScrollToTop scrollContainerRef={comparisonScrollRef} />
        </div>
      ) : (
        <>
          <ScrollToTop
            bottomClassName={selectedCars.length > 0 ? "bottom-56 md:bottom-32" : "bottom-6"}
          />
          <div
            className="grid w-full justify-items-center gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}
          >
            {displayCars.map((car) => (
              <EVCard
                key={car.id}
                car={car}
                isSelected={selectedCars.some((c) => c.id === car.id)}
                onSelect={() => evcarleSelection(car)}
                onDetails={() => showVehicleDetails(car)}
              />
            ))}
          </div>

          {selectedCars.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-slate-200 bg-white/90 p-4 shadow-[0_-15px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-5">
              <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {selectedCars.map((car) => (
                    <div key={car.id} className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 pr-8">
                      <div className="relative h-8 w-10 overflow-hidden rounded-lg bg-white">
                        <Image src={car.image} alt={car.model} fill className="object-contain" sizes="40px" />
                      </div>
                      <span className="max-w-[90px] truncate text-xs font-bold text-slate-800">{car.model}</span>
                      <button onClick={() => evcarleSelection(car)} className="absolute right-2 text-sm font-black text-red-500">✕</button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={goToCompare}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(59,130,246,0.4)] transition hover:bg-blue-500 md:w-auto"
                >
                  {getMessage(language, "compare")} ({selectedCars.length})
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}