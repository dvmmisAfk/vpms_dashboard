// pages/admin/AuditLogsPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { listAuditLogs } from '../../api/audit.js'
import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { formatDateTime } from '../../utils/formatDate.js'

// common audit action names - keeps the dropdown readable
const ACTION_OPTIONS = [
  'user-registered',
  'bootstrap-admin',
  'visitor-created',
  'visitor-approved',
  'visitor-rejected',
  'visitor-deleted',
  'pass-issued',
  'check-in',
  'check-out',
]

export default function AuditLogsPage() {
  const [actor, setActor] = useState('')
  const [action, setAction] = useState('')
  const [targetModel, setTargetModel] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const params = {}
  if (actor) params.actor = actor
  if (action) params.action = action
  if (targetModel) params.targetModel = targetModel
  if (start) params.start = new Date(start).toISOString()
  if (end) params.end = new Date(end).toISOString()

  const auditQ = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => listAuditLogs(params),
    staleTime: 15000,
  })

  const rows = auditQ.data || []

  const columns = [
    { key: 'when', label: 'When', render: row => formatDateTime(row.timestamp) },
    { key: 'actor', label: 'Actor', render: row => row.actor?.email || row.actor?.name || '—' },
    { key: 'action', label: 'Action', render: row => row.action },
    { key: 'target', label: 'Target', render: row => `${row.targetModel || ''}:${row.targetId || ''}` },
    { key: 'ip', label: 'IP', render: row => row.ip || '—' },
  ]

  return (
    <AppShell title="Audit logs" breadcrumbs={['Admin', 'Audit']}>
      <PageHeader title="Audit trail" subtitle="Server-side audit records with actor and IP." />

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <Input label="Actor id" value={actor} onChange={e => setActor(e.target.value)} />

        <Select label="Action" value={action} onChange={e => setAction(e.target.value)}>
          <option value="">Any</option>
          {ACTION_OPTIONS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Select>

        <Input label="Target model" value={targetModel} onChange={e => setTargetModel(e.target.value)} />
        <Input label="Start" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
        <Input label="End" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
      </div>

      <Table columns={columns} rows={rows} empty={auditQ.isLoading ? 'Loading...' : 'No audit entries'} />
    </AppShell>
  )
}
