"use client";

import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointments/services/appointment.service";

export function useAppointments(params: {
  page?: number;
  limit?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
} = {}) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentsService.list(params),
  });
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: () => appointmentsService.getById(id),
    enabled: !!id,
  });
}
