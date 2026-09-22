import { apiClient } from "@/lib/api/client";
import type {
  CreateServicePayload,
  ServiceMutationResponse,
  ServiceSingleResponse,
  ServicesResponse,
  UpdateServicePayload,
} from "@/features/services/types/service.types";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("leila_auth_token");

  if (!token) {
    throw new Error("Você precisa estar autenticado para gerenciar serviços.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export const servicesService = {
  list: () => apiClient.get<ServicesResponse>("/services").then((response) => response.services),
  getById: (id: number) =>
    apiClient.get<ServiceSingleResponse>(`/services/${id}`).then((response) => response.service),
  create: (payload: CreateServicePayload) =>
    apiClient.post<ServiceMutationResponse>("/services", payload, {
      headers: getAuthHeaders(),
    }),
  update: (id: number, payload: UpdateServicePayload) =>
    apiClient.patch<ServiceMutationResponse>(`/services/${id}`, payload, {
      headers: getAuthHeaders(),
    }),
  remove: (id: number) =>
    apiClient.delete<ServiceMutationResponse>(`/services/${id}`, {
      headers: getAuthHeaders(),
    }),
};
