// hooks/usePasses.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deactivatePass as deactivatePassApi, fetchMyPass, generatePass as generatePassApi, listPasses, verifyPassCode } from "../api/passes.js";

export function usePassesList() {
  return useQuery({
    queryKey: ["passes"],
    queryFn: listPasses,
    staleTime: 15_000,
  });
}

export function useVerifyPass(passCode) {
  return useQuery({
    queryKey: ["pass-verify", passCode],
    queryFn: () => verifyPassCode(passCode),
    enabled: Boolean(passCode),
    staleTime: 5_000,
  });
}

export function useIssuePass() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ visitorId, payload }) => generatePassApi(visitorId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["passes"] });
      qc.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useDeactivatePass() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => deactivatePassApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["passes"] }),
  });
}

export function useMyPass() {
  return useQuery({
    queryKey: ["my-pass"],
    queryFn: fetchMyPass,
    staleTime: 10_000,
  });
}
