"use client";
import { useState } from 'react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Butonu */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-blue-400 focus:outline-none"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        )}
      </button>

      {/* Açılır Menü Paneli */}
      {isOpen && (
        <div className="absolute top-[73] left-0 right-0 bg-[#0b1120] border-b border-gray-800 flex flex-col items-center py-6 gap-6 text-lg font-medium shadow-xl z-50">
          <a href="#hero" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition">Ana Sayfa</a>
          <a href="#araclar" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition">Araçlar</a>
          <a href="#haberler" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition">Haberler</a>
          <a href="#sarj" onClick={() => setIsOpen(false)} className="hover:text-blue-400 transition">Şarj Noktaları</a>
        </div>
      )}
    </div>
  );
}