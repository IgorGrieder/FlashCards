"use client";
import Button from "@/app/components/button";
import CardsSection from "@/app/components/cardsSection";
import LoadingPage from "@/app/components/loadingPage";
import { UserContext } from "@/app/context/userContext";
import { Collection } from "@/app/types/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function CollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCtx = useContext(UserContext);
  const userCollections = userCtx?.user?.collections;
  const collectionName = searchParams.get("name");
  const [isChecked, setIsChecked] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);

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
        if (userCollections[i].name === collectionName) {
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
  }, [userCtx, router, userCollections, collectionName, collection]);

  if (!isChecked) {
    return <LoadingPage></LoadingPage>;
  }

  // Handle click function to interact with the button
  const handleClick = () => {
    setShowCards(true);
  };

  return (
    <main className="p-10">
      {/* Top section with intro */}
      <h1 className="text-6xl text-center">{collectionName}</h1>
      <section className="flex items-center justify-center mt-10">
        <p className="max-w-[300px]">
          Responda a cada pergunta e no final compare com a respostas esperada!
          No final, você verá um resumo com seus acertos e erros. Aproveite para
          aprender e melhorar!
        </p>
        {collection && !showCards && (
          <Button text="Vamos lá" onClick={handleClick}></Button>
        )}
      </section>

      {/* Cards section will be in focus on the screen*/}
      {collection && showCards && (
        <CardsSection collection={collection}></CardsSection>
      )}
    </main>
  );
}
