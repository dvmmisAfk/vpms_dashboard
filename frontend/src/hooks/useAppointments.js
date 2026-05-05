// hooks/useAppointments.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveAppointment as approveAppointmentApi,
  cancelAppointment as cancelAppointmentApi,
  createAppointment as createAppointmentApi,
  listAppointments,
} from "../api/appointments.js";

export function useAppointments(params) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => listAppointments(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createAppointmentApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useApproveAppointment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => approveAppointmentApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => cancelAppointmentApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}
