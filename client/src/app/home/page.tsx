"use client";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../context/userContext";
import { AxiosResponse } from "axios";
import { Collection, CollectionsRespose } from "../types/types";
import { useRouter } from "next/navigation";
import CollectionCard from "../components/collectionCard";
import { api } from "../libs/axios";

export default function MainUserPage() {
  const userCtx = useContext(UserContext);
  const router = useRouter();

  // If we don't have an user redirect to the main page for login
  if (!userCtx?.user) {
    router.push("/");
  }

  // Function to call the api to get the users collection
  const fetchCollectionsData = async (): Promise<CollectionsRespose> => {
    try {
      const result: AxiosResponse<CollectionsRespose> = await api.get(
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

      return result.data;
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
    <main className="">
      {/* General informationn for the user in regards of the application usage */}
      <section className="px-5 py-10">
        <h1 className="text-black text-4xl text-center">
          Suas coleções, {userCtx?.user?.username}!
        </h1>
        <div className="px-4 py-5">
          <h4 className="text-xl font-bold">📚 Como começar</h4>
          <ol className="list-decimal px-10">
            <li>Navegue pela lista de coleções disponíveis</li>
            <li>Clique na coleção desejada para acessar os flashcards</li>
            <li>
              Use os cartões para revisar conceitos-chave e se preparar para
              provas, trabalhos ou desafios pessoais
            </li>
          </ol>
          <h6>
            <span className="font-semibold">Dica: </span>Crie o hábito de
            revisar suas coleções regularmente para maximizar a retenção de
            conteúdo. Vamos juntos rumo ao sucesso nos estudos!
          </h6>
        </div>
      </section>

      {/* Collections section to be displayed */}
      <section className="border border-black px-5 py-10 bg-white h-full">
        {cardsCollection.map((collection) => (
          <CollectionCard
            key={crypto.randomUUID()}
            category={collection.name}
            name={collection.name}
          ></CollectionCard>
        ))}
      </section>
    </main>
  );
}
