"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EVCard from "./EVCard";

export default function ComparisonWrapper({ displayCars }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const router = useRouter();

  const toggleSelection = (car) => {
    setSelectedCars((prev) => {
      const isSelected = prev.find((c) => c.id === car.id);
      if (isSelected) return prev.filter((c) => c.id !== car.id);
      if (prev.length < 4) return [...prev, car];
      return prev;
    });
  };

  const goToCompare = () => {
    const ids = selectedCars.map(c => c.id).join(",");
    router.push(`/compare?ids=${ids}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayCars.map((car) => (
          <EVCard 
            key={car.id} 
            car={car} 
            isSelected={selectedCars.some(c => c.id === car.id)}
            onSelect={() => toggleSelection(car)} 
          />
        ))}
      </div>

      {selectedCars.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_-15px_50px_rgba(0,0,0,0.1)] border-t p-5 z-[1000] animate-in slide-in-from-bottom duration-500">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-3">
              {selectedCars.map((car) => (
                <div key={car.id} className="relative bg-slate-50 p-2 pr-8 rounded-xl border flex items-center gap-2">
                  <img src={car.image} className="w-10 h-8 object-contain" alt="" />
                  <span className="text-xs font-bold truncate max-w-[80px]">{car.model}</span>
                  <button onClick={() => toggleSelection(car)} className="absolute right-2 text-red-500 font-bold">✕</button>
                </div>
              ))}
            </div>
            <button 
              onClick={goToCompare}
              className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              KARŞILAŞTIR ({selectedCars.length})
            </button>
          </div>
        </div>
      )}
    </>
  );
}