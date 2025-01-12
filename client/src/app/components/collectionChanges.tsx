"use client"
import { useState } from "react"
import Button from "./button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CardSchemaType, cardSchema } from "../schemas/cardSchema"
import { ACCEPTED_IMAGE_TYPES } from "../constants/constants"

export default function CollectionChanges({ collection }: CollectionChangesProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [changedCollection, setChangedCollection] = useState(false);
  const collectionCards = collection.cards;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CardSchemaType>({
    resolver: zodResolver(cardSchema),
    defaultValues: collectionCards[currentCard]
  });

  const onSubmit = async (data: CardSchemaType) => {
    try {
      if (data.img) {
        const file = data.img;
        // Convert image to Base64
        const base64Image = await convertToBase64(file);

        // Process other fields
        console.log("Category:", data.category);
        console.log("Base64 Image:", base64Image);

      }
    } catch (error) {
      console.log(error)
    }


    return { register, handleSubmit, onSubmit };
  };

  // Function to convert to base 64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        } else {
          reject("Failed to read file.");
        }
      };
      reader.onerror = () => reject("Error reading file.");
      reader.readAsDataURL(file);
    });
  };

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

      {/* Question field */}
      <div className="mb-4">
        <label htmlFor="question" className="block text-sm font-medium mb-2">
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
          <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
        )}
      </div>

      {/* Answer field */}
      <div className="mb-4">
        <label htmlFor="answer" className="block text-sm font-medium mb-2">
          Email/usuário
        </label>
        <input
          id="answer"
          type="text"
          {...register("answer", {
            onChange: () => setChangedCollection(true),
          })}
          className={`w-full px-3 py-2 border rounded ${errors.answer ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.answer && (
          <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
        )}
      </div>

      {/* Category field */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Email/usuário
        </label>
        <input
          id="category"
          type="text"
          {...register("category", {
            onChange: () => setChangedCollection(true),
          })}
          className={`w-full px-3 py-2 border rounded ${errors.category ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Image Upload Field */}
      <div>
        <label>Image Upload</label>
        <Controller
          name="img"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
              value={undefined}
            />
          )}
        />
        {errors.img && <p>{errors.img.message}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" disable={mutation.isPending} text={mutation.isPending ? "Salvando..." : "Salvar edicao"} onClick={handleSaveEdits}></Button>
    </form>

    <Button text="Voltar" onClick={() => handleCardNavigation("prev")}></Button>
    <Button text="Proxima" onClick={() => handleCardNavigation("next")}></Button>
  </div >
}
