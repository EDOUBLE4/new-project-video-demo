import { config } from 'dotenv'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') })

async function simulateWebhook(extractionId: string) {
  console.log('Simulating Vectorize webhook callback...\n')
  
  try {
    // Wait for mock processing to complete
    console.log('Waiting for mock extraction to complete...')
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Get extraction results from mock service
    const { MockVectorizeService } = await import('../src/lib/ai/vectorize-mock')
    const result = await MockVectorizeService.getExtractionStatus(extractionId)
    
    if (result.status !== 'completed') {
      console.error('Extraction not yet completed')
      return
    }
    
    // Transform to webhook format
    const webhookData = {
      jobId: extractionId,
      status: 'completed',
      extraction: MockVectorizeService.transformToVectorizeFormat(result.extraction),
      confidence: result.confidence,
    }
    
    console.log('Webhook payload:', JSON.stringify(webhookData, null, 2))
    
    // Send webhook to local endpoint
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/vectorize`
    console.log(`\nSending webhook to: ${webhookUrl}`)
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vectorize-signature': process.env.VECTORIZE_WEBHOOK_SECRET || 'dev-secret',
      },
      body: JSON.stringify(webhookData),
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Webhook failed:', response.status, error)
    } else {
      const result = await response.json()
      console.log('✅ Webhook processed successfully:', result)
    }
    
  } catch (error) {
    console.error('❌ Webhook simulation failed:', error)
  }
}

// Get extraction ID from command line argument
const extractionId = process.argv[2]
if (!extractionId) {
  console.error('Usage: npm run simulate-webhook <extraction-id>')
  process.exit(1)
}

simulateWebhook(extractionId)