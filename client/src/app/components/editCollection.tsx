"use client";
import { useContext, useState } from "react";
import { Collection, DeletionResponse } from "../types/types";
import Button from "./button";
import { useMutation } from "@tanstack/react-query";
import { AxiosPromise } from "axios";
import { api } from "../libs/axios";
import { UserContext } from "../context/userContext";
import CollectionChanges from "./collectionChanges";
import NewCardSection from "./newCardSection";

type EditCollectionProps = {
  collection: Collection;
  handleCloseEditSection: VoidFunction;
};

export default function EditCollection({
  collection,
  handleCloseEditSection,
}: EditCollectionProps) {
  const [activeModal, setActiveModal] = useState<"edit" | "delete" | "new-card" | null>(null);
  const userCtx = useContext(UserContext);

  const deleteCollection = async (): AxiosPromise<DeletionResponse> => {
    return await api.post("/collections/delete-collection", {
      collectionId: collection._id,
    });
  };

  const mutation = useMutation({ mutationFn: deleteCollection });

  const handleCollectionDeletion = async () => {
    try {
      await mutation.mutateAsync();
      const newArray = userCtx?.user?.collections.filter(
        (item) => item._id !== collection._id,
      );

      userCtx?.dispatch({
        type: "UPDATE",
        payload: { collections: newArray },
      });

      handleCloseEditSection();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Main Edit Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{collection.name}</h2>
          <button
            onClick={handleCloseEditSection}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            text="Adicionar Card"
            onClick={() => setActiveModal("new-card")}
          >
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }

          </Button>

          <Button
            text="Editar Coleção"
            onClick={() => setActiveModal("edit")}

          >
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
          </Button>

          <Button
            onClick={() => setActiveModal("delete")}
            text="Excluir Coleção"
          >
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }

          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Confirmar exclusão
              </h3>
              <p className="text-gray-600">
                Tem certeza que deseja excluir permanentemente esta coleção?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button text="Cancelar" onClick={() => setActiveModal(null)}>
              </Button>
              <Button text="Confirmar Exclusão" onClick={handleCollectionDeletion}>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {activeModal === "edit" && (
        <CollectionChanges
          collection={collection}
          handleClose={() => setActiveModal(null)}
        />
      )}

      {/* New Card Modal */}
      {activeModal === "new-card" && (
        <NewCardSection
          collection={collection}
          closeSection={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
