export default function EVCard({ car, isSelected, onSelect }) {
  if (!car) return null;

  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-[3xl] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border overflow-hidden group relative cursor-pointer ${
        isSelected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-100'
      }`}
    >
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
        }`}>
          {isSelected && <span className="text-sm font-bold">✓</span>}
        </div>
      </div>

      <div className="h-44 bg-[#f9fafb] p-6 flex items-center justify-center">
        <img src={car.image} alt={car.brand} className="max-h-full object-contain group-hover:scale-110 transition-all duration-500" />
      </div>

      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
          {car.brand} <span className="font-medium text-slate-500">{car.model}</span>
        </h3>

        <div className="mt-6 space-y-3 text-[13px]">
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">Menzil</span>
            <b className="text-slate-800">{car.range}</b>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">Batarya</span>
            <b className="text-slate-800">{car.battery}</b>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">0-100</span>
            <b className="text-slate-800">{car.accel} sn</b>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">Bagaj</span>
            <b className="text-slate-800">{car.cargo}</b>
          </div>
          <p className="text-[10px] text-slate-400 italic pt-2 leading-tight">
            (15 dakikalık şarjla ulaşılan toplam mesafedir.)
          </p>
        </div>

        <button className={`mt-6 w-full py-3 rounded-2xl font-black text-xs transition-all ${
          isSelected ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white'
        }`}>
          {isSelected ? 'LİSTEDEN ÇIKAR' : 'KIYASLAMAYA EKLE'}
        </button>
      </div>
    </div>
  );
}