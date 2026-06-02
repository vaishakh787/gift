import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the HTML from the target URL
    const response = await fetch(url, {
      headers: {
        // We use a standard browser User-Agent so websites don't block us as a bot
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch URL');

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract standard Open Graph tags (or fallback to standard HTML tags)
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'External Link';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || null;

    return NextResponse.json({
      success: true,
      data: { title, description, image }
    });

  } catch (error) {
    // Fallback Rule: Return a safe default instead of crashing the app
    console.error('Scraping error:', error);
    return NextResponse.json({
      success: false,
      data: {
        title: 'External Link',
        description: 'Content preview unavailable.',
        image: null
      }
    });
  }
}