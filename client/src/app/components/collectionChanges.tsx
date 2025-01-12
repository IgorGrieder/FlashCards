"use client"
import { useState } from "react"
import Button from "./button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CardSchemaType, cardSchema } from "../schemas/cardSchema"

export default function CollectionChanges({ collection }: CollectionChangesProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [changedCollection, setChangedCollection] = useState(false);
  const collectionCards = collection.cards;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CardSchemaType>({
    resolver: zodResolver(cardSchema),
    defaultValues: collectionCards[currentCard]
  });

  const handleSaveEdits = () => {
    // saveing

  }

  // Function to handle moving to next/previous card
  const handleCardNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentCard < collectionCards.length - 1) {
      setCurrentCard(prev => prev + 1);
    } else if (direction === 'prev' && currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    }
  };

  return <div className="">
    <h1 className="text-3xl ">{collection.name}</h1>

    {/* Form to edit the current card */}
    <form
      onSubmit={handleSubmit(handleSaveEdits)}
      className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Entrar</h2>

      {/* Email Field */}
      <div className="mb-4">
        <label htmlFor="login" className="block text-sm font-medium mb-2">
          Email/usuário
        </label>
        <input
          id="question"
          type="text"
          {...register("question", {
            onChange: () => setChangedCollection(true),
          })}
          className={`w-full px-3 py-2 border rounded ${errors.question ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.question && (
          <p className="text-red-500 text-sm mt-1">{errors.login.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button text="Salvar edicao" onClick={handleSaveEdits}></Button>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-3 py-4 items-center text-sm transition-colors hover:text-white border-gray-300 border hover:bg-black sm:text-base rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed w-full justify-center flex`}"
      >
        {mutation.isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>

    <Button text="Voltar" onClick={() => handleCardNavigation("prev")}></Button>
    <Button text="Proxima" onClick={() => handleCardNavigation("next")}></Button>
  </div >
}
