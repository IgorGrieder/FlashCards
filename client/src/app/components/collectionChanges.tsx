"use client"
import { useContext, useRef, useState } from "react"
import Button from "./button"
import { Controller } from "react-hook-form"
import { CardSchemaType } from "../schemas/cardSchema"
import { ACCEPTED_IMAGE_TYPES } from "../constants/constants"
import { useMutation } from "@tanstack/react-query";
import { AxiosPromise } from "axios"
import { Collection, CollectionUpdateResponse, ImageRef } from "../types/types"
import { api } from "../libs/axios"
import { UserContext } from "../context/userContext"
import CustomFileInput from "./customFileFiled"
import useFormCollection from "../hooks/useFormCollection"
import convertToBase64 from "../utils/convertBase64"

type CollectionChangesProps = {
  collection: Collection
  handleClose: VoidFunction
}

export default function CollectionChanges({ collection, handleClose }: CollectionChangesProps) {
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
  } = useFormCollection({ card: collectionCards[currentCard] });

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

      // Closing the section
      handleClose();
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
    const result = await api.patch("/cards/update-card", {
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

  // Function to handle moving to next/previous card
  const handleCardNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentCard < collectionCards.length - 1) {
      setCurrentCard(prev => prev + 1);
    } else if (direction === 'prev' && currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 transition-transform duration-200 ease-in-out" >
      {/* Form to edit the current card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-[700px] mt-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Flash Card</h2>

        {/* Question field */}
        <div className="mb-4" >
          <label htmlFor="question" className="block text-sm font-medium mb-2">
            Questäo
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
          )
          }
        </div >

        {/* Answer field */}
        < div className="mb-4" >
          <label htmlFor="answer" className="block text-sm font-medium mb-2">
            Resposta
          </label>
          <input
            id="answer"
            type="text"
            {...register("answer")}
            className={`w-full px-3 py-2 border rounded ${errors.answer ? "border-red-500" : "border-gray-300"
              }`}
          />
          {
            errors.answer && (
              <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
            )
          }
        </div >

        {/* Category field */}
        < div className="mb-4" >
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Categoria
          </label>
          <input
            id="category"
            type="text"
            {...register("category")}
            className={`w-full px-3 py-2 border rounded ${errors.category ? "border-red-500" : "border-gray-300"
              }`}
          />
          {
            errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )
          }
        </div >

        {/* Image Upload Field */}
        < div >
          <label>Imagem</label>
          <Controller
            name="img"
            control={control}
            render={({ field }) => (
              <CustomFileInput
                field={field}
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                buttonText="Upload"
                buttonTextColor="text-black"
                buttonBgColor="bg-white"
              >
              </CustomFileInput>
            )}
          />
          {errors.img && <p>{errors.img.message}</p>}
        </div >

        {/* Submit Button */}
        < div className="flex gap-2 items-center justify-center mt-2" >
          <Button text="Voltar" disable={currentCard <= 0} onClick={() => handleCardNavigation("prev")}></Button>
          <Button text="Proxima" disable={currentCard + 1 >= collectionCards.length} onClick={() => handleCardNavigation("next")}></Button>
        </div >
        <Button type="submit" additionalClasses="my-5 ml-auto" disable={mutation.isPending} text={mutation.isPending ? "Salvando..." : "Salvar edicao"} ></Button>
      </form >

    </div >)
}
