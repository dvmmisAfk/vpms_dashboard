import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

import client from '../../api/client.js'
import { listPasses } from '../../api/passes.js'
import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useApproveVisitor, useRejectVisitor, useVisitorDetail } from '../../hooks/useVisitors.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDateTime } from '../../utils/formatDate.js'

export default function VisitorDetailPage() {
  const { id } = useParams()
  const { hasAnyRole } = useAuth()

  const visitorQ = useVisitorDetail(id)
  const visitor = visitorQ.data

  const approveM = useApproveVisitor(id)
  const rejectM = useRejectVisitor(id)

  const passesQ = useQuery({
    queryKey: ['passes-for-visitor', id],
    queryFn: listPasses,
    enabled: !!id,
    staleTime: 15000,
    select: data => (data || []).filter(p => p.visitor?._id === id || p.visitor === id)
  })

  const pass = passesQ.data?.[0]

  // couldnt figure out how to filter by visitor id on the backend
  // so just fetching all logs and filtering here
  const [checkLogs, setCheckLogs] = useState([])
  useEffect(() => {
    if (!id) return
    client.get('/checks/logs')
      .then(function(res) {
        const all = res.data.data || []
        const mine = all.filter(l => String(l.visitor?._id || l.visitor) === String(id))
        setCheckLogs(mine)
      })
      .catch(function(err) {
        console.warn('check logs fetch failed:', err.message)
      })
  }, [id])

  // sort timeline newest first
  const timeline = [...checkLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (visitorQ.isLoading) {
    return (
      <AppShell title="Visitor" breadcrumbs={['Visitors', 'Detail']}>
        <div className="flex justify-center py-16"><Spinner /></div>
      </AppShell>
    )
  }

  if (!visitor) {
    return (
      <AppShell title="Visitor" breadcrumbs={['Visitors', 'Detail']}>
        <div className="text-sm text-slate-500">Visitor not found</div>
      </AppShell>
    )
  }

  const handleApprove = async () => {
    try {
      await approveM.mutateAsync()
      toast.success('Visitor approved')
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async () => {
    try {
      await rejectM.mutateAsync()
      toast.success('Visitor rejected')
    } catch {
      toast.error('Failed to reject')
    }
  }

  return (
    <AppShell title={visitor.name} breadcrumbs={['Visitors', visitor.name]}>
      <PageHeader
        title={visitor.name}
        subtitle={visitor.company || ''}
        actions={
          <div className="flex flex-wrap gap-2">
            {hasAnyRole(['admin', 'employee']) && (
              <>
                <Button type="button" variant="secondary" loading={approveM.isPending} onClick={handleApprove}>
                  Approve
                </Button>
                <Button type="button" variant="danger" loading={rejectM.isPending} onClick={handleReject}>
                  Reject
                </Button>
              </>
            )}
            {hasAnyRole(['admin', 'security']) && (
              <Button type="button" onClick={() => (window.location.href = `/issue-pass?visitor=${id}`)}>
                Issue Pass
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* left: visitor info */}
        <Card title="Profile">
          <div className="flex flex-col items-center gap-3">
            <div className="h-32 w-32 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              {visitor.photoUrl
                ? <img src={visitor.photoUrl} alt="" className="h-full w-full object-cover" />
                : <span className="text-4xl font-bold text-slate-300">{visitor.name?.charAt(0)}</span>
              }
            </div>
            <Badge variant="status" value={visitor.status}>{visitor.status}</Badge>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{visitor.email || '—'}</span></div>
            <div><span className="text-slate-500">Phone:</span> <span className="font-semibold">{visitor.phone || '—'}</span></div>
            <div><span className="text-slate-500">Purpose:</span> <span className="font-semibold">{visitor.purpose || '—'}</span></div>
            <div><span className="text-slate-500">Host:</span> <span className="font-semibold">{visitor.host?.name || '—'}</span></div>
            <div><span className="text-slate-500">Created:</span> <span className="font-semibold">{formatDateTime(visitor.createdAt)}</span></div>
          </div>
        </Card>

        {/* right: pass info */}
        <Card className="lg:col-span-2" title="Pass">
          {!pass && (
            <div className="text-sm text-slate-500">
              No pass issued yet.
              {hasAnyRole(['admin', 'security']) && (
                <Button
                  type="button"
                  className="ml-3"
                  onClick={() => (window.location.href = `/issue-pass?visitor=${id}`)}
                >
                  Issue Pass
                </Button>
              )}
            </div>
          )}

          {pass && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex justify-center">
                <QRCodeSVG value={pass.passCode} size={180} />
              </div>
              <div className="md:col-span-2 space-y-2 text-sm">
                <div><span className="text-slate-500">Pass code:</span> <span className="font-mono font-semibold">{pass.passCode}</span></div>
                <div>
                  <span className="text-slate-500">Valid:</span>{' '}
                  <span className="font-semibold">{formatDateTime(pass.validFrom)} → {formatDateTime(pass.validUntil)}</span>
                </div>
                <Badge variant="status" value={pass.isActive ? 'approved' : 'rejected'}>
                  {pass.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {pass.pdfUrl
                  ? <a href={pass.pdfUrl} target="_blank" rel="noreferrer" className="block text-indigo-600 font-semibold text-sm hover:underline">Download PDF</a>
                  : <div className="text-xs text-slate-400">PDF unavailable (configure Cloudinary)</div>
                }
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* check logs timeline */}
      <Card className="mt-4" title="Check Logs">
        <div className="space-y-2">
          {timeline.map(l => (
            <div key={l._id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm border border-slate-100">
              <div className="font-semibold capitalize">{l.action} • {formatDateTime(l.timestamp)}</div>
              <div className="text-xs text-slate-500">by {l.scannedBy?.name || '—'}</div>
            </div>
          ))}
          {!timeline.length && <div className="text-sm text-slate-500">No check logs yet.</div>}
        </div>
      </Card>
    </AppShell>
  )
}
