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

  // Handle click to redirect to the collection card section
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    // Check if the clicked element matches the editRef
    if (editRef.current && editRef.current.contains(e.target as Node)) {
      handleOpenEditSection(collection);
    } else if (hasCards) {
      router.push(`home/collection?name=${collection.name}`);
    }
  };

  return (
    <div
      className="border border-black flex flex-col gap-2 relative min-w-[300px] py-5 px-2 rounded-xl text-black text-center cursor-pointer bg-neutral-100 opacity-0 animate-fadeIn"
      style={{
        animation: `fadeIn 0.5s forwards ${index * 0.1}s`, // Delayed animation
      }}
      onClick={handleClick}
    >
      <div className="mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="30px"
          viewBox="0 -960 960 960"
          width="30px"
          fill="#000000"
          className=""
        >
          <path d="m159-168-34-14q-31-13-41.5-45t3.5-63l72-156v278Zm160 88q-33 0-56.5-23.5T239-160v-240l106 294q3 7 6 13.5t8 12.5h-40Zm206-4q-32 12-62-3t-42-47L243-622q-12-32 2-62.5t46-41.5l302-110q32-12 62 3t42 47l178 488q12 32-2 62.5T827-194L525-84Zm-86-476q17 0 28.5-11.5T479-600q0-17-11.5-28.5T439-640q-17 0-28.5 11.5T399-600q0 17 11.5 28.5T439-560Zm58 400 302-110-178-490-302 110 178 490ZM319-650l302-110-302 110Z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">{collection.name}</h1>
      <div
      >
        <span className="font-semibold">Categoria</span>
        <h2>{collection.category}</h2>
        {!hasCards && <h2>Você não possui cards na sua coleção!</h2>}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#000000"
          ref={editRef}

        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
        </svg>

      </div>
    </div>
  );
}
