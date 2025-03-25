import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .string()
    .min(3, "Login deve ter pelo menos 3 caracteres")
    .max(50, "Login não pode ter mais de 50 caracteres")
    .refine(
      (value) => {
        // Check if it's a valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if it's a valid username (alphanumeric and underscores)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        return emailRegex.test(value) || usernameRegex.test(value);
      },
      {
        message: "Login deve ser um email válido ou um nome de usuário válido",
      },
    ),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
