import { z } from "zod";

export const collectionSchema = z.object({
  name: z.string().min(1, "Preencha o nome"),
  category: z.string().min(1, "Preencha a categoria"),
})

export type CollectionSchemaType = z.infer<typeof collectionSchema>;

