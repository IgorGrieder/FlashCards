import { Collection } from "../types/types";
import CollectionCard from "./collectionCard";
import LoadingSpinner from "./loadingSpinner";

type CollectionsSectionProps = {
  collections: Collection[];
  onEditCollection: (collection: Collection) => void;
};

export default function CollectionsSection({
  collections,
  onEditCollection,
}: CollectionsSectionProps) {
  return (
    <section className="border border-black px-5 py-10 bg-white h-full">
      {collections.length > 0 ? (
        collections.map((collection) => (
          <CollectionCard
            key={crypto.randomUUID()}
            collection={collection}
            handleOpenEditSection={onEditCollection}
          />
        ))
      ) : (
        <LoadingSpinner />
      )}
    </section>
  );
}
