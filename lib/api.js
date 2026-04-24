export async function getLiveNews(brand = "") {
  // Vercel Settings > Environment Variables kısmına NEWS_API_KEY eklemiş olmalısın
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    console.error("HATA: NEWS_API_KEY tanımlanmamış.");
    return [];
  }

  try {
    // 1. Sorguyu Hazırla
    const query = brand 
      ? `"${brand}" AND (elektrikli OR otomobil)` 
      : 'elektrikli otomobil';

    // NewsAPI ücretsiz planı bazen Vercel'den gelen istekleri 426 hatasıyla reddedebilir.
    // Bunu aşmak için URL'i hazırlıyoruz.
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=tr&sortBy=publishedAt&apiKey=${apiKey}`;

    // 2. Veriyi Çek
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, // 1 saat Vercel Data Cache
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json();

    // NewsAPI hata döndürürse (Örn: 426 Upgrade Required)
    if (data.status === "error") {
      console.error("NewsAPI Error:", data.message);
      return [];
    }

    if (!data.articles) return [];

    // 3. Marka Filtreleme
    const cleanNews = brand 
      ? data.articles.filter(article => 
          article.title?.toLowerCase().includes(brand.toLowerCase())
        )
      : data.articles;

    return cleanNews.slice(0, 6); 

  } catch (error) {
    console.error("API Veri Çekme Hatası:", error);
    return [];
  }
}