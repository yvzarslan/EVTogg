const NEWS_API_KEY = 'c32d0bbec3c949d1b33799f93db0ed47';

export async function getLiveNews(brand = "") {
  try {
    // 1. Sorguyu Hazırla: Marka varsa tırnak içine al (Tam eşleşme için)
    const query = brand 
      ? `"${brand}" AND (elektrikli OR otomobil OR araç)` 
      : 'elektrikli otomobil news';

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=tr&sortBy=relevancy&apiKey=${NEWS_API_KEY}`;

    // 2. Veriyi Çek (Server-side fetch özelliklerini kullan)
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, // 1 saat cache
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json();

    if (!data.articles) return [];

    // 3. KATI FİLTRELEME (Başka markanın haberini engellemek için)
    // Eğer marka seçiliyse, başlığında o marka geçmeyenleri çöpe at
    const cleanNews = brand 
      ? data.articles.filter(article => 
          article.title.toLowerCase().includes(brand.toLowerCase())
        )
      : data.articles;

    return cleanNews.slice(0, 6); // İlk 6 haberi döndür
  } catch (error) {
    console.error("API Veri Çekme Hatası:", error);
    return [];
  }
}

 