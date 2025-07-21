import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IntelliCOI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Turn 70% Vendor Compliance Failure Into 95% Success in 90 Days
          </p>
          <p className="text-gray-500 mb-8">
            AI-powered COI management that doesn't just flag problems—it generates specific fix instructions vendors actually understand and act on.
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              Get Started - Upload Your First COI
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}