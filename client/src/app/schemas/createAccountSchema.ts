import { z } from "zod";

export const createSchema = z.object({
  email: z.string().email("Insira um email válido"),
  username: z
    .string()
    .min(3, "Usuário deve ter pelo menos 3 caracteres")
    .max(50, "Usuário não pode ter mais de 50 caracteres")
    .refine(
      (value) => {
        // Check if it's a valid username (alphanumeric and underscores)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        return usernameRegex.test(value);
      },
      {
        message: "Insira um nome de usuário válido",
      },
    ),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(50, "Senha não pode ter mais de 50 caracteres"),
});

export type CreateAccountSchemaType = z.infer<typeof createSchema>;

