import { z } from "zod";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants/constants";

export const imageSchema = z.object({
  data: z.instanceof(Buffer),
  contentType: z.string().refine(type => ACCEPTED_IMAGE_TYPES.includes(type), {
    message: "Unsupported file type. Please upload JPEG, PNG, or WebP"
  }),
  filename: z.string(),
  size: z.number().max(MAX_FILE_SIZE, "Image size must be less than 10MB")
}).optional();

export const cardSchema = z.object({
  question: z.string().min(1, "Preencha a sua pergunta"),
  answer: z.string().min(1, "Preencha a sua resposta"),
  category: z.string().min(1, "Preencha a sua categoria"),
  img: z.union([
    z.custom<File>(),
    imageSchema
  ]).optional()
});

export type CardSchemaType = z.infer<typeof cardSchema>;
