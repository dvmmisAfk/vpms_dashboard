import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { AppShell } from '../../components/layout/AppShell.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { useCreateAppointment, useAppointments, useCancelAppointment } from '../../hooks/useAppointments.js'
import { formatDateTime } from '../../utils/formatDate.js'

export default function InviteVisitorPage() {
  const [submitted, setSubmitted] = useState(null) // holds the visitor name after success

  const createM = useCreateAppointment()
  const cancelM = useCancelAppointment()

  // employees auto-filtered to their own on the server
  const apptQ = useAppointments({})

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { purpose: 'Meeting' }
  })

  const onSubmit = async (values) => {
    try {
      // combine date + time into a single ISO string
      const scheduledAt = new Date(`${values.scheduledDate}T${values.scheduledTime}`).toISOString()

      await createM.mutateAsync({
        visitorName: values.visitorName,
        visitorEmail: values.visitorEmail || undefined,
        visitorPhone: values.visitorPhone || undefined,
        company: values.company || undefined,
        purpose: values.purpose,
        scheduledAt,
        notes: values.notes || undefined,
      })

      setSubmitted(values.visitorName)
      reset()
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to send invitation'
      toast.error(msg)
    }
  }

  const handleInviteAnother = () => {
    setSubmitted(null)
  }

  return (
    <AppShell title="Invite Visitor" breadcrumbs={['Employee', 'Invite Visitor']}>
      <PageHeader
        title="Invite a Visitor"
        subtitle="Fill in the form below. The visitor will receive an email with pre-registration instructions."
      />

      {/* success state */}
      {submitted ? (
        <Card>
          <div className="text-center py-6">
            <div className="text-3xl mb-3">✓</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Invitation Sent!</h3>
            <p className="text-slate-500 text-sm mb-6">
              <span className="font-semibold">{submitted}</span> will receive an email with pre-registration instructions.
            </p>
            <Button type="button" onClick={handleInviteAnother}>
              Invite Another
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Visitor Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('visitorName', { required: 'Visitor name is required' })}
                />
                {errors.visitorName && <p className="text-red-500 text-xs mt-1">{errors.visitorName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visitor Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('visitorEmail')}
                />
                {errors.visitorEmail && <p className="text-red-500 text-xs mt-1">{errors.visitorEmail.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('visitorPhone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('company')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('purpose')}
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Interview">Interview</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
                {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().slice(0, 10)}
                  {...register('scheduledDate', { required: 'Date is required' })}
                />
                {errors.scheduledDate && <p className="text-red-500 text-xs mt-1">{errors.scheduledDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scheduled Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('scheduledTime', { required: 'Time is required' })}
                />
                {errors.scheduledTime && <p className="text-red-500 text-xs mt-1">{errors.scheduledTime.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Any special instructions or additional info..."
                {...register('notes')}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={createM.isPending}>
                Send Invitation
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* pending invites table */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3">My Pending Invites</h3>

        {apptQ.isLoading && <div className="text-sm text-slate-400">Loading...</div>}

        {!apptQ.isLoading && (apptQ.data || []).length === 0 && (
          <div className="text-sm text-slate-400 bg-white rounded-xl border border-slate-200 p-4">
            No appointments yet.
          </div>
        )}

        {(apptQ.data || []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Visitor</th>
                  <th className="text-left px-4 py-3">Scheduled</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(apptQ.data || []).map(appt => (
                  <tr key={appt._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {appt.visitor?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(appt.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="status" value={appt.status}>{appt.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {appt.status === 'pending' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await cancelM.mutateAsync(appt._id)
                              toast.success('Appointment cancelled')
                            } catch (e) {
                              toast.error('Failed to cancel')
                            }
                          }}
                          className="text-red-500 text-xs font-semibold hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
