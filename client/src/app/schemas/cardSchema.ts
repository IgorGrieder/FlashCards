import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants/constants";

export const cardSchema = z.object({
  question: z.string().min(1, "Preencha a sua pergunta"),
  answer: z.string().min(1, "Preencha a sua resposta"),
  topic: z.string().min(1, "Preencha o seu conteudo"),
  img: z.custom<FileList>()
    .refine(files => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      "Image size must be under 5MB")
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Invalid image format. Only JPEG, PNG, and GIF are allowed.")
    .optional()
});
export type CardSchemaType = z.infer<typeof cardSchema>;
