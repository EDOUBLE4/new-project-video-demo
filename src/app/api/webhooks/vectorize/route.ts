import { NextRequest, NextResponse } from 'next/server'
import { processVectorizeWebhook } from '@/lib/webhooks/vectorize-processor'

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret (skip in development for mock)
    const webhookSecret = req.headers.get('x-vectorize-signature')
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment && webhookSecret !== process.env.VECTORIZE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, status, extraction, confidence, error } = await req.json()

    // Queue for processing (following MVP pattern)
    // In production, this would go to a job queue
    await processVectorizeWebhook({
      jobId,
      status,
      extraction,
      confidence,
      error,
    })

    // Return immediately as per CLAUDE.md guidelines
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}