// app/layout.js
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Suspense } from 'react'; // 1. Adım: Suspense'i import et
import URLCleaner from '@/components/URLCleaner';
import MobileMenu from '@/components/MobileMenu'; // Menüyü içe aktar
import ScrollToTop from '@/components/ScrollToTop'; // 1. Adım: Import et
import { showChargingStations, showVehicleNews } from '@/lib/features';

const inter = Inter({ subsets: ['latin'] });
// SEKMEDE YAZACAK BAŞLIK BURADA TANIMLANIR
export const metadata = {
  title: 'EV Platform | Elektrikli Araç Karşılaştırma',
  description: 'Elektrikli araçları keşfet ve karşılaştır.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <URLCleaner />
        </Suspense>

        <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-950/80 text-white backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/#hero" className="flex items-center gap-3" aria-label="Ana sayfa">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 text-sm font-black text-slate-950 shadow-lg shadow-blue-500/30">
                E
              </span>
              <div className="leading-none">
                <div className="text-sm font-black tracking-[0.18em] text-slate-200 uppercase">Platform</div>
              </div>
            </Link>

            <div className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
              {showVehicleNews && <a href="#haberler" className="transition hover:text-blue-300">Haberler</a>}
              {showChargingStations && <a href="#sarj" className="transition hover:text-blue-300">Şarj Noktaları</a>}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#araclar"
                className="hidden rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-bold tracking-[0.12em] text-blue-200 transition hover:bg-blue-500/20 sm:inline-flex"
              >
                Hızlı Sorgula
              </a>
              <MobileMenu />
            </div>
          </div>
        </nav>

        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}