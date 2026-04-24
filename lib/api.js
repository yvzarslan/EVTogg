export async function getLiveNews(brand = "") {
  try {
    // newsapi.org yerine kendi API yoluna istek atıyoruz
    const res = await fetch(`/api/news?brand=${encodeURIComponent(brand)}`, {
      cache: 'no-store'
    });

    const data = await res.json();

    if (!data.articles || data.status === "error") {
      console.error("Haberler alınamadı:", data.message);
      return [];
    }

    // Başlığı "[Removed]" olanları temizle ve ilk 6'yı dön
    return data.articles
      .filter(a => a.title && a.title !== "[Removed]")
      .slice(0, 6);

  } catch (error) {
    console.error("API Veri Çekme Hatası:", error);
    return [];
  }
}