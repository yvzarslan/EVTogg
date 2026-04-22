// GNews Örneği (Canlıda çalışır)
export async function getLiveNews(brand = "") {
  const API_KEY = process.env.NEXT_PUBLIC_GNEWS_KEY; // Vercel'den alır
  
  try {
    const query = brand ? `"${brand}" AND elektrikli` : 'elektrikli otomobil';
    
    // GNews URL yapısı biraz farklıdır
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=tr&apikey=${API_KEY}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (!data.articles) return [];

    // Marka koruması (Senin yazdığın mantık gayet iyi)
    const cleanNews = brand 
      ? data.articles.filter(article => 
          article.title.toLowerCase().includes(brand.toLowerCase())
        )
      : data.articles;

    return cleanNews.slice(0, 6);
  } catch (error) {
    console.error("API Hatası:", error);
    return [];
  }
}