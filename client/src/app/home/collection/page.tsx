"use client";
import CardsSection from "@/app/components/cardsSection";
import LoadingPage from "@/app/components/loadingPage";
import { UserContext } from "@/app/context/userContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Collection } from "@/app/types/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { ImagesContext } from "@/app/context/imagesContext";
import axios from "axios";

export default function CollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCtx = useContext(UserContext);
  const userCollections = userCtx?.user?.collections;
  const collectionName = searchParams.get("name") || "";
  const collectionId = searchParams.get("id") || "";
  const [isChecked, setIsChecked] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);
  const flashCards = useRef<HTMLDivElement>(null);
  const { updateCache } = useContext(ImagesContext);
  const queryClient = useQueryClient();

  // Fetch images from server
  const _ = useQuery({
    queryKey: ['collection-images', collectionId],
    queryFn: async () => {
      const response = await axios.get<Record<string, Blob>>(
        `/api/collections/${collectionId}/images`,
        { responseType: 'arraybuffer' }
      );

      const imageBlobs = response.data;

      const imageMap = Object.fromEntries(
        Object.entries(imageBlobs).map(([cardId, buffer]) => {
          if (!(buffer instanceof ArrayBuffer)) {
            return [cardId, '']; // Fallback empty image
          }

          const blob = new Blob([buffer], { type: 'image/jpeg' });
          return [cardId, URL.createObjectURL(blob)];
        })
      );

      updateCache(collectionId, imageMap);
      return imageMap;
    },
  });

  // Cleanup when leaving collection
  useEffect(() => {
    return () => {
      // Schedule cache removal after 15 minutes
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ["collection-images", collectionId] });
        updateCache(collectionId, {}); // Clear from context
      }, 1000 * 60 * 15);
    };
  }, [collectionId, queryClient, updateCache]);


  // Use effect for checking user and collections
  useEffect(() => {
    let collectionExists = false;

    // The user doesn't have any collection
    if (userCollections && userCollections.length <= 0) {
      router.push("/home");
    }

    // Checking if the user has a collection with the name provided
    if (userCollections) {
      for (let i = 0; i <= userCollections?.length - 1; i++) {
        if (userCollections[i].name === collectionName && userCollections[i]._id === collectionId) {
          collectionExists = true;
          setCollection(userCollections[i]);
          break;
        }
      }
    }

    // If the collection doesn't exist we will send the user back to the home page
    if (!collectionExists || (collection && collection?.cards.length <= 0)) {
      router.push("/home");
    }

    setIsChecked(true);
  }, [userCtx, router, userCollections, collectionName, collection, collectionId]);

  if (!isChecked) {
    return <LoadingPage></LoadingPage>;
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
            collectionId={collectionId}
            collection={collection.cards}
            collectionName={collectionName ?? ""}
          ></CardsSection>
        </div>
      )}
    </main>
  );
}
