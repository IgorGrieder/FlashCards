import { Controller } from "react-hook-form"
import Button from "./button"
import CustomFileInput from "./customFileFiled"
import useFormCollection from "../hooks/useFormCollection"
import { useContext, useRef, useEffect } from "react"
import { UserContext } from "../context/userContext"
import { AxiosPromise } from "axios"
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios"
import { CardSchemaType } from "../schemas/cardSchema"
import { ImageRef, AddCardToCollectionResponse, Collection, Card } from "../types/types"
import convertToBase64 from "../utils/convertBase64"

type NewCardSectionProps = {
  collection: Collection
  handleClose: VoidFunction
}

export default function NewCardSection({ collection, handleClose }: NewCardSectionProps) {
  const imageRef = useRef<ImageRef>({ base64: null, contentType: null })
  const userCtx = useContext(UserContext)
  const abortControllerRef = useRef(new AbortController())
  const isMounted = useRef(true)

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false
      abortControllerRef.current.abort()
    }
  }, [])

  // React hook forms usage
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useFormCollection({ card: null })

  const onSubmit = async (data: CardSchemaType) => {
    try {
      const request = await mutation.mutateAsync(data)

      if (isMounted.current && request.status === 201 && request.data.newCard) {
        const collectionsUpdated = userCtx?.user?.collections?.map((col) => {
          if (col._id === collection._id) {
            const newCard: Card = {
              answer: data.answer,
              question: data.question,
              topic: data.topic,
              _id: request.data.newCard,
              img: imageRef.current.base64 ? {
                data: imageRef.current.base64,
                contentType: imageRef.current.contentType || 'image/*'
              } : null
            }
            return {
              ...col,
              cards: [...col.cards, newCard]
            }
          }
          return col
        })

        if (isMounted.current) {
          userCtx?.dispatch({
            type: "UPDATE",
            payload: { collections: collectionsUpdated }
          })
          handleClose()
        }
      }
    } catch (e) {
      if (isMounted.current) {
        alert("Um erro ocorreu, tente novamente.")
        console.log(e)
      }
    }
  }

  // Function to proceed the request to the backend 
  const createCard = async (credentials: CardSchemaType): AxiosPromise<AddCardToCollectionResponse> => {
    abortControllerRef.current = new AbortController()

    if (credentials.img) {
      const { base64, type } = await convertToBase64(credentials.img)
      imageRef.current = { base64, contentType: type }
    }

    return api.post("/cards/add-card", {
      card: {
        img: imageRef.current.base64 ? {
          base64: imageRef.current.base64,
          type: imageRef.current.contentType
        } : null,
        question: credentials.question,
        answer: credentials.answer,
        topic: credentials.topic,
      },
      collectionId: collection._id
    }, {
      signal: abortControllerRef.current.signal
    })
  }

  // Tan Stack query mutation
  const mutation = useMutation({
    mutationFn: createCard,
    onSettled: () => {
      imageRef.current = { base64: null, contentType: null }
    }
  })

  const handleSafeClose = () => {
    abortControllerRef.current.abort()
    if (isMounted.current) {
      handleClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-800">Novo Flash Card</h2>
          <button
            type="button"
            onClick={handleSafeClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={mutation.isPending}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        <div className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Questão
            </label>
            <input
              id="question"
              type="text"
              {...register("question")}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.question
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.question.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Resposta
            </label>
            <input
              id="answer"
              type="text"
              {...register("answer")}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.answer
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {errors.answer && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.answer.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              id="topic"
              type="text"
              {...register("topic")}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.topic
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {errors.topic && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.topic.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="img"
              control={control}
              render={({ field, fieldState }) => (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Imagem
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>

                  <CustomFileInput
                    field={field}
                    accept="image/*"
                    buttonText="Selecionar imagem"
                    buttonTextColor="text-white"
                    buttonBgColor="bg-blue-600 hover:bg-blue-700"
                  />

                  {fieldState.error && (
                    <p className="mt-1 text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          additionalClasses="w-full mt-6 py-3 justify-center"
          disable={mutation.isPending}
          text={mutation.isPending ? "Salvando..." : "Criar Card"}
        />
      </form>
    </div>
  )
}
