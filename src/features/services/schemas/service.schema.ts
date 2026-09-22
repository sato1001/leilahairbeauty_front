import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  description: z.string().trim().default(""),
  duration_minutes: z.preprocess(
    (value) => (value === "" || value === null ? undefined : Number(value)),
    z.number().int("Duração deve ser um número inteiro.").min(1, "Duração deve ser maior que 0."),
  ),
  price: z.preprocess(
    (value) => (value === "" || value === null ? undefined : Number(value)),
    z.number().min(0, "Preço deve ser maior ou igual a 0."),
  ),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
