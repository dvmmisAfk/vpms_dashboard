// hooks/useVisitors.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { approveVisitor as approveVisitorApi, createVisitor as createVisitorApi, getVisitor, listVisitors, rejectVisitor as rejectVisitorApi, updateVisitor as updateVisitorApi } from "../api/visitors.js";

export function useVisitorsList(params) {
  return useQuery({
    queryKey: ["visitors", params],
    queryFn: () => listVisitors(params),
    staleTime: 30_000,
    keepPreviousData: true,
  });
}

export function useVisitorDetail(id) {
  return useQuery({
    queryKey: ["visitor", id],
    queryFn: () => getVisitor(id),
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useCreateVisitor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createVisitorApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitors"] }),
  });
}

export function useApproveVisitor(id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => approveVisitorApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      qc.invalidateQueries({ queryKey: ["visitor", id] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useRejectVisitor(id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => rejectVisitorApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      qc.invalidateQueries({ queryKey: ["visitor", id] });
    },
  });
}

export function useUpdateVisitor(id) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateVisitorApi(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitors"] });
      qc.invalidateQueries({ queryKey: ["visitor", id] });
    },
  });
}
