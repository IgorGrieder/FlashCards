"use client"
import { useContext, useRef, useState } from "react"
import Button from "./button"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CardSchemaType, cardSchema } from "../schemas/cardSchema"
import { ACCEPTED_IMAGE_TYPES } from "../constants/constants"
import { useMutation } from "@tanstack/react-query";
import { AxiosPromise } from "axios"
import { Collection, CollectionUpdateResponse, ImageRef } from "../types/types"
import { api } from "../libs/axios"
import { UserContext } from "../context/userContext"

type CollectionChangesProps = {
  collection: Collection
}

export default function CollectionChanges({ collection }: CollectionChangesProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const collectionCards = collection.cards;
  const userCtx = useContext(UserContext);
  const imageRef = useRef<ImageRef>({ base64: null, contentType: null })

  // React hook forms usage
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CardSchemaType>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      answer: collectionCards[currentCard].answer,
      category: collectionCards[currentCard].question,
      question: collectionCards[currentCard].question,
    }

  });

  // On submit function 
  const onSubmit = async (data: CardSchemaType) => {
    try {
      const request = await mutation.mutateAsync(data);

      // If the request was successfull we proceed updating the context
      if (request.status === 204) {
        const newCollection = userCtx?.user?.collections;

        // Updating the card in the context
        if (newCollection) {
          for (const cols of newCollection) {
            if (cols._id === collection._id) {
              if (cols.cards) {
                for (const card of cols.cards) {
                  if (card._id === collection.cards[currentCard]._id.toString()) {
                    card.category = data.category;
                    card.question = data.question;
                    card.answer = data.answer;
                    if (imageRef.current.base64 && imageRef.current.contentType) {
                      card.img = {
                        data: imageRef.current.base64,
                        contentType: imageRef.current.contentType
                      }
                    } else {
                      card.img = null
                    }

                  }
                }
              }
            }
          }
        }
        userCtx?.dispatch({
          type: "UPDATE",
          payload: {
            collections: newCollection
          }
        })
      }
    } catch (error) {
      alert("Um erro ocorreu, tente novamente.")
      console.log(error)
    }
  };

  // Function to proceed the request to the backend 
  const updateCard = async (credentials: CardSchemaType): AxiosPromise<CollectionUpdateResponse> => {
    // We need to convert the image to base64 to store in mongoDB
    if (credentials.img) {
      const file = credentials.img;
      const { base64, type } = await convertToBase64(file);
      imageRef.current.base64 = base64;
      imageRef.current.contentType = type;
    }

    const cardToUpdate = collectionCards[currentCard];
    const result = api.patch("/cards/update-card", {
      card: {
        cardId: cardToUpdate._id,
        collectionId: collection._id
      },
      newCard: {
        img: imageRef.current.base64 ? { base64: imageRef.current.base64, type: imageRef.current.contentType } : null,
        question: credentials.question,
        answer: credentials.answer,
        category: credentials.category,
      }
    })

    return result;
  }

  // Tan Stack query mutation
  const mutation = useMutation({ mutationFn: updateCard })

  // Function to convert to base 64
  const convertToBase64 = (file: File): Promise<{ base64: string, type: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve({ base64: reader.result.toString(), type: file.type });
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
      onSubmit={handleSubmit(onSubmit)}
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
          {...register("question")}
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
          {...register("answer")}
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
          {...register("category")}
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
      <Button type="submit" disable={mutation.isPending} text={mutation.isPending ? "Salvando..." : "Salvar edicao"} ></Button>
    </form>

    <Button text="Voltar" onClick={() => handleCardNavigation("prev")}></Button>
    <Button text="Proxima" onClick={() => handleCardNavigation("next")}></Button>
  </div >
}
