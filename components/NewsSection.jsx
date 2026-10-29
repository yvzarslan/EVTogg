"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react'; 
import { Loader2, Newspaper, Play } from 'lucide-react';
import { getLiveNews } from '@/lib/api';
import { useLanguage } from './LanguageProvider';
import { getMessage } from '@/lib/i18n';

export default function NewsSection({ filters }) {
  const { language } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initNews() {
      setLoading(true);
      const data = await getLiveNews(filters.brand);
      setNews(data);
      setLoading(false);
    }
    initNews();
  }, [filters.brand]);
   
  return (
    // container ve mx-auto sayesinde içeriği merkeze alır ve yanlardan boşluk bırakır
    // px-4 veya px-6 mobilde kenarlara yapışmasını engeller
    <section className="container mx-auto px-4 md:px-6 py-12">
      
      {/* Başlık Alanı */}
      <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Newspaper className="text-white" size={20} />
          </div>
          {filters.brand ? `${filters.brand} ${getMessage(language, "news")}` : getMessage(language, "newsTitle")}
        </h2>
        <div className="hidden md:block text-sm text-slate-400 font-medium">
          {getMessage(language, "liveData")}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 text-sm italic">{getMessage(language, "loadingNews")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* HABERLER (SOL VE ORTA KOLON) */}
          <div className="lg:col-span-2">
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white rounded-[4xl] border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-500"
                  >
                    <div className="relative h-48 w-full bg-slate-50">
                      <Image
                        src={item.urlToImage ? `https://images.weserv.nl/?url=${encodeURIComponent(item.urlToImage)}&w=400&h=250&fit=cover` : 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400'}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                          {item.source.name}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-[4xl] p-12 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">{getMessage(language, "noNews")}</p>
              </div>
            )}
          </div>
           
          {/* SAĞ KOLON (VİDEOLAR VEYA EK BİLGİ) */}
          {/* SAĞ KOLON (VİDEOLAR) */}
<div className="lg:col-span-1">
  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-8">
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
      <Play className="text-red-500 fill-red-500" size={20} /> 
      {filters.brand ? `${filters.brand} ${getMessage(language, "review")}` : getMessage(language, "featuredVideo")}
    </h3>
    
    <div className="space-y-6">
      {/* TEK VİDEO GÖSTERİMİ: Arama Tabanlı Embed */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
        <iframe
          // BU SATIR ÇOK ÖNEMLİ: Marka değişince videoyu yeniler
          key={filters.brand || 'default'} 
          width="100%"
          height="100%"
          // 'q' parametresi arama terimidir. 'elektrikli araç inceleme' ekleyerek özelleştirdik.
          src={`https://www.youtube.com/embed?listType=search&q=${encodeURIComponent((filters.brand || '') + " " + (language === "ru" ? "обзор электромобиля" : language === "en" ? "electric car review" : language === "zh" ? "电动汽车评测" : "elektrikli araç inceleme türkçe"))}&modestbranding=1&rel=0`}
          title={`${filters.brand || getMessage(language, "vehicleList")} ${getMessage(language, "reviewVideo")}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>

      <div className="space-y-4">
        <p className="text-slate-400 text-sm leading-relaxed italic">
          {filters.brand 
            ? getMessage(language, "youtubeBrandDescription").replace("{brand}", filters.brand)
            : getMessage(language, "youtubeDescription")}
        </p>
        
        {/* YouTube'a Yönlendirme Butonu */}
        <a 
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent((filters.brand || '') + " elektrikli araç inceleme")}&sp=CAI%253D`} // sp=CAI%253D güncele göre sıralar
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors bg-blue-950 px-4 py-2 rounded-full"
        >
          {getMessage(language, "youtubeMore")} <Newspaper size={12} />
        </a>
      </div>
    </div>
  </div>
</div>

        </div>
      )}
    </section>
  );
}