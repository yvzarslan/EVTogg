// app/layout.js
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { Suspense } from 'react'; // 1. Adım: Suspense'i import et
import URLCleaner from '@/components/URLCleaner';
import ScrollToTop from '@/components/ScrollToTop'; // 1. Adım: Import et
import { showChargingStations, showVehicleNews } from '@/lib/features';
import { defaultLanguage, getMessage, normalizeLanguage } from '@/lib/i18n';
import { LanguageProvider } from '@/components/LanguageProvider';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({ subsets: ['latin'] });
export async function generateMetadata() {
  const language = normalizeLanguage((await cookies()).get('ev-platform-language')?.value || defaultLanguage);
  return {
    title: getMessage(language, 'metaTitle'),
    description: getMessage(language, 'metaDescription'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = normalizeLanguage((await cookies()).get('ev-platform-language')?.value || defaultLanguage);

  return (
    <html lang={language} className="scroll-smooth">
      <body className={inter.className}>
        <LanguageProvider initialLanguage={language}>
          <Suspense fallback={null}>
            <URLCleaner />
          </Suspense>
          <SiteHeader showVehicleNews={showVehicleNews} showChargingStations={showChargingStations} />
          {children}
          <ScrollToTop hideOnHome />
        </LanguageProvider>
      </body>
    </html>
  );
}