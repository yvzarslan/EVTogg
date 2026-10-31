"use client";

import { createContext, useContext, useMemo, useState } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children, initialFilters }) {
  const [filters, setFilters] = useState({
    brand: initialFilters.brand || "",
    range: initialFilters.range || 660,
    accel: initialFilters.accel || 10,
    segment: initialFilters.segment || "",
    bodyStyle: initialFilters.bodyStyle || "",
  });
  const [hasActiveFilters, setHasActiveFilters] = useState(true);

  const value = useMemo(() => ({
    filters,
    hasActiveFilters,
    updateFilters(updater) {
      setFilters(updater);
      setHasActiveFilters(true);
    },
  }), [filters, hasActiveFilters]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters must be used within FilterProvider");
  return context;
}
