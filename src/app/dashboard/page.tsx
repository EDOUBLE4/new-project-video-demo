import { COIUpload } from '@/components/coi-upload'
import { ComplianceDashboard } from '@/components/compliance-dashboard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IntelliCOI Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Achieve 95% vendor compliance with AI-powered COI management
          </p>
        </header>
        
        <div className="grid gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upload New COI</h2>
            <COIUpload />
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Compliance Overview</h2>
            <ComplianceDashboard />
          </section>
        </div>
      </div>
    </div>
  )
}