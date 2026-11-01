import CostGuide from "@/components/CostGuide";

export const metadata = {
  title: "Elektrikli Araç Maliyet Hesaplama | EV Platform",
  description: "Türkiye'deki elektrik, şarj ve yakıt fiyatlarınızı girerek elektrikli araçların yıllık kullanım maliyetini karşılaştırın.",
};

export default function CostCalculationPage() {
  return <CostGuide />;
}
