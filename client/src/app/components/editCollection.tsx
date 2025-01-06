import { RefObject, useState } from "react";
import { Collection } from "../types/types";
import { useArrowMovement } from "../hooks/useArrowMovement";

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

  return (
    <section
      className="mt-[100px] bg-white py-10 px-5 border border-black rounded-2xl relative"
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
      <div className="px-5 py-10 flex flex-col items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#000000"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
        </svg>
      </div>
      <h1 className="text-2xl text-center">Editar coleção</h1>
    </section>
  );
}
