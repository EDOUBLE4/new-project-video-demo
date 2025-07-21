'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/db/supabase'
import type { Database } from '@/types/database'

type Certificate = Database['public']['Tables']['certificates']['Row'] & {
  vendor: Database['public']['Tables']['vendors']['Row']
  gaps: Database['public']['Tables']['gap_analysis']['Row'][]
}

export function ComplianceDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    processing: 0,
    complianceRate: 0,
  })

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          vendor:vendors(*),
          gaps:gap_analysis(*)
        `)
        .order('uploaded_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setCertificates(data as Certificate[])
      calculateStats(data as Certificate[])
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (certs: Certificate[]) => {
    const total = certs.length
    const compliant = certs.filter(c => c.compliance_status === 'compliant').length
    const nonCompliant = certs.filter(c => 
      c.compliance_status === 'non_compliant' || c.compliance_status === 'partial'
    ).length
    const processing = certs.filter(c => 
      c.processing_status === 'processing' || c.processing_status === 'pending'
    ).length

    setStats({
      total,
      compliant,
      nonCompliant,
      processing,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
    })
  }

  const handleGenerateInstructions = async (certificateId: string) => {
    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId }),
      })

      if (!response.ok) throw new Error('Failed to generate instructions')

      const result = await response.json()
      console.log('Instructions generated:', result)
      
      // TODO: Show instructions in UI or trigger email
    } catch (error) {
      console.error('Error generating instructions:', error)
    }
  }

  const handleSendNotification = async (certificateId: string) => {
    try {
      // First generate instructions
      const instrResponse = await fetch('/api/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId }),
      })

      if (!instrResponse.ok) throw new Error('Failed to generate instructions')
      const { instructions } = await instrResponse.json()

      // Then send notification
      const notifyResponse = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId, instructions }),
      })

      if (!notifyResponse.ok) throw new Error('Failed to send notification')

      const result = await notifyResponse.json()
      console.log('Notification sent:', result)
      
      // TODO: Show success message
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading compliance data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{stats.compliant}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Non-Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-danger">{stats.nonCompliant}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.complianceRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent COI Uploads</CardTitle>
          <CardDescription>
            Latest certificates and their compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{cert.vendor.name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded {new Date(cert.uploaded_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={cert.compliance_status} />
                    {cert.processing_status === 'processing' && (
                      <span className="text-xs text-gray-500">Processing...</span>
                    )}
                    {cert.extraction_confidence && (
                      <span className="text-xs text-gray-500">
                        {Math.round(cert.extraction_confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  {cert.gaps && cert.gaps.length > 0 && (
                    <p className="text-sm text-danger mt-1">
                      {cert.gaps.length} coverage gap{cert.gaps.length > 1 ? 's' : ''} found
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {cert.compliance_status === 'non_compliant' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateInstructions(cert.id)}
                      >
                        Generate Instructions
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendNotification(cert.id)}
                      >
                        Send to Vendor
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    compliant: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    non_compliant: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    pending: 'bg-blue-100 text-blue-800',
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}