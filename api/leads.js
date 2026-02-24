import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { location, industry, filter = 'nowebsite' } = req.query;

  if (!location || !industry) {
    return res.status(400).json({ error: 'location and industry are required' });
  }

  if (!process.env.APIFY_TOKEN) {
    return res.status(500).json({ error: 'APIFY_TOKEN is not configured' });
  }

  try {
    console.log(`Scraping: "${industry} in ${location}" — filter: ${filter}`);

    // Run the Google Maps scraper
    const run = await client.actor('compass/crawler-google-places').call({
      searchStringsArray: [`${industry} in ${location}`],
      maxCrawledPlacesPerSearch: 60,
      language: 'en',
      exportPlaceUrls: false,
      includeHistogram: false,
      includeOpeningHours: false,
      includePeopleAlsoSearch: false,
    });

    // Fetch results from dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Apply filter
    let leads = items;

    if (filter === 'nowebsite') {
      leads = items.filter(b => !b.website || b.website.trim() === '');
    } else if (filter === 'noreviews') {
      leads = items.filter(b => !b.reviewsCount || b.reviewsCount === 0);
    } else if (filter === 'lowrating') {
      leads = items.filter(b => b.totalScore && b.totalScore < 3.5);
    }

    // Shape the response
    const shaped = leads.map(b => ({
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

    return res.status(200).json({
      leads: shaped,
      total: shaped.length,
      scraped: items.length,
      filter,
      location,
      industry,
    });

  } catch (err) {
    console.error('Apify error:', err.message);
    return res.status(500).json({ error: 'Scraping failed. Check your Apify token and try again.', detail: err.message });
  }
}
