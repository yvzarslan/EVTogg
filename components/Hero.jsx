"use client";
import { motion } from 'framer-motion';
import { Image } from 'lucide-react'; 

export default function Hero() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-linear-to-b from-slate-900 to-blue-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <img src="/togg.jpg" className="w-full h-full object-cover object-scale-down" alt="Togg"  />
      </motion.div>
      
      <div className="relative z-10 text-center text-white p-4">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold mb-4"
        >
          Elektrikli Gelecek Burada
        </motion.h1>
        <p className="text-xl opacity-90 mb-50">Türkiye nin En Kapsamlı Elektrikli Araç Platformu</p>
        {/*<button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-md transition-all">Keşfet</button>*/}
      </div>
    </section>
  );
}