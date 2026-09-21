"use client";

import { useQuery } from "@tanstack/react-query";

import { servicesService } from "@/features/services/services/service.service";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => servicesService.list(),
  });
}
