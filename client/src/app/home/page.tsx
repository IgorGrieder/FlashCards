"use client";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../context/userContext";
import axios, { AxiosResponse } from "axios";
import { Collection, CollectionsRespose } from "../types/types";
import { useRouter } from "next/navigation";
import CollectionCard from "../components/collectionCard";

export default function MainUserPage() {
  const userCtx = useContext(UserContext);
  const router = useRouter();

  // Function to call the api to get the users collection
  const fetchCollectionsData = async (): Promise<void> => {
    try {
      const result: AxiosResponse<CollectionsRespose> = await axios.get(
        "cards/get-collections",
      );

      // If we have successfully fetched information in the backend we will add to the user context
      if (result.status === 200 || result.status === 204) {
        if (result.data.collections && userCtx?.user) {
          userCtx?.dispatch({
            type: "UPDATE",
            payload: {
              ...userCtx.user,
              collections: result.data.collections,
            },
          });
        }
      }

      // If we get that the user is not authorized we will redirect it to the main page
      if (result.status === 401) {
        router.push("/");
      }
    } catch (error: unknown) {
      throw error;
    }
  };

  const query = useQuery({
    queryFn: fetchCollectionsData,
    queryKey: ["userCollection"],
  });

  // Separating the user collections in a variable
  let cardsCollection: [Collection] | [] = [];
  if (userCtx?.user) {
    cardsCollection = userCtx.user.collections;
  }

  // If we fail trying to request the collection go back to the home screen
  const goBack = () => {
    router.push("/");
  };

  if (query.isError) {
    setTimeout(goBack, 5000);
    return (
      <main className="bg-white"> Não foi possível acessar suas coleções</main>
    );
  }

  return (
    <main className="h-screen bg-green-300">
      <div className="my-auto border border-black px-5 py-10">
        {cardsCollection.map((collection) => (
          <CollectionCard
            key={crypto.randomUUID()}
            category={collection.name}
            name={collection.name}
          ></CollectionCard>
        ))}
      </div>
    </main>
  );
}
