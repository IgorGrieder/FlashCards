import Button from "./button"
import { useContext } from "react"
import { UserContext } from "../context/userContext"
import { AxiosPromise } from "axios"
import { useMutation } from "@tanstack/react-query";
import { api } from "../libs/axios"
import { CreateCollectionResponse } from "../types/types"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const collectionSchema = z.object({
  name: z.string().min(1, "Preencha o nome"),
  category: z.string().min(1, "Preencha a categoria"),
})

type CollectionSchemaType = z.infer<typeof collectionSchema>;

type NewCollectionSectionProps = {
  handleClose: VoidFunction
}

export default function NewCollectionSection({ handleClose }: NewCollectionSectionProps) {
  const userCtx = useContext(UserContext)

  // React hook forms usage
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectionSchemaType>({ resolver: zodResolver(collectionSchema) })

  const onSubmit = async (data: CollectionSchemaType) => {
    try {
      const request = await mutation.mutateAsync(data);

      // If the request was successful we will update the context
      if (request.status === 201 && userCtx?.user?.collections) {
        // Updating the context
        if (request?.data.collection) {
          const collections = [...userCtx?.user.collections, request.data.collection]

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

      // Closing the section
      handleClose();
    } catch (e) {
      alert("Um erro ocorreu, tente novamente.")
      console.log(e)
    }
  }

  // Function to proceed the request to the backend 
  const createCollection = async (credentials: CollectionSchemaType): AxiosPromise<CreateCollectionResponse> => {
    const result = await api.post("cards/create-collection", {
      name: credentials.name,
      category: credentials.category,
    })

    return result;
  }

  // Tan Stack query mutation
  const mutation = useMutation({ mutationFn: createCollection })

  return (
    <div className="inset-0 flex fixed justify-center items-center bg-black/60">
      {/* Form to edit the current card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-[700px] mt-4"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Colecao Nova</h2>

        {/* Name field */}
        <div className="mb-4">
          <label htmlFor="question" className="block text-sm font-medium mb-2">
            Nome
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={`w-full px-3 py-2 border rounded ${errors.name ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.name && (
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
        <Button type="submit" additionalClasses="my-5 ml-auto" disable={mutation.isPending} text={mutation.isPending ? "Criando..." : "Criar"} ></Button>
      </form >
    </div>

  )
}

