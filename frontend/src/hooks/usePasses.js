import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deactivatePass, fetchMyPass, generatePass, listPasses, verifyPassCode } from '../api/passes.js'

export function usePassesList() {
  return useQuery({
    queryKey: ['passes'],
    queryFn: listPasses,
    staleTime: 15000,
  })
}

export function useIssuePass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ visitorId, payload }) => generatePass(visitorId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['passes'] })
      qc.invalidateQueries({ queryKey: ['visitors'] })
    },
  })
}

export function useDeactivatePass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deactivatePass(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passes'] }),
  })
}

export function useMyPass() {
  return useQuery({
    queryKey: ['my-pass'],
    queryFn: fetchMyPass,
    staleTime: 10000,
  })
}
