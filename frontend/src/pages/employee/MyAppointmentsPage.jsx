import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAppointments, useApproveAppointment, useCancelAppointment } from '../../hooks/useAppointments.js'
import { APPOINTMENT_STATUSES } from '../../utils/constants.js'
import { formatDateTime } from '../../utils/formatDate.js'

export default function MyAppointmentsPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')

  const params = {}
  if (date) params.date = date
  if (status) params.status = status

  const apptQ = useAppointments(params)
  const rows = apptQ.data || []

  const approveM = useApproveAppointment()
  const cancelM = useCancelAppointment()

  const handleApprove = async (id) => {
    try {
      await approveM.mutateAsync(id)
      toast.success('Appointment approved')
    } catch (e) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id) => {
    try {
      await cancelM.mutateAsync(id)
      toast.success('Appointment cancelled')
    } catch (e) {
      toast.error('Failed to reject')
    }
  }

  const columns = [
    { key: 'visitor', label: 'Visitor', render: (row) => row.visitor?.name || '—' },
    { key: 'company', label: 'Company', render: (row) => row.visitor?.company || '—' },
    { key: 'when', label: 'Scheduled', render: (row) => formatDateTime(row.scheduledAt) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant="status" value={row.status}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.visitor?._id && (
            <button
              type="button"
              onClick={() => navigate(`/visitors/${row.visitor._id}`)}
              className="text-indigo-600 text-xs font-semibold hover:underline"
            >
              View
            </button>
          )}
          {row.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => handleApprove(row._id)}
                disabled={approveM.isPending}
                className="text-green-600 text-xs font-semibold hover:underline disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleReject(row._id)}
                disabled={cancelM.isPending}
                className="text-red-500 text-xs font-semibold hover:underline disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <AppShell title="My Appointments" breadcrumbs={['Employee', 'Appointments']}>
      <PageHeader
        title="My Appointments"
        subtitle="Visitors you have invited or scheduled. Results are filtered to your account."
      />

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          label="Filter by date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any</option>
          {Object.values(APPOINTMENT_STATUSES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {(date || status) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => { setDate(''); setStatus('') }}
              className="text-sm text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Table
        columns={columns}
        rows={rows}
        empty={apptQ.isLoading ? 'Loading...' : 'No appointments found'}
      />
    </AppShell>
  )
}
