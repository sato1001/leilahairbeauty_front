import { apiClient } from "@/lib/api/client";
import type {
  AppointmentResponse,
  CreateAppointmentPayload,
  CreateAppointmentResponse,
  ListAppointmentsResponse,
  UpdateAppointmentPayload,
  WeeklyPerformanceResponse,
} from "@/features/appointments/types/appointment.types";

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("leila_auth_token");
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Você precisa estar autenticado para acessar os agendamentos.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export const appointmentsService = {
  list: (params: {
    page?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.status) searchParams.set("status", params.status);
    if (params.start_date) searchParams.set("start_date", params.start_date);
    if (params.end_date) searchParams.set("end_date", params.end_date);

    const query = searchParams.toString();
    const path = query ? `/appointments?${query}` : "/appointments";

    return apiClient.get<ListAppointmentsResponse>(path, {
      headers: getAuthHeaders(),
    });
  },

  getById: (id: number) =>
    apiClient.get<AppointmentResponse>(`/appointments/${id}`, {
      headers: getAuthHeaders(),
    }),

  create: (payload: CreateAppointmentPayload) =>
    apiClient.post<CreateAppointmentResponse>("/appointments", payload, {
      headers: getAuthHeaders(),
    }),

  update: (id: number, payload: UpdateAppointmentPayload) =>
    apiClient.patch<AppointmentResponse>(`/appointments/${id}`, payload, {
      headers: getAuthHeaders(),
    }),

  cancel: (id: number) =>
    apiClient.delete<AppointmentResponse>(`/appointments/${id}`, {
      headers: getAuthHeaders(),
    }),

  confirm: (id: number) =>
    apiClient.patch<AppointmentResponse>(`/appointments/${id}/confirm`, {}, {
      headers: getAuthHeaders(),
    }),

  complete: (id: number) =>
    apiClient.patch<AppointmentResponse>(`/appointments/${id}/complete`, {}, {
      headers: getAuthHeaders(),
    }),

  getWeeklyPerformance: (week_start?: string) => {
    const params = new URLSearchParams();

    if (week_start) {
      params.set("week_start", week_start);
    }

    const query = params.toString();
    const path = query
      ? `/appointments/weekly-performance?${query}`
      : "/appointments/weekly-performance";

    return apiClient.get<WeeklyPerformanceResponse>(path, {
      headers: getAuthHeaders(),
    });
  },
};
