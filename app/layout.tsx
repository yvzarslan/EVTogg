// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react'; // 1. Adım: Suspense'i import et
import URLCleaner from '@/components/URLCleaner';

const inter = Inter({ subsets: ['latin'] });
// SEKMEDE YAZACAK BAŞLIK BURADA TANIMLANIR
export const metadata = {
  title: 'EV', 
  description: 'Elektrikli Araç Platformu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth"> 
      <body className={inter.className}>
        {/* URL'yi canlıda temizleyen bileşen */}
        <Suspense fallback={null}>
          <URLCleaner />
        </Suspense>
        <nav className="bg-[#0b1120] text-white p-4 sticky top-0 z-50 border-b border-gray-800">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-400">EV</span> 
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium"> 
              <a href="#hero" className="hover:text-blue-400">Ana Sayfa</a>
              <a href="#araclar" className="hover:text-blue-400">Araçlar</a>
              <a href="#haberler" className="hover:text-blue-400">Haberler</a> 
              <a href="#sarj" className="hover:text-blue-400">Şarj Noktaları</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}