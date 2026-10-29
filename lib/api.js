export async function getLiveNews(brand = "") {
  try {
    const res = await fetch(`/api/news?brand=${encodeURIComponent(brand)}`, {
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    if (!data.articles || data.status === "error") {
      console.error("Haberler alınamadı:", data.message);
      return [];
    }

    return data.articles
      .filter((a) => a.title && a.title !== "[Removed]")
      .slice(0, 6);
  } catch (error) {
    console.error("API Veri Çekme Hatası:", error);
    return [];
  }
}