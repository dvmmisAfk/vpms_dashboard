import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { approveVisitor, createVisitor, getVisitor, listVisitors, rejectVisitor } from '../api/visitors.js'

export function useVisitorsList(params) {
  return useQuery({
    queryKey: ['visitors', params],
    queryFn: () => listVisitors(params),
    staleTime: 30000,
  })
}

export function useVisitorDetail(id) {
  return useQuery({
    queryKey: ['visitor', id],
    queryFn: () => getVisitor(id),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useCreateVisitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVisitor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  })
}

export function useApproveVisitor(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => approveVisitor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors'] })
      qc.invalidateQueries({ queryKey: ['visitor', id] })
    },
  })
}

export function useRejectVisitor(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => rejectVisitor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors'] })
      qc.invalidateQueries({ queryKey: ['visitor', id] })
    },
  })
}
