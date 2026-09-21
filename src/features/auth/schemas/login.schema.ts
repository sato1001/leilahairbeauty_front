import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "Informe seu e-mail" })
    .trim()
    .email("Informe um e-mail válido"),
  password: z.string({ message: "Informe sua senha" }).min(1, "Informe sua senha"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
