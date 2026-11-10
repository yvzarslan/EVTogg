import CostGuide from "@/components/CostGuide";
import { getMessage } from "@/lib/i18n";
import { getRequestLanguage } from "@/lib/requestLanguage";

export async function generateMetadata() {
  const language = await getRequestLanguage();
  return {
    title: `${getMessage(language, "costGuideTitle")} | EV Platform`,
    description: getMessage(language, "costGuideIntro"),
  };
}

export default function CostCalculationPage() {
  return <CostGuide />;
}
