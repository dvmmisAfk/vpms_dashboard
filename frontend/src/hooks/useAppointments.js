import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveAppointment, cancelAppointment, createAppointment, listAppointments } from '../api/appointments.js'

export function useAppointments(params) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => listAppointments(params),
    staleTime: 30000,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['visitors'] })
    },
  })
}

export function useApproveAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => approveAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      qc.invalidateQueries({ queryKey: ['visitors'] })
    },
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => cancelAppointment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
