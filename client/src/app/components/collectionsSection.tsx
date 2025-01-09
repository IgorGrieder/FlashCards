import { useRef, useState } from "react";
import { Collection } from "../types/types";
import CollectionCard from "./collectionCard";
import LoadingSpinner from "./loadingSpinner";
import { useResizeObserver } from "../hooks/useResizeObserver";
import { useArrowMovement } from "../hooks/useArrowMovement";

type CollectionsSectionProps = {
  collections: Collection[];
  onEditCollection: (collection: Collection) => void;
};

export default function CollectionsSection({
  collections,
  onEditCollection,
}: CollectionsSectionProps) {
  const collectionsSection = useRef<HTMLDivElement>(null);
  const [numItems, setNumItens] = useState(0);
  const [startDisplay, setStartDisplay] = useState(0);

  // Overall function to trigger the collections movement
  const handleCollectionMovement = (moveTo: "left" | "right") => {
    setStartDisplay((prevStartDisplay) => {
      if (moveTo === "left" && prevStartDisplay > 0) {
        return prevStartDisplay - 1;
      } else if (
        moveTo === "right" &&
        prevStartDisplay + numItems < collections.length
      ) {
        return prevStartDisplay + 1;
      }
      return prevStartDisplay;
    });
  };

  // Use updated useArrowMovement with bounds checking
  const { start, stop } = useArrowMovement((direction) => {
    const currentDisplay = startDisplay;
    if (
      (direction === "left" && currentDisplay > 0) ||
      (direction === "right" && currentDisplay + numItems < collections.length)
    ) {
      handleCollectionMovement(direction);
    }
  });

  // Dynamically update `numItems` based on container size
  useResizeObserver(collectionsSection, (entry) => {
    const elementWidth = entry.contentRect.width;
    setNumItens(Math.max(1, Math.floor(elementWidth / 300)));
  });

  return (
    <section className="flex items-center rounded-2xl border border-black px-5 py-10 bg-white h-full gap-1">
      {/* Left arrow pagination*/}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="40px"
        viewBox="0 -960 960 960"
        width="40px"
        fill="currentColor"
        className={`${startDisplay > 0 ? "cursor-pointer opacity-100 hover:text-black" : "opacity-60 cursor-auto"} text-gray-300 mr-auto w-[40px]`}
        onClick={() => {
          handleCollectionMovement("left");
        }}
        onMouseEnter={() => {
          start("left");
        }}
        onMouseLeave={() => {
          stop();
        }}
      >
        <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
      </svg>
      <div
        ref={collectionsSection}
        className="flex items-center w-full justify-evenly flex-1 gap-1 overflow-hidden"
      >
        {collections.length > 0 && numItems !== 0 ? (
          collections.map((collection, index) => {
            if (index >= startDisplay && index <= startDisplay + numItems - 1) {
              return (
                <CollectionCard
                  key={crypto.randomUUID()}
                  collection={collection}
                  handleOpenEditSection={onEditCollection}
                  index={index}
                />
              );
            }
          })
        ) : (
          <LoadingSpinner />
        )}
      </div>
      {/* Right arrow pagination */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="40px"
        viewBox="0 -960 960 960"
        width="40px"
        fill="currentColor"
        className={`${startDisplay + numItems < collections.length ? "cursor-pointer opacity-100 hover:text-black" : "opacity-60 cursor-auto"} text-gray-300 ml-auto w-[40px]`}
        onClick={() => {
          handleCollectionMovement("right");
        }}
        onMouseEnter={() => {
          start("right");
        }}
        onMouseLeave={() => {
          stop();
        }}
      >
        <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
      </svg>
    </section>
  );
}
