export type UserRole = "CLIENT" | "ADMIN" | "STAFF" | string;

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}

export interface RegisterResponse {
  user: User;
}
