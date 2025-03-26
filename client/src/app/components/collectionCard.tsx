import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Collection } from "../types/types";

type CollectionProps = {
  collection: Collection;
  handleOpenEditSection: (collection: Collection) => void;
  index: number;
};

export default function CollectionCard({
  collection,
  handleOpenEditSection,
  index,
}: CollectionProps) {
  const router = useRouter();
  const hasCards = collection.cards.length > 0;
  const editRef = useRef<SVGSVGElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (editRef.current?.contains(e.target as Node)) {
      handleOpenEditSection(collection);
    } else if (hasCards) {
      router.push(`home/collection?name=${collection.name}`);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center border-2 border-gray-200 
        min-w-[300px] max-w-[300px] h-64 p-6 rounded-xl bg-white shadow-sm
        hover:shadow-md transition-all cursor-pointer opacity-0 animate-fadeIn
        overflow-hidden group"
      style={{ animation: `fadeIn 0.5s forwards ${index * 0.1}s` }}
      onClick={handleClick}
    >
      {/* Edit Button */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400 absolute top-4 right-4 
          hover:text-blue-500 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        ref={editRef}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>

      {/* Collection Icon */}
      <div className="mt-4 mb-6 text-blue-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      {/* Collection Name */}
      <h1 className="text-xl font-semibold text-gray-800 mb-2 px-4 truncate w-full text-center">
        {collection.name}
      </h1>

      {/* Category */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {collection.category}
        </span>
      </div>

      {/* Empty State */}
      {!hasCards && (
        <div className="flex flex-col items-center text-center mt-2 px-4">
          <span className="text-red-500 text-sm font-medium">
            ⚠️ Coleção vazia
          </span>
          <p className="text-gray-500 text-sm mt-1">
            Adicione cards para começar a estudar
          </p>
        </div>
      )}
    </div>
  );
}
