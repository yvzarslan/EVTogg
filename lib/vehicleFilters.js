export const segmentLabels = {
  a: "A - Mini sınıf",
  b: "B - Küçük sınıf",
  c: "C - Kompakt sınıf",
  d: "D - Büyük sınıf",
  e: "E - Üst sınıf",
  f: "F - Lüks sınıf",
  n: "N - Yolcu minibüsü",
  s: "S - Spor otomobil",
};

export const bodyStyleLabels = {
  hatchback: "Hatchback",
  sedan: "Sedan",
  liftback: "Liftback sedan",
  suv: "SUV",
  station: "Station wagon",
  cabrio: "Cabrio",
  coupe: "Coupe",
  spv: "Yolcu minibüsü",
  mpv: "Çok amaçlı araç (MPV)",
  pickup: "Pikap",
};

export function getSegmentLabel(value) {
  return segmentLabels[value] || value || "Belirtilmemiş";
}

export function getBodyStyleLabel(value) {
  return bodyStyleLabels[value] || value || "Belirtilmemiş";
}
