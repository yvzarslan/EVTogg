import { headers } from "next/headers";

export async function getRequestCountry() {
  const requestHeaders = await headers();
  const country =
    requestHeaders.get("x-vercel-ip-country") ||
    requestHeaders.get("cf-ipcountry") ||
    requestHeaders.get("cloudfront-viewer-country");

  if (country && /^[A-Z]{2}$/i.test(country.trim())) {
    return country.trim().toUpperCase();
  }

  const preferredLanguage = requestHeaders.get("accept-language")?.split(",")[0]?.split(";")[0];
  const region = preferredLanguage?.match(/-[A-Z]{2}$/i)?.[0].slice(1);
  return region?.toUpperCase() || null;
}

export async function getRequestCity() {
  const requestHeaders = await headers();
  const city =
    requestHeaders.get("x-vercel-ip-city") ||
    requestHeaders.get("cf-ipcity") ||
    requestHeaders.get("cloudfront-viewer-city");

  if (!city) return null;

  try {
    return decodeURIComponent(city.replace(/\+/g, " "));
  } catch (error) {
    if (error instanceof URIError) return city;
    throw error;
  }
}
