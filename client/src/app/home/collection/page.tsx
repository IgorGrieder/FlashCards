"use client";
import CardsSection from "@/app/components/cardsSection";
import LoadingPage from "@/app/components/loadingPage";
import { useQuery } from "@tanstack/react-query";
import { Collection,  ImagesResponse } from "@/app/types/types";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { ImagesContext } from "@/app/context/imagesContext";
import axios, { AxiosResponse } from "axios";
import { UserContext } from "@/app/context/userContext";

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("name") || "";
  const userCtx = useContext(UserContext);
  const collectionId = searchParams.get("id") || "";
  const [isChecking, setIsChecking] = useState(true);
  const [collection, setCollection] = useState<Collection | null>(null);
  const flashCards = useRef<HTMLDivElement>(null);
  const { updateCache } = useContext(ImagesContext);

  const loadImages = async (): Promise<Record<string, string>> =>  {
    const response: AxiosResponse<ImagesResponse> = await axios.get(`/api/collections/${collectionId}/all-images`);
    const imageMap: Record<string, string> = {};

    Object.entries(response.data.images).forEach(([cardId, imageData]) => {
      // Convert the base64 or binary data to a blob
      const blob = new Blob([imageData.data], { type: imageData.contentType });
      imageMap[cardId] = URL.createObjectURL(blob);
    });

    // Update your cache
    updateCache(collectionId, imageMap);
    return imageMap
  }

  // Fetch images from server
  const { data: images, isLoading: isLoadingImages } = useQuery({
    queryKey: ['collection-images', collectionId],
    queryFn: loadImages, staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes
  });

  useEffect(() => {
    // Update the collection in the state after render
    if (userCtx?.user?.collections) {

      const col = userCtx?.user?.collections.findIndex(col => col._id === collectionId);

      if (col !== -1) {
        setCollection(userCtx?.user?.collections[col]);
        setIsChecking(false);
      }
    }
  }, [setCollection, setIsChecking, collectionId, userCtx]);

  if (isChecking || isLoadingImages) {
    return <LoadingPage />;
  }

  return (
    <main className="p-10">
      {/* Go back section */}
      <div className="mb-2 md:mb-6 font-medium text-center">
        <a
          href="/home"
          className="group rounded-md text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-gray-800"
        >
          {" "}
          <span className="inline-block transform transition-transform group-hover:translate-x-[-2px] mr-1">
            ←
          </span>
          Voltar para suas coleções
        </a>
      </div>
      {/* Top section with intro */}
      <h1 className="text-2xl sm:text-5xl text-center font-bold">
        {collectionName}
      </h1>
      <section className="flex items-center justify-center mt-10">
        <p className="text-xl text-gray-500">
          Teste, avalie e melhore o seu conhecimento em {collectionName} com
          essas questões.
        </p>
      </section>

      {/* Cards section will be in focus on the screen*/}
      {collection && (
        <div ref={flashCards}>
          <CardsSection
            collectionImages={images || {}}
            collectionId={collectionId}
            collection={collection.cards}
            collectionName={collectionName}
          ></CardsSection>
        </div>
      )}
    </main>
  );
}
