import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/db/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { COIUpload } from '@/components/coi-upload'

export default async function VendorPortalPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createAdminClient()

  // Validate token and get vendor info
  const { data: tokenData, error: tokenError } = await supabase
    .from('vendor_access_tokens')
    .select(`
      *,
      vendor:vendors(*)
    `)
    .eq('token', params.token)
    .single()

  if (tokenError || !tokenData) {
    notFound()
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    notFound()
  }

  // Get latest certificate and gaps
  const { data: certificate } = await supabase
    .from('certificates')
    .select(`
      *,
      gaps:gap_analysis(*)
    `)
    .eq('vendor_id', tokenData.vendor_id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  const vendor = tokenData.vendor

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Insurance Compliance Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {vendor.name}
          </p>
        </header>

        {certificate?.compliance_status === 'compliant' ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-success">✅ You're Compliant!</CardTitle>
              <CardDescription>
                Your Certificate of Insurance meets all requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Thank you for maintaining proper insurance coverage. Your certificate expires on{' '}
                {certificate.expires_at
                  ? new Date(certificate.expires_at).toLocaleDateString()
                  : 'N/A'}
                .
              </p>
              <p className="text-sm text-gray-500">
                We'll send you a reminder 60 days before your coverage expires.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {certificate?.gaps && certificate.gaps.length > 0 && (
              <Card className="max-w-2xl mx-auto mb-8">
                <CardHeader>
                  <CardTitle>Coverage Requirements</CardTitle>
                  <CardDescription>
                    Your current certificate has the following gaps that need to be addressed:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certificate.gaps.map((gap: any, index: number) => (
                      <div
                        key={gap.id}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <h3 className="font-medium text-red-900 mb-1">
                          {formatCoverageType(gap.coverage_type)}
                        </h3>
                        <p className="text-sm text-red-700">{gap.instruction}</p>
                        <div className="mt-2 text-xs text-red-600">
                          Required: ${gap.required_amount?.toLocaleString()} |{' '}
                          Current: {gap.actual_amount ? `$${gap.actual_amount.toLocaleString()}` : 'Not Found'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">
                      What to tell your insurance agent:
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {certificate.gaps.map((gap: any) => (
                        <li key={gap.id}>
                          • {gap.instruction}
                        </li>
                      ))}
                      <li>• Ensure the certificate holder is listed correctly</li>
                      <li>• Include all required endorsements</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Upload Updated Certificate</h2>
              <COIUpload />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatCoverageType(type: string): string {
  const typeMap: Record<string, string> = {
    general_liability: 'General Liability',
    auto_liability: 'Automobile Liability',
    workers_compensation: 'Workers Compensation',
  }
  return typeMap[type] || type
}