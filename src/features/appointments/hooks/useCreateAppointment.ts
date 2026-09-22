"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointments/services/appointment.service";
import type { CreateAppointmentPayload } from "@/features/appointments/types/appointment.types";

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
