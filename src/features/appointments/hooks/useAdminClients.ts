"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointments/services/appointment.service";
import type { CreateAdminClientPayload } from "@/features/appointments/types/appointment.types";

export function useAdminClients(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["admin-clients", params],
    queryFn: () => appointmentsService.listClients(params),
  });
}

export function useSearchAdminClients(q: string, limit = 20) {
  const trimmed = q.trim();

  return useQuery({
    queryKey: ["admin-clients", "search", trimmed, limit],
    queryFn: () => appointmentsService.searchClients({ q: trimmed, limit }),
    enabled: trimmed.length >= 2,
  });
}

export function useCreateAdminClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminClientPayload) => appointmentsService.createClient(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
    },
  });
}
