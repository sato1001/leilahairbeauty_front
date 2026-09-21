import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({ message: "Informe seu nome completo" })
      .trim()
      .min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z
      .string({ message: "Informe seu e-mail" })
      .trim()
      .email("Informe um e-mail válido"),
    phone: z.string().trim().optional().or(z.literal("")),
    password: z
      .string({ message: "Informe sua senha" })
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z
      .string({ message: "Confirme sua senha" })
      .min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RegisterPayload = Omit<RegisterFormValues, "confirmPassword">;
