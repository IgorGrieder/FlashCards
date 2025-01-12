"use client"
import { useState } from "react"
import { Collection } from "../types/types"
import Button from "./button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

type CollectionChangesProps = {
  collection: Collection
}

const cardSchema = z.object({
  question: z.string().min(1, "Preencha a sua pergunta"),
  answer: z.string().min(1, "Preencha a sua resposta"),
  category: z.string().min(1, "Preencha a sua categoria")
});

type CardSchemaType = z.infer<typeof cardSchema>;

export default function CollectionChanges({ collection }: CollectionChangesProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [changedCollection, setChangedCollection] = useState(false);
  const cardsCollection = collection.cards;

  // React hook form usage
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardSchemaType>({
    resolver: zodResolver(cardSchema),
    defaultValues: cardsCollection[currentCard]
  });



  const handleSaveEdits = () => {
    // saveing

  }

  const handleNextCard = () => {
    // saveing
  }
  const handlePrevCard = () => {
    // saveing
  }


  return <div className="">
    <Button text="Salvar edicao" onClick={handleSaveEdits}></Button>
    <h1 className="text-3xl ">{collection.name}</h1>

    <Button text="Voltar" onClick={handlePrevCard}></Button>
    <Button text="Proxima" onClick={handleNextCard}></Button>
  </div>
}
