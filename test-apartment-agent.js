require('dotenv').config({ path: '.env.local' });
const { Agent, run, tool } = require('@openai/agents');
const { z } = require('zod');

console.log('Testing Apartment Search Agent...');
console.log('OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);
console.log('SUPABASE_URL set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

// Mock supabase for testing (since we're not running the full Next.js app)
const mockSupabase = {
  from: (table) => ({
    select: (fields) => ({
      ilike: (field, pattern) => mockSupabase.from(table).select(fields),
      gte: (field, value) => mockSupabase.from(table).select(fields),
      lte: (field, value) => mockSupabase.from(table).select(fields),
      limit: (count) => ({
        then: (callback) => callback({ 
          data: [], 
          error: { message: 'No apartments table found - this is expected for testing' }
        })
      })
    })
  })
};

// Define the search_apartments tool (same as in API)
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
    console.log('Tool called with args:', args);
    
    let query = mockSupabase.from('apartments').select('title, url, description, price, bedrooms, bathrooms, location');

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

// Define the AI Agent (same as in API)
const agent = new Agent({
  name: 'Property Assistant',
  instructions: 'You are an AI assistant for a property management company. Your goal is to help users find available apartments. Use the search_apartments tool to find listings based on user criteria. If you cannot find an apartment, suggest broadening the search.',
  tools: [searchApartmentsTool],
});

async function testApartmentAgent() {
  try {
    console.log('Testing with apartment query...');
    const result = await run(agent, 'how many apartments in atlanta?');
    
    console.log('\n=== AGENT RESULT ===');
    console.log('Result type:', typeof result);
    console.log('Has state:', 'state' in result);
    
    if (result && typeof result === 'object' && 'state' in result) {
      const state = result.state;
      console.log('\n=== STATE ANALYSIS ===');
      console.log('_currentStep:', state._currentStep);
      console.log('_generatedItems length:', state._generatedItems?.length || 0);
      console.log('_modelResponses length:', state._modelResponses?.length || 0);
      
      // Extract response using our logic
      let responseContent = 'No response generated';
      if (state._currentStep?.output) {
        responseContent = state._currentStep.output;
        console.log('✅ Found response in _currentStep.output');
      } else if (state._generatedItems?.length > 0) {
        const lastItem = state._generatedItems[state._generatedItems.length - 1];
        responseContent = lastItem.content || lastItem.text || 'Generated item found but no content';
        console.log('✅ Found response in _generatedItems');
      } else if (state._modelResponses?.length > 0) {
        const lastResponse = state._modelResponses[state._modelResponses.length - 1];
        responseContent = lastResponse.content || 'Model response found but no content';
        console.log('✅ Found response in _modelResponses');
      }
      
      console.log('\n=== EXTRACTED RESPONSE ===');
      console.log(responseContent);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testApartmentAgent();