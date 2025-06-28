import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

// Check for required environment variables at module level
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
}

// Define the search_apartments tool
const searchApartmentsTool = tool({
  name: 'search_apartments',
  description: 'Searches for available apartments based on size, location, and price.',
  parameters: z.object({
    size: z.string().nullable().optional().describe('The size of the apartment (e.g., studio, 1-bedroom, 2-bedroom).'),
    location: z.string().nullable().optional().describe('The location of the apartment (e.g., city, state, zip code).'),
    minPrice: z.number().nullable().optional().describe('The minimum price for the apartment.'),
    maxPrice: z.number().nullable().optional().describe('The maximum price for the apartment.'),
  }),
  execute: async (args) => {
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
      return `Error searching for apartments: ${error.message}. This might indicate the apartments table doesn't exist yet or needs to be created.`;
    }

    if (!data || data.length === 0) {
      return 'No apartments found matching your criteria. The database may be empty - you can use the /api/scrape endpoint to populate it with sample data.';
    }

    return JSON.stringify(data);
  },
});

// Define the AI Agent
const agent = new Agent({
  name: 'Property Assistant',
  instructions: 'You are an AI assistant for a property management company. Your goal is to help users find available apartments. Use the search_apartments tool to find listings based on user criteria. If you cannot find an apartment, suggest broadening the search.',
  tools: [searchApartmentsTool],
});

export async function POST(request: Request) {
  try {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const result = await run(agent, message);
    
    // Extract the actual response content from the agent state
    let responseContent = 'No response generated';
    if (result && typeof result === 'object' && 'state' in result) {
      const state = result.state as { modelResponses?: Array<{ content?: string }> };
      const lastResponse = state.modelResponses?.[state.modelResponses.length - 1];
      responseContent = lastResponse?.content || 'Agent completed but no response content found';
    } else if (typeof result === 'string') {
      responseContent = result;
    }

    return NextResponse.json({ response: responseContent });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error.', details: error instanceof Error ? error.message : 'An unknown error occurred.' }, { status: 500 });
  }
}
