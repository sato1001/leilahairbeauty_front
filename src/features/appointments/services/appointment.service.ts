import { apiClient } from "@/lib/api/client";
import type {
  CreateAppointmentPayload,
  CreateAppointmentResponse,
} from "@/features/appointments/types/appointment.types";

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("leila_auth_token");
}

export const appointmentsService = {
  create: (payload: CreateAppointmentPayload) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Você precisa estar autenticado para criar um agendamento.");
    }

    return apiClient.post<CreateAppointmentResponse>("/appointments", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
