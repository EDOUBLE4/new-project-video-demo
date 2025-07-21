import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Invalid or Expired Link
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          This vendor portal link is invalid or has expired.
        </p>
        <p className="text-gray-500 mb-8">
          Please contact your property manager for a new link to upload your Certificate of Insurance.
        </p>
        <Link href="/">
          <Button variant="outline">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}