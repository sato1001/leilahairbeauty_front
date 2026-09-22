"use client";

import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointments/services/appointment.service";

export function useWeeklyPerformance(weekStart?: string) {
  return useQuery({
    queryKey: ["weekly-performance", weekStart ?? "current"],
    queryFn: () => appointmentsService.getWeeklyPerformance(weekStart),
    enabled: typeof window !== "undefined",
    staleTime: 60_000,
  });
}
