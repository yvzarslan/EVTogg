export async function getLiveNews(brand = "") {
  // 1. Anahtar kontrolü (Vercel'de hem NEWS_API_KEY hem NEXT_PUBLIC_NEWS_API_KEY tanımlı olsun)
  const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    console.error("HATA: NEWS_API_KEY tanımlanmamış.");
    return [];
  }

  try {
    // 2. Sorgu optimizasyonu
    // Not: Ücretsiz planda çok karmaşık sorgular bazen hata verebilir, basitleştirdik.
    const query = brand 
      ? `${brand} elektrikli otomobil` 
      : 'elektrikli otomobil';

    // 3. URL Hazırlama
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=tr&sortBy=publishedAt&pageSize=15&apiKey=${apiKey}`;

    // 4. Veriyi Çek (User-Agent ekleyerek 426 hatasını minimize ediyoruz)
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, 
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'EV-Platform-Project' // Bazı sunucular User-Agent boş olduğunda isteği reddeder
      }
    });

    const data = await res.json();

    // 5. Hata Kontrolü
    if (data.status === "error") {
      // Eğer 426 hatası alıyorsan, bu NewsAPI'nin Vercel sunucusunu "tarayıcı" sanmasından kaynaklıdır.
      console.error("NewsAPI Hatası:", data.message);
      return [];
    }

    if (!data.articles || data.articles.length === 0) return [];

    // 6. Temizlik ve Filtreleme
    const cleanNews = data.articles
      .filter(article => {
        // Silinmiş veya boş içerikleri ele
        const isNotRemoved = article.title && article.title !== "[Removed]";
        if (!brand) return isNotRemoved;
        
        // Marka varsa başlıkta kontrol et
        return isNotRemoved && article.title.toLowerCase().includes(brand.toLowerCase());
      })
      .slice(0, 6); 

    return cleanNews;

  } catch (error) {
    console.error("API Veri Çekme Hatası:", error);
    return [];
  }
}