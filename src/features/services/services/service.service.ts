import { apiClient } from "@/lib/api/client";
import type {
  ServiceSingleResponse,
  ServicesResponse,
} from "@/features/services/types/service.types";

export const servicesService = {
  list: () => apiClient.get<ServicesResponse>("/services").then((response) => response.services),
  getById: (id: number) => apiClient.get<ServiceSingleResponse>(`/services/${id}`).then((response) => response.service),
};
