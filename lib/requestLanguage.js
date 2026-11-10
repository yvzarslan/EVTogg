import { cookies, headers } from "next/headers";
import { defaultLanguage, normalizeLanguage, supportedLanguages } from "@/lib/i18n";

const countryLanguages = {
  tr: ["TR"],
  en: [
    "AG", "AU", "BB", "BZ", "CA", "DM", "GB", "GD", "GH", "GM", "GY", "IE",
    "JM", "KN", "LC", "NG", "NZ", "SG", "TT", "US", "VC", "ZA",
  ],
  fr: ["BE", "BF", "BI", "BJ", "CD", "CF", "CG", "CI", "CM", "FR", "GA", "GN", "LU", "MC", "NE", "SN", "TG"],
  ru: ["BY", "RU"],
  zh: ["CN"],
};

const countryLanguageMap = new Map(
  Object.entries(countryLanguages).flatMap(([language, countries]) =>
    countries.map((country) => [country, language])
  )
);

function getLanguageFromAcceptLanguage(value) {
  if (!value) return null;

  const preferences = value.split(",").flatMap((entry, index) => {
    const [tag, ...parameters] = entry.trim().split(";");
    const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
    const language = tag.split("-")[0].toLowerCase();

    if (!supportedLanguages.includes(language) || !Number.isFinite(quality) || quality <= 0 || quality > 1) {
      return [];
    }

    return [{ language, quality, index }];
  });

  preferences.sort((a, b) => b.quality - a.quality || a.index - b.index);
  return preferences[0]?.language || null;
}

export async function getRequestLanguage() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const savedLanguage = cookieStore.get("ev-platform-language")?.value;

  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return normalizeLanguage(savedLanguage);
  }

  const country =
    requestHeaders.get("x-vercel-ip-country") ||
    requestHeaders.get("cf-ipcountry") ||
    requestHeaders.get("cloudfront-viewer-country");
  const countryLanguage = countryLanguageMap.get(country?.trim().toUpperCase());

  return countryLanguage || getLanguageFromAcceptLanguage(requestHeaders.get("accept-language")) || defaultLanguage;
}
