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
  const [touchStart, setTouchStart] = useState(0); // Added touch state

  const handleCollectionMovement = (moveTo: "left" | "right") => {
    setStartDisplay((prev) => {
      if (moveTo === "left" && prev > 0) return prev - 1;
      if (moveTo === "right" && prev + numItems < collections.length) return prev + 1;
      return prev;
    });
  };

  // Added touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      handleCollectionMovement(diff > 0 ? 'right' : 'left');
    }
  };

  const { start, stop } = useArrowMovement((direction) => {
    if (
      (direction === "left" && startDisplay > 0) ||
      (direction === "right" && startDisplay + numItems < collections.length)
    ) {
      handleCollectionMovement(direction);
    }
  });

  useResizeObserver(collectionsSection, (entry) => {
    const elementWidth = entry.contentRect.width;
    setNumItens(Math.max(1, Math.floor(elementWidth / 300)));
  });

  const progress = collections.length > 0
    ? Math.ceil((startDisplay + numItems) / collections.length * 100)
    : 0;

  return (
    <section className="relative group bg-white rounded-2xl shadow-lg p-6 h-full">
      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center pr-4 z-10 ml-2">
        <button
          className={`p-3 rounded-full transition-all ${startDisplay > 0
            ? "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black"
            : "opacity-40 cursor-not-allowed"
            }`}
          onClick={() => handleCollectionMovement("left")}
          onMouseEnter={() => start("left")}
          onMouseLeave={stop}
          disabled={startDisplay === 0}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center pl-4 z-10 mr-2">
        <button
          className={`p-3 rounded-full transition-all ${startDisplay + numItems < collections.length
            ? "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black"
            : "opacity-40 cursor-not-allowed"
            }`}
          onClick={() => handleCollectionMovement("right")}
          onMouseEnter={() => start("right")}
          onMouseLeave={stop}
          disabled={startDisplay + numItems >= collections.length}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-100 rounded-full">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Collections Container with Touch Handlers */}
      <div
        ref={collectionsSection}
        className="flex items-center justify-center gap-6 h-full overflow-hidden mt-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {collections.length > 0 && numItems !== 0 ? (
          collections.map((collection, index) => (
            index >= startDisplay && index <= startDisplay + numItems - 1 && (
              <CollectionCard
                key={collection._id || crypto.randomUUID()}
                collection={collection}
                handleOpenEditSection={onEditCollection}
                index={index}
              />
            )
          ))
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </section>
  );
}
