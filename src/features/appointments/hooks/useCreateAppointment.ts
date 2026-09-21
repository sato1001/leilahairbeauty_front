"use client";

import { useMutation } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointments/services/appointment.service";
import type { CreateAppointmentPayload } from "@/features/appointments/types/appointment.types";

export function useCreateAppointment() {
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsService.create(payload),
  });
}
