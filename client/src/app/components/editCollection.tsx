import { Collection } from "../types/types";

type EditCollectionProps = {
  collection: Collection;
};

export default function EditCollection({ collection }: EditCollectionProps) {
  return (
    <div className="bg-blue-400 border border-black rounded-full px-5 py-10">
      {collection.name}
    </div>
  );
}
