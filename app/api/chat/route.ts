import { NextResponse } from 'next/server';

import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase';
import { Agent, run, FunctionTool } from '@openai/agents';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the search_apartments tool
const searchApartmentsTool = new FunctionTool({
  name: 'search_apartments',
  description: 'Searches for available apartments based on size, location, and price.',
  parameters: {
    type: 'object',
    properties: {
      size: {
        type: 'string',
        description: 'The size of the apartment (e.g., studio, 1-bedroom, 2-bedroom).',
      },
      location: {
        type: 'string',
        description: 'The location of the apartment (e.g., city, state, zip code).',
      },
      minPrice: {
        type: 'number',
        description: 'The minimum price for the apartment.',
      },
        maxPrice: {
        type: 'number',
        description: 'The maximum price for the apartment.',
      },
    },
  },
  func: async (args: { size?: string; location?: string; minPrice?: number; maxPrice?: number }) => {
    let query = supabase.from('apartments').select('title, url, description, price, bedrooms, bathrooms, location');

    if (args.size) {
      query = query.ilike('bedrooms', `%${args.size.replace('-bedroom', '')}%`);
    }
    if (args.location) {
      query = query.ilike('location', `%${args.location}%`);
    }
    if (args.minPrice) {
      query = query.gte('price', args.minPrice);
    }
    if (args.maxPrice) {
      query = query.lte('price', args.maxPrice);
    }

    const { data, error } = await query.limit(5);

    if (error) {
      console.error('Error searching apartments:', error);
      return `Error searching for apartments: ${error.message}`;
    }

    if (!data || data.length === 0) {
      return 'No apartments found matching your criteria.';
    }

    return JSON.stringify(data);
  },
};

// Define the AI Agent
const agent = new Agent({
  llm: openai,
  tools: [searchApartmentsTool],
  systemMessage: 'You are an AI assistant for a property management company. Your goal is to help users find available apartments. Use the search_apartments tool to find listings based on user criteria. If you cannot find an apartment, suggest broadening the search.',
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const result = await run(agent, message);

    return NextResponse.json({ response: result });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error.', details: error.message }, { status: 500 });
  }
}
