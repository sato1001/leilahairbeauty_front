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

export interface ServicesResponse {
  services: ServiceItem[];
}

export interface ServiceSingleResponse {
  service: ServiceItem;
}
