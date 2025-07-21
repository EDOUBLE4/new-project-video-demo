// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_KEY = 'test-service-key'
process.env.VECTORIZE_API_KEY = 'test-vectorize-key'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.USE_MOCK_VECTORIZE = 'true'

// Mock fetch for tests
global.fetch = jest.fn()

// Mock NextRequest/NextResponse
class MockRequest {
  constructor(url, init) {
    this.url = url
    this.method = init?.method || 'GET'
    this.headers = new Map(Object.entries(init?.headers || {}))
    this.body = init?.body
  }
  
  async json() {
    return JSON.parse(this.body)
  }
}