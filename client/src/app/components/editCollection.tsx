import { RefObject, useState } from "react";
import { Collection } from "../types/types";
import { useArrowMovement } from "../hooks/useArrowMovement";
import Button from "./button";

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
  const [currentCard, setCurrentCard] = useState(0);
  const cardsCollection = collection.cards;
  const [editCollection, setEditCollection] = useState(false);


  // Overall function to trigger the collections movement
  const handleCollectionMovement = (moveTo: "left" | "right") => {
    setCurrentCard((prevStartDisplay) => {
      if (moveTo === "left" && prevStartDisplay > 0) {
        return prevStartDisplay - 1;
      } else if (
        moveTo === "right" &&
        prevStartDisplay < cardsCollection.length
      ) {
        return prevStartDisplay + 1;
      }
      return prevStartDisplay;
    });
  };

  // Use updated useArrowMovement with bounds checking
  const { start, stop } = useArrowMovement((direction) => {
    const currentDisplay = currentCard;
    if (
      (direction === "left" && currentDisplay > 0) ||
      (direction === "right" && currentDisplay < cardsCollection.length)
    ) {
      handleCollectionMovement(direction);
    }
  });

  // Function to handle collection deletion
  const handleRemoveCollection = () => {

  }

  return (
    <section
      className="mt-[100px] bg-white py-10 px-5 flex justify-center flex flex-col border border-black rounded-2xl relative"
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
      <div className="mx-auto flex gap-2 items-center">
        <Button text="Excluir colecao" onClick={handleRemoveCollection}>
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
        <Button text="Editar colecao" onClick={() => setEditCollection(true)}>
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
      </div>
    </section>
  );
}
