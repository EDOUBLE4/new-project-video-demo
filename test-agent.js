require('dotenv').config({ path: '.env.local' });
const { Agent, run, tool } = require('@openai/agents');

console.log('Testing OpenAI Agents...');
console.log('OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);

// Simple test agent
const testAgent = new Agent({
  name: 'Test Agent',
  instructions: 'You are a helpful assistant. Respond with a simple message.',
  tools: [],
});

async function runTest() {
  try {
    console.log('Creating agent...');
    const result = await run(testAgent, 'Hello, can you respond?');
    console.log('Agent result:', result);
    
    // Check if result has state structure
    if (result && typeof result === 'object' && 'state' in result) {
      console.log('Result has state structure');
      const state = result.state;
      console.log('Model responses:', state.modelResponses?.length || 0);
      if (state.modelResponses && state.modelResponses.length > 0) {
        const lastResponse = state.modelResponses[state.modelResponses.length - 1];
        console.log('Last response content:', lastResponse?.content);
      }
    }
  } catch (error) {
    console.error('Agent test failed:', error.message);
  }
}

runTest();