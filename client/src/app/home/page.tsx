"use client";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../context/userContext";
import { AxiosError, AxiosResponse } from "axios";
import { CollectionsRespose } from "../types/types";
import { useRouter } from "next/navigation";
import CollectionCard from "../components/collectionCard";
import { api } from "../libs/axios";
import LoadingPage from "../components/loadingPage";
import LoadingSpinner from "../components/loadingSpinner";

export default function MainUserPage() {
  const userCtx = useContext(UserContext);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCollectionsData = async (): Promise<CollectionsRespose> => {
    try {
      const result: AxiosResponse<CollectionsRespose> = await api.get(
        "cards/get-collections",
      );

      if (result.data.collections && userCtx?.user) {
        userCtx.dispatch({
          type: "UPDATE",
          payload: {
            ...userCtx.user,
            collections: result.data.collections,
          },
        });
      }

      return result.data;
    } catch (e) {
      const error = e as AxiosError;
      if (error.response?.status === 401) {
        userCtx?.dispatch({ type: "LOGOUT" });
        router.push("/");
      }
      throw error;
    }
  };

  const query = useQuery({
    queryFn: fetchCollectionsData,
    queryKey: ["userCollection"],
    enabled: isClient && !!userCtx?.user,
  });

  // Get collections from user context
  const cardsCollection = userCtx?.user?.collections || [];

  // Show loading state during SSR
  if (!isClient) {
    return (
      <main className="p-10">
        <LoadingPage></LoadingPage>
      </main>
    );
  }

  // Show loading state while checking authentication
  if (!userCtx?.user) {
    return (
      <main className="p-10">
        <LoadingPage></LoadingPage>
      </main>
    );
  }

  // Handle query error
  if (query.isError) {
    setTimeout(() => router.push("/"), 5000);
    return (
      <main className="bg-white">Não foi possível acessar suas coleções</main>
    );
  }

  return (
    <main className="p-10">
      <section className="px-5 py-10">
        <h1 className="text-black text-4xl text-center">
          Suas coleções, {userCtx.user.username}!
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

      <section className="border border-black px-5 py-10 bg-white h-full">
        {cardsCollection.length > 0 ? (
          cardsCollection.map((collection) => (
            <CollectionCard
              key={crypto.randomUUID()}
              category={collection.name}
              name={collection.name}
            />
          ))
        ) : (
          <LoadingSpinner></LoadingSpinner>
        )}
      </section>
    </main>
  );
}
