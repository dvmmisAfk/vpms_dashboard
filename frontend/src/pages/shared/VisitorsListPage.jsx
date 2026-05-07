// shows all visitors with filters
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

import { listVisitors, createVisitor } from '../../api/visitors.js'
import { exportVisitorsCsv } from '../../api/dashboard.js'
import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { Pagination } from '../../components/ui/Pagination.jsx'
import { formatDateTime } from '../../utils/formatDate.js'

const STATUSES = ['pending', 'approved', 'checked-in', 'checked-out', 'rejected']

export default function VisitorsListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  // wait for them to stop typing before searching
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(t)
  }, [q])

  const visitorsQ = useQuery({
    queryKey: ['visitors', debouncedQ, status, page],
    queryFn: () => listVisitors({ q: debouncedQ, status: status || undefined, page, limit: 10 }),
    staleTime: 15000
  })

  const rows = visitorsQ.data?.data || []
  const meta = visitorsQ.data?.meta || { total: 0, page: 1 }
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / 10))

  const handleExport = async () => {
    try {
      const blob = await exportVisitorsCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'visitors.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  // each visitor row in the table
  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      render: row => (
        <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
          {row.photoUrl
            ? <img src={row.photoUrl} alt="" className="h-full w-full object-cover" />
            : <span className="text-xs font-bold text-slate-400">{row.name && row.name.charAt(0)}</span>
          }
        </div>
      )
    },
    { key: 'name', label: 'Name', render: row => row.name },
    { key: 'email', label: 'Email', render: row => row.email || '—' },
    { key: 'company', label: 'Company', render: row => row.company || '—' },
    { key: 'host', label: 'Host', render: row => row.host?.name || '—' },
    {
      key: 'status',
      label: 'Status',
      render: row => <Badge variant="status" value={row.status}>{row.status}</Badge>
    },
    { key: 'created', label: 'Created', render: row => formatDateTime(row.createdAt) }
  ]

  return (
    <AppShell title="Visitors" breadcrumbs={['Directory', 'Visitors']}>
      <PageHeader
        title="Visitors"
        subtitle="Search, filter, and manage visitor records."
        actions={
          <Button type="button" onClick={() => setShowModal(true)}>
            Add Visitor
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          label="Search"
          placeholder="Name, email, company..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <Select label="Status" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <div className="md:col-span-2 flex items-end justify-end">
          <button
            type="button"
            onClick={handleExport}
            className="text-sm text-indigo-600 font-semibold hover:underline"
          >
            Export CSV
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        rows={rows}
        onRowClick={row => navigate(`/visitors/${row._id}`)}
        empty={visitorsQ.isLoading ? 'Loading...' : 'No visitors found'}
      />

      <Pagination page={meta.page || page} totalPages={totalPages} onChange={setPage} />

      {showModal && (
        <AddVisitorModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            qc.invalidateQueries({ queryKey: ['visitors'] })
            toast.success('Visitor added!')
          }}
        />
      )}
    </AppShell>
  )
}

function AddVisitorModal({ onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => {
        if (v) fd.append(k, v)
      })
      await createVisitor(fd)
      onSuccess()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add visitor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add Visitor" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" {...register('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" {...register('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" {...register('company')} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" {...register('purpose')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Visitor</Button>
        </div>
      </form>
    </Modal>
  )
}
