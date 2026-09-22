export interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateServicePayload = {
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  active?: boolean;
};

export type UpdateServicePayload = Partial<CreateServicePayload>;

export interface ServicesResponse {
  services: ServiceItem[];
}

export interface ServiceSingleResponse {
  service: ServiceItem;
}

export interface ServiceMutationResponse {
  service: ServiceItem;
  message?: string;
}
