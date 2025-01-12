import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants/constants";

const imageSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Image size must be under 5MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Invalid image format. Only JPEG, PNG, and GIF are allowed."
  ).optional();

export const cardSchema = z.object({
  question: z.string().min(1, "Preencha a sua pergunta"),
  answer: z.string().min(1, "Preencha a sua resposta"),
  category: z.string().min(1, "Preencha a sua categoria"),
  img: imageSchema
})

export type CardSchemaType = z.infer<typeof cardSchema>;
