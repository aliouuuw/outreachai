import { ApifyClient } from 'apify-client';
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-middleware';
import { assertWithinPlanLimits, incrementUsage, QuotaExceededError } from '@/lib/quota';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function GET(req: NextRequest) {
  const { session, userId } = await requireSession(req);
  if (!session || !userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

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
    await assertWithinPlanLimits({ userId, action: 'lead_search', units: 1 });
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: 'quota_exceeded',
          message: `Limite de recherches atteinte (${err.used}/${err.limit}) pour votre plan ${err.tier}.`,
          used: err.used,
          limit: err.limit,
          tier: err.tier,
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
  }

  try {
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

    await incrementUsage({ userId, action: 'lead_search', units: 1 });
    await incrementUsage({ userId, action: 'leads_returned', units: shaped.length });

    return NextResponse.json({
      leads: shaped,
      total: shaped.length,
      scraped: items.length,
      filter,
      location,
      industry,
    });

  } catch (err: any) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: 'quota_exceeded',
          message: `Limite de résultats atteinte pour votre plan ${err.tier}.`,
          tier: err.tier,
        },
        { status: 403 }
      );
    }
    console.error('Apify error:', err.message);
    return NextResponse.json(
      { error: 'Scraping failed. Check your Apify token and try again.', detail: err.message },
      { status: 500 }
    );
  }
}
