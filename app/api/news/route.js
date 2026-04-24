import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand') || "";
  const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;

  const query = brand ? `"${brand}" elektrikli otomobil` : 'elektrikli otomobil';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=tr&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}