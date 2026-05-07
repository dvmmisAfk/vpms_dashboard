// security staff uses this to scan visitors in
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, ScanLine } from 'lucide-react'

import { checkIn as checkInApi, checkOut as checkOutApi, listCheckLogs } from '../../api/checks.js'
import { verifyPassCode } from '../../api/passes.js'
import QRScanner from '../../components/common/QRScanner.jsx'
import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { formatDateTime } from '../../utils/formatDate.js'

export default function CheckInPage() {
  const [panel, setPanel] = useState('idle') // idle | loading | success | error
  const [passInfo, setPassInfo] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [scannerKey, setScannerKey] = useState(0)
  const [countdown, setCountdown] = useState(null)
  const countdownRef = useRef(null)

  // poll recent check-ins every 30 seconds
  const recentQ = useQuery({
    queryKey: ['today-checkins'],
    queryFn: () => listCheckLogs({ today: true }),
    refetchInterval: 30000,
    staleTime: 10000
  })

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const restartScanner = () => setScannerKey(k => k + 1)

  // reset after 10 seconds so they can scan next person
  const startCountdown = (seconds, onDone) => {
    setCountdown(seconds)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          onDone()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const verifyAndCheckIn = async (passCode) => {
    const code = String(passCode || '').trim()
    if (!code) return

    setPanel('loading')
    setPassInfo(null)
    setErrorMsg('')

    try {
      // step 1: verify the pass is valid
      const data = await verifyPassCode(code)

      if (!data || !data.isActive) {
        setPanel('error')
        setErrorMsg('Pass is inactive or not found')
        setTimeout(restartScanner, 3000)
        return
      }

      // step 2: log the check in
      await checkInApi({ passCode: code })

      // step 3: show the visitor info
      setPassInfo(data)
      setPanel('success')
      toast.success('Checked in!')

      startCountdown(10, () => {
        setPanel('idle')
        setPassInfo(null)
        restartScanner()
      })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Check-in failed'
      setPanel('error')
      setErrorMsg(msg)
      toast.error(msg)
      setTimeout(restartScanner, 3000)
    }
  }

  const handleCheckOut = async () => {
    if (!passInfo || !passInfo.passCode) return
    try {
      await checkOutApi({ passCode: passInfo.passCode })
      toast.success('Checked out!')
      setPanel('idle')
      setPassInfo(null)
      restartScanner()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Check-out failed')
    }
  }

  return (
    <AppShell title="Check-In" breadcrumbs={['Security', 'Check-In']}>
      <PageHeader
        title="Scan visitor passes"
        subtitle="Use camera scanner or enter the pass code manually."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* qr scanner on the left */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Scanning...
              </div>
              <Button type="button" variant="secondary" onClick={restartScanner}>
                Restart
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl bg-black">
              <QRScanner
                key={scannerKey}
                onScan={verifyAndCheckIn}
                onError={() => console.warn('scanner error')}
              />
            </div>

            {/* backup if camera doesnt work */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Or enter pass code manually..."
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyAndCheckIn(manualCode)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="button" onClick={() => verifyAndCheckIn(manualCode)} disabled={!manualCode.trim()}>
                Check In
              </Button>
            </div>
          </div>
        </div>

        {/* shows who just scanned in */}
        <div className="lg:col-span-1">
          {panel === 'idle' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
              <ScanLine size={48} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Scan a visitor pass to check in</p>
            </div>
          )}

          {panel === 'loading' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[280px]">
              <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* green card when check in works */}
          {panel === 'success' && passInfo && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={32} className="text-green-600" />
                <div className="text-lg font-bold text-green-800">Checked In!</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-lg">
                  {passInfo.visitor?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{passInfo.visitor?.name}</div>
                  <div className="text-sm text-slate-500">{passInfo.visitor?.company || '—'}</div>
                </div>
              </div>

              <div className="text-sm space-y-1">
                <div><span className="text-slate-500">Host:</span> <span className="font-semibold">{passInfo.visitor?.host?.name || '—'}</span></div>
                <div><span className="text-slate-500">Purpose:</span> <span className="font-semibold">{passInfo.visitor?.purpose || '—'}</span></div>
                <div><span className="text-slate-500">Time:</span> <span className="font-semibold">{formatDateTime(new Date())}</span></div>
              </div>

              <Button type="button" variant="secondary" className="w-full" onClick={handleCheckOut}>
                Check Out
              </Button>

              {countdown !== null && (
                <p className="text-xs text-center text-slate-400">Resetting in {countdown}s...</p>
              )}
            </div>
          )}

          {/* red card when something goes wrong */}
          {panel === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3 text-center">
              <XCircle size={40} className="text-red-500 mx-auto" />
              <div className="font-bold text-red-700">Check-In Failed</div>
              <p className="text-sm text-red-600">{errorMsg}</p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => { setPanel('idle'); restartScanner() }}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-bold text-slate-700 mb-3">Recent Check-ins Today</div>
        {recentQ.isLoading && <div className="text-sm text-slate-400">Loading...</div>}
        {!recentQ.isLoading && (recentQ.data || []).length === 0 && (
          <div className="text-sm text-slate-400">No check-ins recorded today.</div>
        )}
        <div className="space-y-2">
          {(recentQ.data || []).slice(0, 10).map(log => (
            <div key={log._id} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
              <span className="font-semibold">{log.visitor?.name || '—'}</span>
              <span className="text-slate-500">{formatDateTime(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
