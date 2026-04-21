"use client";
import React, { useState } from 'react';
import { Zap, Loader2, Maximize2 } from 'lucide-react';

export default function PlugShareWidget() {
  const [loading, setLoading] = useState(false);

  return (
    <section className="container mx-auto px-4 md:px-6 py-12">
      
      {/* Başlık Alanı - Tasarımınla Uyumlu */}
      <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-100">
            <Zap className="text-white" size={20} fill="white" />
          </div>
          Canlı Şarj Noktaları
        </h2>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          PLUGSHARE CANLI VERİ
        </div>
      </div>

      {/* Harita Çerçevesi */}
      <div className="relative w-full h-[600] rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
        
        {/* Yükleniyor Katmanı */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
            <p className="text-slate-600 font-black tracking-widest text-xs uppercase">İstasyonlar Yükleniyor...</p>
          </div>
        )}

        {/* PlugShare Resmi Widget */}
        <iframe
          src="https://www.plugshare.com/widget2.html?latitude=39.9334&longitude=32.8597&spanX=5&spanY=5"
          width="100%"
          height="100%"
          allow="geolocation; clipboard-write"
          onLoad={() => setLoading(false)}
          frameBorder="0"
          className="z-10 relative"
          title="PlugShare EV Map"
        ></iframe>

        {/* Harita Üstü Bilgi Notu */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 hidden md:block">
          <p className="text-white text-[10px] font-bold flex items-center gap-2 tracking-tight">
            <Maximize2 size={14} className="text-emerald-400" />
            HARİTAYI KAYDIRARAK ÇEVRENİZDEKİ İSTASYONLARI KEŞFEDİN
          </p>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 opacity-50">
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Hızlı Şarj (DC)
         </div>
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Standart Şarj (AC)
         </div>
      </div>
    </section>
  );
}