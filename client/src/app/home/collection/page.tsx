"use client";
import { UserContext } from "@/app/context/userContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";

export default function CollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCtx = useContext(UserContext);
  const userCollection = userCtx?.user?.collections;
  const collectionName = searchParams.get("name");
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

  if (!collectionExists) {
    return (
      <main className="bg-black text-white flex items-center justify-center">
        <h1 className="text-6xl">Você não possui uma coleção com esse nome</h1>
        <h2>{collectionName}</h2>
      </main>
    );
  }

  return <main>Oiiii</main>;
}
