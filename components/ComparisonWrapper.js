"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EVCard from "./EVCard";
import VehicleComparison from "./VehicleComparison";
import VehicleDetails from "./VehicleDetails";
import ScrollToTop from "./ScrollToTop";
import { useLanguage } from "./LanguageProvider";
import { useFilters } from "./FilterProvider";
import { getMessage } from "@/lib/i18n";

function matchesFilters(car, filters, activeFilters) {
  const brand = filters.brand?.toLowerCase();
  const range = Number(filters.range);
  const accel = Number(filters.accel);

  if (filters.model && (activeFilters.includes("brand") || activeFilters.includes("model"))) {
    return (!brand || car.brand.toLowerCase() === brand)
      && car.model.toLocaleLowerCase() === filters.model.toLocaleLowerCase();
  }

  if (activeFilters.includes("brand") && brand && car.brand.toLowerCase() !== brand) return false;
  if ((activeFilters.includes("brand") || activeFilters.includes("model")) && filters.model
    && car.model.toLocaleLowerCase() !== filters.model.toLocaleLowerCase()) return false;
  if (activeFilters.includes("segment") && filters.segment && car.segmentCode !== filters.segment) return false;
  if (activeFilters.includes("bodyStyle") && filters.bodyStyle && car.bodyStyleCode !== filters.bodyStyle) return false;
  if (activeFilters.length > 0 && range && Number.parseFloat((car.range || "").replace(/[^\d.]/g, "")) < range) return false;
  if (activeFilters.length > 0 && accel && Number.parseFloat((car.accel || "").replace(/[^\d.]/g, "")) > accel) return false;
  return true;
}

function getRangeValue(car) {
  return Number.parseFloat(String(car.range || "").replace(/[^\d.]/g, "")) || 0;
}

export default function ComparisonWrapper({ allCars }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAllCars, setShowAllCars] = useState(false);
  const [detailCar, setDetailCar] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const comparisonScrollRef = useRef(null);
  const detailRequestRef = useRef(0);
  const { language } = useLanguage();
  const { filters, activeFilters, hasActiveFilters } = useFilters();
  const featuredCars = [...allCars]
    .sort((a, b) => getRangeValue(b) - getRangeValue(a))
    .filter((car, index, cars) =>
      cars.findIndex((candidate) => candidate.brand === car.brand) === index
    )
    .slice(0, 3);
  const matchingCars = hasActiveFilters
    ? allCars.filter((car) => matchesFilters(car, filters, activeFilters))
    : allCars;
  const visibleCars = hasActiveFilters || showAllCars ? matchingCars : featuredCars;
  const detailCarName = detailCar
    ? detailCar.model.toLocaleLowerCase(language).startsWith(`${detailCar.brand} `.toLocaleLowerCase(language))
      ? detailCar.model
      : `${detailCar.brand} ${detailCar.model}`
    : "";

  useEffect(() => {
    if (!detailCar && !showComparison) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (detailCar && !showComparison) {
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          if (isPhotoExpanded) {
            setIsPhotoExpanded(false);
          } else {
            setDetailCar(null);
          }
        } else if (isPhotoExpanded && event.key === "ArrowLeft") {
          window.dispatchEvent(new CustomEvent("vehicle-photo-navigation", { detail: -1 }));
        } else if (isPhotoExpanded && event.key === "ArrowRight") {
          window.dispatchEvent(new CustomEvent("vehicle-photo-navigation", { detail: 1 }));
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        root.style.overflow = previousRootOverflow;
        body.style.overflow = previousBodyOverflow;
      };
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [detailCar, isPhotoExpanded, showComparison]);

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
    setIsPhotoExpanded(false);
    setDetailCar(car);
    setDetailData({
      car,
      images: car.image ? [car.image] : [],
      sourceAvailable: true,
    });
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
    setIsPhotoExpanded(false);
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
          aria-label={detailCarName}
          className="fixed inset-0 z-[1200] overflow-y-auto bg-slate-900/55 p-0 backdrop-blur-sm sm:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeVehicleDetails();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              if (isPhotoExpanded) {
                setIsPhotoExpanded(false);
              } else {
                closeVehicleDetails();
              }
            }
          }}
        >
          <div className="relative mx-auto min-h-full max-w-[1320px] overflow-hidden bg-[#f5f7fa] shadow-2xl sm:rounded-[26px]">
            <button
              type="button"
              onClick={closeVehicleDetails}
              aria-label={getMessage(language, "close")}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-bold text-slate-700 shadow-md transition hover:border-lime-400 hover:bg-lime-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
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
                isPhotoExpanded={isPhotoExpanded}
                onPhotoExpandedChange={setIsPhotoExpanded}
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
          {visibleCars.length > 0 ? (
            <div
              className="ev-car-grid grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleCars.map((car) => (
                <EVCard
                  key={car.id}
                  car={car}
                  isSelected={selectedCars.some((c) => c.id === car.id)}
                  onSelect={() => evcarleSelection(car)}
                  onDetails={() => showVehicleDetails(car)}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
              {getMessage(language, "noMatchingCars")}
            </div>
          )}

          {!hasActiveFilters && !showAllCars && matchingCars.length > visibleCars.length && (
            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={() => setShowAllCars(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
              >
                {getMessage(language, "viewAllModels")}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

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
                  className="w-full rounded-full bg-[#9bea21] px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-[#8bd91a] md:w-auto"
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