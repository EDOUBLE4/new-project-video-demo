import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(_request: Request) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

  if (!firecrawlApiKey) {
    return NextResponse.json({ error: 'FIRECRAWL_API_KEY is not set.' }, { status: 500 });
  }

  // Example URL to scrape - in a real scenario, this would come from a list of property websites
  const targetUrl = 'https://www.apartments.com/austin-tx/'; // Replace with a real target

  try {
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        params: {
          extractorOptions: {
            mode: 'llm-extraction',
            llmSchema: {
              type: 'object',
              properties: {
                apartments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      url: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'string' },
                      bedrooms: { type: 'string' },
                      bathrooms: { type: 'string' },
                      location: { type: 'string' },
                    },
                    required: ['title', 'url', 'price', 'location'],
                  },
                },
              },
              required: ['apartments'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Firecrawl API error:', errorData);
      return NextResponse.json({ error: 'Failed to scrape data from Firecrawl.', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const apartments = data.data.apartments || [];

    if (apartments.length > 0) {
      // Insert scraped data into Supabase
      const { error } = await supabase.from('apartments').upsert(apartments, { onConflict: 'url' });

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({ error: 'Failed to save data to Supabase.', details: error.message }, { status: 500 });
      }
      console.log(`Successfully scraped and saved ${apartments.length} apartments.`);
      return NextResponse.json({ message: `Successfully scraped and saved ${apartments.length} apartments.`, data: apartments });
    } else {
      console.log('No apartments found to save.');
      return NextResponse.json({ message: 'No apartments found to save.' });
    }

  } catch (error: unknown) {
    console.error('Scraping process failed:', error);
    return NextResponse.json({ error: 'Internal server error during scraping.', details: error instanceof Error ? error.message : 'An unknown error occurred.' }, { status: 500 });
  }
}
