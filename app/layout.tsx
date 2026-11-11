// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react'; // 1. Adım: Suspense'i import et
import URLCleaner from '@/components/URLCleaner';
import ScrollToTop from '@/components/ScrollToTop'; // 1. Adım: Import et
import { getMessage } from '@/lib/i18n';
import { getRequestLanguage } from '@/lib/requestLanguage';
import { LanguageProvider } from '@/components/LanguageProvider';
import SiteHeader from '@/components/SiteHeader';

const inter = Inter({ subsets: ['latin'] });
export async function generateMetadata() {
  const language = await getRequestLanguage();
  return {
    title: getMessage(language, 'metaTitle'),
    description: getMessage(language, 'metaDescription'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = await getRequestLanguage();

  return (
    <html lang={language} className="scroll-smooth">
      <body className={inter.className}>
        <LanguageProvider initialLanguage={language}>
          <Suspense fallback={null}>
            <URLCleaner />
          </Suspense>
          <SiteHeader />
          {children}
          <ScrollToTop hideOnHome />
        </LanguageProvider>
      </body>
    </html>
  );
}