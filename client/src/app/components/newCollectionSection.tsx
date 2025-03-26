import Button from "./button"
import { useContext } from "react"
import { UserContext } from "../context/userContext"
import { AxiosPromise } from "axios"
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios"
import { CreateCollectionResponse } from "../types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CollectionSchemaType, collectionSchema } from "../schemas/collectionSchema";


type NewCollectionSectionProps = {
  handleClose: VoidFunction
}

export default function NewCollectionSection({ handleClose }: NewCollectionSectionProps) {
  const userCtx = useContext(UserContext)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectionSchemaType>({ resolver: zodResolver(collectionSchema) })

  const onSubmit = async (data: CollectionSchemaType) => {
    try {
      const request = await mutation.mutateAsync(data);
      if (request.status === 201 && userCtx?.user?.collections) {
        if (request?.data.collection) {
          const collections = [...userCtx?.user.collections, request.data.collection]
          if (collections) {
            userCtx.dispatch({
              type: "UPDATE",
              payload: { collections: collections }
            })
          }
        }
      }
      handleClose();
    } catch (e) {
      alert("Um erro ocorreu, tente novamente.")
      console.log(e)
    }
  }

  const createCollection = async (credentials: CollectionSchemaType): AxiosPromise<CreateCollectionResponse> => {
    return await api.post("collections/create-collection", {
      name: credentials.name,
      category: credentials.category,
    })
  }

  const mutation = useMutation({ mutationFn: createCollection })

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50" onClick={handleClose}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onClick={e => e.stopPropagation()}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex justify-between items-start mb-8">
          <h2 className="sm:text-4xl text-2xl font-bold text-gray-800">Nova Coleção</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Coleção
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <input
              id="category"
              type="text"
              {...register("category")}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.category
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {errors.category && (
              <p className="mt-2 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              additionalClasses="w-full justify-center py-3"
              disable={mutation.isPending}
              text={mutation.isPending ? "Criando..." : "Criar Coleção"}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
