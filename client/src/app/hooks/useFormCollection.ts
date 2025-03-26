import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CardSchemaType, cardSchema } from "../schemas/cardSchema";
import { Card } from "../types/types";

type Props = {
  card: Card | null;
}

export default function useFormCollection(props: Props) {
  const answer = props.card ? props.card.answer : "";
  const question = props.card ? props.card.question : "";
  const topic = props.card ? props.card.topic : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CardSchemaType>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      answer: answer,
      topic: topic,
      question: question,
    }

  });

  return { register, handleSubmit, formState: { errors }, control }

} 
