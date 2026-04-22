'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function URLCleaner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Sekme Başlığını Değiştir (Görselde istediğin "EV" yazısı için)
    document.title = "EV | ToggSUV"; 

    // 2. URL'deki parametreleri temizle (Sadece domain kalsın diye)
    if (searchParams.toString()) {
      // window.location.pathname genellikle "/" döndürür. 
      // Bu sayede adres çubuğu sadece toggsuv.com olur.
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams]);

  return null;
}