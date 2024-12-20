import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Collection } from "../types/types";

type CollectionProps = {
  collection: Collection;
  handleOpenEditSection: (collection: Collection) => void;
};

export default function CollectionCard({
  collection,
  handleOpenEditSection,
}: CollectionProps) {
  const router = useRouter();
  const hasCards = collection.cards.length > 0;
  const editRef = useRef<HTMLDivElement>(null);

  // Handle click to redirect to the collection card section
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // If the number of cards of the collection is greater than zero we will display the game
    e.preventDefault();
    if (e.target === editRef.current) {
      handleOpenEditSection(collection);
    } else if (hasCards) {
      router.push(`home/collection?name=${collection.name}`);
    }
  };

  return (
    <div
      className="border border-black flex flex-col gap-2 relative w-[300px] py-5 px-2 rounded-xl text-black text-center cursor-pointer bg-neutral-100"
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
      <div>
        <span className="font-semibold">Categoria:</span>
        <h2>{collection.category}</h2>
        {!hasCards && <h2>Você não possui cards na sua coleção!</h2>}
        <div className="h-4 w-4 bg-black" ref={editRef}></div>
      </div>
    </div>
  );
}
