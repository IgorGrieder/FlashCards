import { Controller } from "react-hook-form"
import { ACCEPTED_IMAGE_TYPES } from "../constants/constants"
import Button from "./button"
import CustomFileInput from "./customFileFiled"
import useFormCollection from "../hooks/useFormCollection"
import { useContext, useRef } from "react"
import { UserContext } from "../context/userContext"
import { AxiosPromise } from "axios"
import { useMutation } from "react-query"
import { api } from "../libs/axios"
import { CardSchemaType } from "../schemas/cardSchema"
import { ImageRef, CollectionUpdateResponse } from "../types/types"
import convertToBase64 from "../utils/convertBase64"

export default function NewCollectionSection() {

  const imageRef = useRef<ImageRef>({ base64: null, contentType: null })
  const userCtx = useContext(UserContext)
  // React hook forms usage
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useFormCollection()

  // Function to proceed the request to the backend 
  const createCard = async (credentials: CardSchemaType): AxiosPromise<CollectionUpdateResponse> => {
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
  const mutation = useMutation({ mutationFn: createCard })

  return (
    <div className="inset-0 flex fixed justify-center items-center">
      {/* Form to edit the current card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-[700px] mt-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Flash Card</h2>

        {/* Question field */}
        <div className="mb-4">
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
          )}
        </div>

        {/* Answer field */}
        <div className="mb-4">
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
          {errors.answer && (
            <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
          )}
        </div>

        {/* Category field */}
        <div className="mb-4">
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
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Image Upload Field */}
        <div>
          <label>Imagem</label>
          <Controller
            name="img"
            control={control}
            render={({ field }) => (
              < CustomFileInput
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
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 items-center justify-center mt-2">
          <Button text="Voltar" disable={currentCard <= 0} onClick={() => handleCardNavigation("prev")}></Button>
          <Button text="Proxima" disable={currentCard + 1 >= collectionCards.length} onClick={() => handleCardNavigation("next")}></Button>
        </div>
        <Button type="submit" additionalClasses="my-5 ml-auto" disable={mutation.isPending} text={mutation.isPending ? "Salvando..." : "Salvar edicao"} ></Button>
      </form >
    </div>

  )
}
