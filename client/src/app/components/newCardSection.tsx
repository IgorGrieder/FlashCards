import Button from "./button"
import useFormCollection from "../hooks/useFormCollection"
import { useContext } from "react"
import { UserContext } from "../context/userContext"
import { AxiosPromise } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../libs/axios"
import { CardSchemaType } from "../schemas/cardSchema"
import { AddCardToCollectionResponse, Collection, Card } from "../types/types"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants/constants"

type NewCardSectionProps = {
  collection: Collection
  handleClose: VoidFunction
}

export default function NewCardSection({ collection, handleClose }: NewCardSectionProps) {
  const userCtx = useContext(UserContext);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormCollection({ card: null });

  const onSubmit = async (data: CardSchemaType) => {
    try {
      const request = await mutation.mutateAsync(data);

      if (request.status === 201 && request.data.newCard) {
        const collectionsUpdated = userCtx?.user?.collections?.map((col) => {
          if (col._id === collection._id) {
            const newCard: Card = {
              answer: data.answer,
              question: data.question,
              topic: data.topic,
              _id: request.data.newCard,
              img: request.data.imageURL || null // Use the URL from backend response
            };
            return {
              ...col,
              cards: [...col.cards, newCard]
            };
          }
          return col;
        });

        userCtx?.dispatch({
          type: "UPDATE",
          payload: { collections: collectionsUpdated }
        });

        // Invalidating the query
        queryClient.invalidateQueries({
          queryKey: ['collection-images', collection._id]
        });
        handleClose();
      }
    } catch (e) {
      alert("Um erro ocorreu, tente novamente.");
      console.log(e);
    }
  };

  const createCard = async (credentials: CardSchemaType): AxiosPromise<AddCardToCollectionResponse> => {
    const formData = new FormData();
    formData.append("question", credentials.question);
    formData.append("answer", credentials.answer);
    formData.append("topic", credentials.topic);
    formData.append("collectionId", collection._id);

    // Properly handle FileList type
    if (credentials.img && credentials.img.length > 0) {
      formData.append("file", credentials.img[0]); // Access first file in FileList
    }

    return await api.post("/cards/add-card", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  const mutation = useMutation({
    mutationFn: createCard,
  });

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
            onClick={handleClose}
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
            <label htmlFor="img" className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo
            </label>
            <input
              id="img"
              type="file"
              {...register("img", {
                validate: {
                  validType: (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
                  validSize: (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE
                }
              })}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.img
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />
            {errors.img && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.img.message}
              </p>
            )}
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
