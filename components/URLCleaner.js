'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

const APP_QUERY_PARAMS = new Set([
  'brand',
  'range',
  'accel',
  'segment',
  'bodyStyle',
  'ids',
]);

export default function URLCleaner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const currentQuery = searchParams.toString();
    if (!currentQuery) return;

    const appParams = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (APP_QUERY_PARAMS.has(key)) appParams.append(key, value);
    }

    const preservedQuery = appParams.toString();
    if (preservedQuery === currentQuery) return;

    const query = preservedQuery ? `?${preservedQuery}` : '';
    window.history.replaceState(null, '', `${pathname}${query}${window.location.hash}`);
  }, [searchParams, pathname]);

  return null;
}