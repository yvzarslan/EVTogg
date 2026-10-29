import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand') || '';
  const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'NEWS_API_KEY is not configured',
      articles: [],
    });
  }

  const query = brand ? `"${brand}" elektrikli otomobil` : 'elektrikli otomobil';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=tr&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json({
        status: 'error',
        message: errorData.message || 'News API request failed',
        articles: [],
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      status: 'error',
      message: 'Sunucu hatası',
      articles: [],
    });
  }
}