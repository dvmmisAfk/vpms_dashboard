// security issues passes to approved visitors
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

import { listVisitors } from '../../api/visitors.js'
import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useIssuePass } from '../../hooks/usePasses.js'
import { formatDateTime } from '../../utils/formatDate.js'

export default function PassIssuePage() {
  // 1 = search, 2 = preview, 3 = done
  const [step, setStep] = useState(1)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [generatedPass, setGeneratedPass] = useState(null)

  const issueM = useIssuePass()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // set default times - now to now + 8 hours
  useEffect(() => {
    const now = new Date()
    const later = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    setValidFrom(now.toISOString().slice(0, 16))
    setValidUntil(later.toISOString().slice(0, 16))
  }, [])

  // show matching visitors
  const visitorsQ = useQuery({
    queryKey: ['visitors-search', debouncedQ],
    queryFn: () => listVisitors({ q: debouncedQ, status: 'approved', page: 1, limit: 8 }),
    staleTime: 10000
  })

  const rows = visitorsQ.data?.data || []

  // calls the api to generate pass and qr code
  const handleIssue = async () => {
    if (!selected || !validFrom || !validUntil) return
    try {
      const pass = await issueM.mutateAsync({
        visitorId: selected._id,
        payload: {
          validFrom: new Date(validFrom).toISOString(),
          validUntil: new Date(validUntil).toISOString()
        }
      })
      setGeneratedPass(pass)
      setStep(3)
      toast.success('Pass issued!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to issue pass')
    }
  }

  const reset = () => {
    setStep(1)
    setSelected(null)
    setGeneratedPass(null)
    setQ('')
  }

  return (
    <AppShell title="Issue Pass" breadcrumbs={['Security', 'Issue Pass']}>
      <PageHeader
        title="Issue visitor pass"
        subtitle="Search for an approved visitor and generate their QR pass."
      />

      {/* step indicator */}
      <div className="flex gap-4 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex items-center gap-2 text-sm font-semibold ${s === step ? 'text-indigo-600' : 'text-slate-400'}`}>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${s === step ? 'bg-indigo-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
            {s === 1 ? 'Search' : s === 2 ? 'Confirm' : 'Done'}
          </div>
        ))}
      </div>

      {/* step 1: search */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-2xl">
          <h3 className="font-semibold text-slate-800 mb-3">Find visitor</h3>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="space-y-2">
            {visitorsQ.isLoading && <div className="text-sm text-slate-400">Searching...</div>}
            {!visitorsQ.isLoading && rows.length === 0 && (
              <div className="text-sm text-slate-400">
                {debouncedQ ? 'No approved visitors found' : 'Start typing to search'}
              </div>
            )}
            {rows.map(v => (
              <div
                key={v._id}
                onClick={() => { setSelected(v); setStep(2) }}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {v.name && v.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.company || v.email || '—'}</div>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{v.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* step 2: confirm details before issuing */}
      {step === 2 && selected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md">
          <h3 className="font-semibold text-slate-800 mb-4">Confirm pass for {selected.name}</h3>

          <div className="text-sm space-y-1 mb-4 text-slate-600">
            <div>Company: <span className="font-semibold">{selected.company || '—'}</span></div>
            <div>Purpose: <span className="font-semibold">{selected.purpose || '—'}</span></div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid From</label>
              <input
                type="datetime-local"
                value={validFrom}
                onChange={e => setValidFrom(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until</label>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button type="button" loading={issueM.isPending} disabled={!validFrom || !validUntil} onClick={handleIssue}>
              Issue Pass
            </Button>
          </div>
        </div>
      )}

      {/* step 3: done - show the pass */}
      {step === 3 && generatedPass && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md text-center">
          <div className="text-green-600 font-bold text-lg mb-4">Pass Issued!</div>

          <div className="flex justify-center mb-4">
            <QRCodeSVG value={generatedPass.passCode} size={200} />
          </div>

          <div className="font-mono text-lg font-bold text-slate-800 mb-2">{generatedPass.passCode}</div>
          <div className="text-sm text-slate-500 mb-4">
            Valid: {formatDateTime(generatedPass.validFrom)} → {formatDateTime(generatedPass.validUntil)}
          </div>

          <div className="flex flex-col gap-2">
            {generatedPass.pdfUrl ? (
              <a
                href={generatedPass.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg py-2 px-4 text-sm hover:bg-slate-50"
              >
                Download PDF
              </a>
            ) : (
              <div className="text-xs text-slate-400">PDF not available (configure Cloudinary)</div>
            )}
            <Button type="button" variant="secondary" onClick={() => window.print()}>Print</Button>
            <Button type="button" onClick={reset}>Issue Another</Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
