"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { getMessage } from '@/lib/i18n';

export default function ScrollToTop({
  scrollContainerRef = null,
  hideOnHome = false,
  bottomClassName = "bottom-6",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const pathname = usePathname();
  const isHidden = hideOnHome && pathname === "/";

  useEffect(() => {
    if (isHidden) return undefined;

    const scrollTarget = scrollContainerRef?.current || window;
    const updateVisibility = () => {
      const scrollPosition = scrollTarget === window ? window.scrollY : scrollTarget.scrollTop;
      setIsVisible(scrollPosition > 300);
    };

    updateVisibility();
    scrollTarget.addEventListener("scroll", updateVisibility, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", updateVisibility);
  }, [isHidden, scrollContainerRef]);

  const scrollToTop = () => {
    const scrollTarget = scrollContainerRef?.current || window;
    scrollTarget.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && !isHidden && (
        <button
          type="button"
          onClick={scrollToTop}
          className={`fixed ${bottomClassName} right-6 z-[60] rounded-full bg-blue-500 p-3 text-white shadow-2xl transition-all duration-300 hover:bg-blue-600`}
          aria-label={getMessage(language, "scrollToTop")}
        >
          <svg
            className="h-6 w-6"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="m5 10 7-7 7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
}