'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

export default function URLCleaner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // URL'de ?brand=... gibi bir parametre varsa temizle
    if (searchParams.toString()) {
      // Sayfayı yenilemeden sadece URL'i (toggsuv.com) yapar
      window.history.replaceState(null, '', pathname);
    }
  }, [searchParams, pathname]);

  return null;
}