import { apiClient } from "@/lib/api/client";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/features/auth/types/auth.types";

export const authService = {
  login: (payload: LoginPayload) => apiClient.post<LoginResponse>("/auth/login", payload),
  register: (payload: RegisterPayload) => apiClient.post<RegisterResponse>("/auth/register", payload),
};
