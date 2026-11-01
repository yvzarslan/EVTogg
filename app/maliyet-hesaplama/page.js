import CostGuide from "@/components/CostGuide";
import { cookies } from "next/headers";
import { defaultLanguage, getMessage, normalizeLanguage } from "@/lib/i18n";

export async function generateMetadata() {
  const language = normalizeLanguage((await cookies()).get("ev-platform-language")?.value || defaultLanguage);
  return {
    title: `${getMessage(language, "costGuideTitle")} | EV Platform`,
    description: getMessage(language, "costGuideIntro"),
  };
}

export default function CostCalculationPage() {
  return <CostGuide />;
}
