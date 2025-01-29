"use client";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
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
  editSection: RefObject<HTMLElement>;
  handleCloseEditSection: VoidFunction;
};

export default function EditCollection({
  collection,
  editSection,
  handleCloseEditSection,
}: EditCollectionProps) {
  const [editCollection, setEditCollection] = useState(false);
  const [modalDeletingCollection, setModalDeletingColection] = useState(false);
  const [newCardSection, setNewCardSection] = useState(false);
  const collectionRef = useRef<HTMLDivElement>(null);
  const deleteCollectionModal = useRef<HTMLDivElement>(null);
  const userCtx = useContext(UserContext);


  // Handle collection edit 
  const handleEditCollection = () => {
    setEditCollection(true);
  }

  const handleAddCardSection = () => {
    setNewCardSection(true);
  }

  // Use useEffect to perform actions after the DOM updates
  useEffect(() => {
    if (editCollection && collectionRef.current) {
      // Scroll the div into view after it's rendered
      collectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [editCollection]);

  // Use useEffect to perform actions after the DOM updates
  useEffect(() => {
    if (deleteCollectionModal && deleteCollectionModal.current) {
      // Scroll the div into view after it's rendered
      deleteCollectionModal.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [modalDeletingCollection]);

  const deleteCollection = async (): AxiosPromise<DeletionResponse> => {
    const result = await api.post("/cards/delete-collection", {
      collectionId: collection._id,
    });
    return result;
  };

  const mutation = useMutation({ mutationFn: deleteCollection });

  // Deletion function
  const deletion = async () => {
    try {
      // Making the post request to our api to login the user
      const request = await mutation.mutateAsync();

      // If the collection was deleted we will remove the modal and the user context
      if (request.status === 204) {
        setModalDeletingColection(false);
        const newArray = userCtx?.user?.collections.filter(
          (item) => item._id !== collection._id,
        );

        // Updating the context
        userCtx?.dispatch({
          type: "UPDATE",
          payload: {
            collections: newArray,
          },
        });

        // Closing the edit section
        handleCloseEditSection();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Set the deletion action to the backend
  const handleCollectionDeletion = () => {
    deletion();
  };

  return (
    <section
      className="mt-[100px] bg-white py-10 px-5 justify-center flex flex-col border border-black rounded-2xl relative"
      ref={editSection}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="#000000"
        className="absolute top-[24px] right-[24px] cursor-pointer"
        onClick={handleCloseEditSection}
      >
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
      </svg>
      <h1 className="text-3xl bolder text-center">{collection.name}</h1>
      <div className="mx-auto flex gap-2 items-center mt-5">
        <Button
          text="Excluir colecao"
          onClick={() => setModalDeletingColection(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            className="cursor-pointer mr-2 hover:white"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </Button>
        <Button text="Editar colecao" onClick={handleEditCollection}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            className="hover:white mr-2"
          >
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
          </svg>
        </Button>
        <Button text="Adicionar Card" onClick={handleAddCardSection}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
        </Button>

      </div>

      {/* Edit collections section*/}
      <div
        ref={collectionRef}
      >
        {editCollection && (<CollectionChanges
          collection={collection}
          handleClose={() => handleCloseEditSection()}></CollectionChanges>
        )
        }
      </div>

      {/* New card section*/}
      {newCardSection && <NewCardSection collection={collection}></NewCardSection>}

      {/* Modal for user to delete a collection */}
      {
        modalDeletingCollection && (
          <div ref={deleteCollectionModal} className="w-2/3 mx-auto mt-5 rounded-lg px-4 py-5 border border-black animate-fadeIn">
            <h1 className="text-xl text-center">
              Voce tem certeza de que quer excluir a colecao?
            </h1>
            <div className="flex gap-2 mt-2 justify-center items-center">
              <Button text="Sim" onClick={handleCollectionDeletion}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                  className="hover:text-white mr-2"
                >
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                </svg>
              </Button>
              <Button text="Nao" onClick={() => setModalDeletingColection(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                  className="hover:text-white mr-2"
                >
                  {" "}
                  <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                </svg>
              </Button>
            </div>
          </div>
        )
      }
    </section >
  );
}
