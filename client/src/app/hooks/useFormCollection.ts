import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CardSchemaType, cardSchema } from "../schemas/cardSchema";

export default function useFormCollection() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CardSchemaType>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      answer: "",
      category: "",
      question: "",

    }

  });

  return { register, handleSubmit, formState: { errors }, control }

} 
