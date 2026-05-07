import { format } from 'date-fns'

import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { QRCode } from '../../components/common/QRCode.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useMyPass } from '../../hooks/usePasses.js'

// helper to format dates nicely
function fmt(dateStr) {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), 'dd MMM yyyy, h:mm a')
  } catch {
    return dateStr
  }
}

export default function MyPassPage() {
  const passQ = useMyPass()
  const pass = passQ.data

  return (
    <AppShell title="My Pass" breadcrumbs={['Visitor', 'My Pass']}>
      <PageHeader
        title="Your Visitor Pass"
        subtitle="Show this QR code to security at the entrance for scanning."
      />

      {passQ.isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!passQ.isLoading && !pass && (
        <Card>
          <div className="text-center py-8">
            <div className="text-slate-300 text-5xl mb-4">🪪</div>
            <h3 className="text-slate-700 font-semibold mb-2">No active pass</h3>
            <p className="text-slate-500 text-sm">
              Contact your host to get a pass issued. Passes are created after your appointment is approved.
            </p>
          </div>
        </Card>
      )}

      {pass && (
        <div className="max-w-lg">
          <Card>
            {/* visitor info header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl flex-shrink-0">
                {pass.visitor?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-lg">{pass.visitor?.name || '—'}</div>
                <div className="text-sm text-slate-500">{pass.visitor?.company || ''}</div>
              </div>
              <div className="ml-auto">
                <Badge variant="status" value={pass.isActive ? 'approved' : 'rejected'}>
                  {pass.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* QR code - the main thing */}
            <div className="flex justify-center mb-6">
              <QRCode value={pass.passCode} size={280} />
            </div>

            {/* pass code in big monospace */}
            <div className="text-center mb-6">
              <div className="font-mono text-base font-bold text-slate-700 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 inline-block break-all">
                {pass.passCode}
              </div>
            </div>

            {/* details */}
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Host</span>
                <span className="font-semibold text-slate-800">
                  {pass.visitor?.host?.name || pass.appointment?.host?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valid From</span>
                <span className="font-semibold text-slate-800">{fmt(pass.validFrom)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valid Until</span>
                <span className="font-semibold text-slate-800">{fmt(pass.validUntil)}</span>
              </div>
            </div>

            {/* download button if pdf exists */}
            {pass.pdfUrl && (
              <Button
                type="button"
                variant="secondary"
                className="w-full mb-3"
                onClick={() => window.open(pass.pdfUrl, '_blank', 'noopener,noreferrer')}
              >
                Download PDF Badge
              </Button>
            )}

            {/* instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              Show this QR code to security at the entrance. They will scan it to check you in.
              Keep this page open on your phone or download the PDF.
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  )
}
