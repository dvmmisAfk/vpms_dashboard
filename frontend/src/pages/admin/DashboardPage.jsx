// main dashboard for admins and staff
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Clock, CreditCard, LogIn } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import { fetchDashboardStats, fetchRecentCheckIns } from '../../api/dashboard.js'
import { listCheckLogs } from '../../api/checks.js'
import { listVisitors } from '../../api/visitors.js'
import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { StatsCard } from '../../components/common/StatsCard.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatDateTime } from '../../utils/formatDate.js'

// idk if these are good colors but they look ok
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b']

export default function DashboardPage() {
  const { hasAnyRole } = useAuth()

  // top row numbers
  const statsQ = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 15000
  })

  // last few checkins
  const recentQ = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: fetchRecentCheckIns,
    staleTime: 10000
  })

  // get last 7 days of check logs for the line chart
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const weekLogsQ = useQuery({
    queryKey: ['check-logs-week'],
    queryFn: () => listCheckLogs({ start: sevenDaysAgo.toISOString() }),
    staleTime: 30000
  })

  const visitorsPurposeQ = useQuery({
    queryKey: ['visitors-purpose'],
    queryFn: () => listVisitors({ page: 1, limit: 200 }),
    staleTime: 60000,
    enabled: hasAnyRole(['admin', 'security'])
  })

  // visitor trends - group check-ins by day
  const logs = weekLogsQ.data || []
  const buckets = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    buckets.push({ day: d.toISOString().slice(0, 10), checkIns: 0 })
  }
  for (const log of logs) {
    if (log.action !== 'check-in') continue
    const day = new Date(log.timestamp).toISOString().slice(0, 10)
    const bucket = buckets.find(b => b.day === day)
    if (bucket) bucket.checkIns++
  }

  // pie chart data
  const visitors = visitorsPurposeQ.data?.data || []
  const purposeTally = {}
  for (const v of visitors) {
    const p = v.purpose || 'unknown'
    purposeTally[p] = (purposeTally[p] || 0) + 1
  }
  const purposePie = Object.entries(purposeTally).map(([name, value]) => ({ name, value }))

  const recentColumns = [
    { key: 'name', label: 'Visitor', render: row => row.visitor?.name || '—' },
    { key: 'company', label: 'Company', render: row => row.visitor?.company || '—' },
    { key: 'host', label: 'Scanned By', render: row => row.scannedBy?.name || '—' },
    { key: 'time', label: 'Check-in Time', render: row => formatDateTime(row.timestamp) },
    {
      key: 'status',
      label: 'Status',
      render: row => (
        <Badge variant="status" value={row.visitor?.status}>
          {row.visitor?.status || 'checked-in'}
        </Badge>
      )
    }
  ]

  return (
    <AppShell title="Dashboard" breadcrumbs={['Home', 'Dashboard']}>
      <PageHeader
        title="Overview"
        subtitle="Visitor counts, approvals, and recent activity."
        actions={
          <div className="flex gap-2">
            {hasAnyRole(['admin', 'security']) && (
              <Link
                to="/issue-pass"
                className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Issue Pass
              </Link>
            )}
            {hasAnyRole(['admin']) && (
              <Link
                to="/reports"
                className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50"
              >
                View Reports
              </Link>
            )}
          </div>
        }
      />

      {/* top row numbers */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatsCard title="Visitors Today" value={statsQ.data?.totalVisitorsToday ?? '—'} icon={Users} />
        <StatsCard title="Pending Approvals" value={statsQ.data?.pendingApprovals ?? '—'} icon={Clock} />
        <StatsCard title="Active Passes" value={statsQ.data?.activePasses ?? '—'} icon={CreditCard} />
        <StatsCard title="Checked In Now" value={statsQ.data?.checkedInNow ?? '—'} icon={LogIn} />
      </div>

      {/* visitor trends */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Check-ins — last 7 days">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={buckets}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="checkIns" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Visitors by purpose">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={purposePie} dataKey="value" nameKey="name" outerRadius={90}>
                  {purposePie.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* last few checkins */}
      <Card className="mt-4" title="Recent Check-ins">
        {/* TODO: make a proper loading state */}
        {recentQ.isLoading && <p className="text-sm text-slate-400">Loading...</p>}
        {!recentQ.isLoading && (
          <Table
            columns={recentColumns}
            rows={recentQ.data || []}
            empty="No recent check-ins"
          />
        )}
      </Card>
    </AppShell>
  )
}
