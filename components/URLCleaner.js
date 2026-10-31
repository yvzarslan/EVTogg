'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

export default function URLCleaner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const currentQuery = searchParams.toString();
    if (!currentQuery) return;

    const preservedParams = new URLSearchParams();
    if (pathname === "/compare") {
      for (const id of searchParams.getAll("ids")) preservedParams.append("ids", id);
    }

    const preservedQuery = preservedParams.toString();
    if (preservedQuery === currentQuery) return;

    const query = preservedQuery ? `?${preservedQuery}` : '';
    window.history.replaceState(null, '', `${pathname}${query}${window.location.hash}`);
  }, [searchParams, pathname]);

  return null;
}