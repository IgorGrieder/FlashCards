"use client";
import Button from "@/app/components/button";
import { UserContext } from "@/app/context/userContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function CollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCtx = useContext(UserContext);
  const userCollection = userCtx?.user?.collections;
  const collectionName = searchParams.get("name");
  const [isChecked, setIsChecked] = useState(false);
  const [showCards, setShowCards] = useState(false);

  // Use effect for checking user and collections
  useEffect(() => {
    let collectionExists = false;

    // If the user is not logged
    if (userCtx?.user === null) {
      router.push("/");
    }

    // The user doesn't have any collection
    if (userCollection && userCollection.length <= 0) {
      router.push("/home");
    }

    // Checking if the user has a collection with the name provided
    if (userCollection) {
      for (let i = 0; i <= userCollection?.length - 1; i++) {
        if (userCollection[i].name === collectionName) {
          collectionExists = true;
          break;
        }
      }
    }

    // If the collection doesb't exist we will inform the user and go to the home page
    if (!collectionExists) {
      router.push("/home");
    }

    setIsChecked(true);
  }, [userCtx, router, userCollection, collectionName]);

  if (!isChecked) {
    return null;
  }

  // Handle click function to interact with the button
  const handleClick = () => {
    setShowCards(true);
  };

  return (
    <main>
      {/* Top section with intro */}
      <section className="my-auto">
        <h1 className="text-6xl text-center">{collectionName}</h1>
        <p>
          Responda a cada pergunta e no final compare com a respostas esperada!
          No final, você verá um resumo com seus acertos e erros. Aproveite para
          aprender e melhorar!
        </p>
        <Button text="Vamos lá" onClick={handleClick}></Button>
      </section>

      {/* Cards section will be in foocus on teh screen*/}
      {showCards && (
        <section className="absolute w-screen h-screen z-10 bg-black bg-opacity-80 left-0 top-0 flex items-center justify-center">
          <div className="bg-white w-[400px]">
            <h1>Olaaa</h1>
          </div>
        </section>
      )}
    </main>
  );
}
