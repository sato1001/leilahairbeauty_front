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
