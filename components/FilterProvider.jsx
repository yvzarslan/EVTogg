"use client";

import { createContext, useContext, useMemo, useState } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children, initialFilters }) {
  const [filters, setFilters] = useState({
    brand: initialFilters.brand || "",
    model: initialFilters.model || "",
    range: initialFilters.range || 660,
    accel: initialFilters.accel || 10,
    segment: initialFilters.segment || "",
    bodyStyle: initialFilters.bodyStyle || "",
  });
  const [activeFilters, setActiveFilters] = useState(() => Object.entries(initialFilters)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key));

  const value = useMemo(() => ({
    filters,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    updateFilters(updater, filterKey) {
      setFilters(updater);
      setActiveFilters((current) => current.includes(filterKey) ? current : [...current, filterKey]);
    },
  }), [filters, activeFilters]);

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
