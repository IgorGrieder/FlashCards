import { Controller } from "react-hook-form" import { ACCEPTED_IMAGE_TYPES } from "../constants/constants"
import Button from "./button"
import CustomFileInput from "./customFileFiled"
import useFormCollection from "../hooks/useFormCollection"
import { useContext, useRef } from "react"
import { UserContext } from "../context/userContext"
import { AxiosPromise } from "axios"
import { useMutation } from "react-query"
import { api } from "../libs/axios"
import { CardSchemaType } from "../schemas/cardSchema"
import { ImageRef, AddCardToCollectionResponse, Collection, CreateCollectionResponse } from "../types/types"
import { z } from "zod"

const cardSchema = z.object({
  name: z.string().min(1, "Preencha o nome"),
  category: z.string().min(1, "Preencha a categoria"),
})

type CollectionSchemaType = z.infer<typeof cardSchema>;

export default function NewCollectionSection() {
  const userCtx = useContext(UserContext)

  // React hook forms usage
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormCollection()

  const onSubmit = async (data: CollectionSchemaType) => {
    try {
      const request = await mutation.mutateAsync(data);

      // If the request was successful we will update the context
      if (request.status === 201 && userCtx?.user?.collections) {
        const collectionIdx = userCtx.user.collections.findIndex((item) => item._id === collection._id)

        // Updating the context
        if (collectionIdx !== -1 && request?.data.card) {
          const collections = userCtx.user.collections.map((collection, index) => {

            if (index === collectionIdx) {

              // Create a new collection object with the updated cards array
              if (request.data.card) {

                return {
                  ...collection,
                  cards: [...collection.cards, request.data.card]
                };
              }
            }
            return collection;
          });

          if (collections) {

            userCtx.dispatch({
              type: "UPDATE",
              payload: {
                collections: collections
              }
            })
          }
        }
      }
    } catch (e) {
      alert("Um erro ocorreu, tente novamente.")
      console.log(e)
    }
  }

  // Function to proceed the request to the backend 
  const createCollection = async (credentials: CollectionSchemaType): AxiosPromise<CreateCollectionResponse> => {

    const result = api.patch("/cards/create-collection", {
      name: credentials.name,
      category: credentials.category,
    })

    return result;
  }

  // Tan Stack query mutation
  const mutation = useMutation({ mutationFn: createCollection })

  return (
    <div className="inset-0 flex fixed justify-center items-center">
      {/* Form to edit the current card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-[700px] mt-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Flash Card</h2>

        {/* Name field */}
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium mb-2">
            Questäo
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={`w-full px-3 py-2 border rounded ${errors.question ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.question && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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


        {/* Submit Button */}
        <Button type="submit" additionalClasses="my-5 ml-auto" disable={mutation.isPending} text={mutation.isPending ? "Salvando..." : "Salvar"} ></Button>
      </form >
    </div>

  )
}

