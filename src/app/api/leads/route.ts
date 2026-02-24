import { ApifyClient } from 'apify-client';
import { NextRequest, NextResponse } from 'next/server';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');
  const industry = searchParams.get('industry');
  const filter = searchParams.get('filter') || 'nowebsite';

  if (!location || !industry) {
    return NextResponse.json(
      { error: 'location and industry are required' },
      { status: 400 }
    );
  }

  if (!process.env.APIFY_TOKEN) {
    return NextResponse.json(
      { error: 'APIFY_TOKEN is not configured' },
      { status: 500 }
    );
  }

  try {
    console.log(`Scraping: "${industry} in ${location}" — filter: ${filter}`);

    const run = await client.actor('compass/crawler-google-places').call({
      searchStringsArray: [`${industry} in ${location}`],
      maxCrawledPlacesPerSearch: 60,
      language: 'en',
      exportPlaceUrls: false,
      includeHistogram: false,
      includeOpeningHours: false,
      includePeopleAlsoSearch: false,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    let leads = items;

    if (filter === 'nowebsite') {
      leads = items.filter((b: any) => !b.website || b.website.trim() === '');
    } else if (filter === 'noreviews') {
      leads = items.filter((b: any) => !b.reviewsCount || b.reviewsCount === 0);
    } else if (filter === 'lowrating') {
      leads = items.filter((b: any) => b.totalScore && b.totalScore < 3.5);
    }

    const shaped = leads.map((b: any) => ({
      name: b.title || 'Unknown',
      address: b.address || b.street || '',
      city: b.city || '',
      phone: b.phone || null,
      rating: b.totalScore || null,
      reviews: b.reviewsCount || 0,
      category: b.categoryName || industry,
      website: b.website || null,
      mapsUrl: b.url || null,
      placeId: b.placeId || null,
    }));

    return NextResponse.json({
      leads: shaped,
      total: shaped.length,
      scraped: items.length,
      filter,
      location,
      industry,
    });

  } catch (err: any) {
    console.error('Apify error:', err.message);
    return NextResponse.json(
      { error: 'Scraping failed. Check your Apify token and try again.', detail: err.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
