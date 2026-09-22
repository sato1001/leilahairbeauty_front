import { z } from "zod";

export const bookingFormSchema = z.object({
  scheduled_at: z
    .string()
    .min(1, "Selecione a data e o horário do atendimento.")
    .refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
    }, "A data do agendamento deve ser no futuro."),
  services: z
    .array(z.number().int().positive("Selecione pelo menos um serviço válido."))
    .min(1, "Selecione pelo menos um serviço."),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const adminBookingFormSchema = bookingFormSchema.extend({
  client_id: z
    .number({ message: "Selecione um cliente." })
    .int()
    .positive("Selecione um cliente."),
});

export type AdminBookingFormValues = z.infer<typeof adminBookingFormSchema>;

export const createAdminClientFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  phone: z.string().trim().min(1, "Telefone é obrigatório."),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Informe um email válido.",
    }),
});

export type CreateAdminClientFormValues = z.infer<typeof createAdminClientFormSchema>;
