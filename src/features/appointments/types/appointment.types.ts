export interface AppointmentServiceItemResponse {
  service_id: number;
  service_name: string;
  price_charged: number;
  status: string;
}

export interface AppointmentClientResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface AdminClientResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
}

export interface ListAdminClientsResponse {
  clients: AdminClientResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateAdminClientPayload {
  name: string;
  phone: string;
  email?: string | null;
}

export interface CreateAdminClientResponse {
  client: AdminClientResponse;
}

export interface AppointmentDetailResponse {
  id: number;
  client: AppointmentClientResponse;
  client_id: number;
  created_by: number;
  scheduled_at: string;
  ends_at: string;
  status: string;
  channel: string;
  duration: number;
  total: number;
  services: AppointmentServiceItemResponse[];
  created_at: string;
  updated_at: string;
}

export interface SameWeekSuggestion {
  suggested_date: string;
  reference_appointment_id: number;
}

export interface ListAppointmentsResponse {
  appointments: AppointmentDetailResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface CreateAppointmentPayload {
  scheduled_at: string;
  services: number[];
  client_id?: number;
}

export interface UpdateAppointmentPayload {
  scheduled_at?: string;
  services?: number[];
}

export interface AppointmentResponse {
  appointment: AppointmentDetailResponse;
}

export interface CreateAppointmentResponse {
  appointment: AppointmentDetailResponse;
  suggestion?: SameWeekSuggestion;
}

export interface WeeklyPerformanceSummary {
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface WeeklyPerformanceMostBookedService {
  service_id: number | string;
  name: string;
  quantity: number;
}

export interface WeeklyPerformanceResponse {
  week_start: string;
  week_end: string;
  summary: WeeklyPerformanceSummary;
  revenue: number;
  most_booked_service: WeeklyPerformanceMostBookedService | null;
}
