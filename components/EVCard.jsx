import Image from "next/image";

export default function EVCard({ car }) {
  if (!car) return null;

  return (
    <div className="bg-white rounded-[3xl] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-slate-100 overflow-hidden group">
      {/* Resim Alanı */}
      <div className="h-44 bg-[#f9fafb] p-4 flex items-center justify-center relative">
        <img 
          src={car.image} 
          alt={car.brand} 
          className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* İçerik Alanı */}
      <div className="p-5 flex flex-col grow">
        <h3 className="text-lg font-bold text-slate-900 leading-tight">
          {car.brand} <span className="font-normal text-slate-500">{car.model}</span>
        </h3>

        <div className="mt-6 space-y-2 text-[13px] text-slate-600">
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400">Menzil: <b className="text-slate-700">{car.range}</b></span>
           
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400">Batarya: <b className="text-slate-700">{car.battery}</b></span>
       
          </div>
          <div className="flex justify-between pt-1"> 
            <span className="text-slate-400">0-100: <b className="text-slate-700">{car.accel} sn</b></span>
          </div>
          <div className="flex justify-between pt-1"> 
            <span className="text-slate-400">Bagaj Hacmi: <b className="text-slate-700">{car.cargo}</b></span>
          </div>
           <div className="flex justify-between pt-1"> 
            <span className="text-slate-400">Toplam Menzil: <b className="text-slate-700">{car.long_total}</b></span>
          </div>
          <div className="flex justify-between pt-1"> 
            <span className="text-slate-400">(Otoyol hızında giderken, sadece 15 dakikalık tek bir şarj molasıyla ulaşabileceğin toplam mesafedir.)</span>
          </div>
        </div>
      </div>
    </div>
  );
}