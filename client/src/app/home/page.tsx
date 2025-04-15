"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../context/userContext";
import { AxiosError, AxiosResponse } from "axios";
import { Collection, CollectionsRespose } from "../types/types";
import { useRouter } from "next/navigation";
import { api } from "../libs/axios";
import LoadingPage from "../components/loadingPage";
import EditCollection from "../components/editCollection";
import CollectionsSection from "../components/collectionsSection";
import NewCollectionSection from "../components/newCollectionSection";
import Button from "../components/button";

export default function MainUserPage() {
  const userCtx = useContext(UserContext);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [editSectionCollection, setEditSectionCollection] =
    useState<Collection | null>(null);
  const editSection = useRef<HTMLElement>(null);
  const [newCollection, setNewCollection] = useState(false);

  // Set client-side flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On click function to put on focus the edit section
  const handleOpenEditSection = (editCollection: Collection) => {
    setEditSectionCollection(editCollection);

    requestAnimationFrame(() => {
      if (editSection.current) {
        editSection.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  };

  const fetchCollectionsData = async (): Promise<CollectionsRespose> => {
    try {
      const result: AxiosResponse<CollectionsRespose> = await api.get(
        "collections/get-collections",
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
      return { collectionsFound: false }
    }
  };

  const query = useQuery({
    queryFn: fetchCollectionsData,
    queryKey: ["userCollection"],
    enabled: isClient && !!userCtx?.user,
  });

  // Get collections from user context
  const cardsCollection = userCtx?.user?.collections || [];

  // Show loading state during SSR and checking user context
  if (!isClient || !userCtx?.user) {
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

  const handleCloseEditSection = () => {
    setEditSectionCollection(null);
  };

  return (
    <main className="p-10">
      <section className="p-5">
        {/* Title */}
        <h1 className="sm:text-6xl text-center text-xl font-extrabold mb-10 sm:mb-20">Suas coleções, {userCtx.user.username}!</h1>

        {/*How to use section*/}
        <div className="p-6 bg-white rounded-xl shadow-sm space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Como começar
          </h2>

          <ol className="space-y-3 list-decimal list-outside ml-5 marker:text-gray-400 marker:font-medium">
            <li className="pl-3 text-gray-700 hover:text-indigo-600 transition-colors">
              Navegue pela lista de coleções disponíveis
            </li>
            <li className="pl-3 text-gray-700 hover:text-indigo-600 transition-colors">
              Clique na coleção desejada para acessar os flashcards
            </li>
            <li className="pl-3 text-gray-700 hover:text-indigo-600 transition-colors">
              Use os cartões para revisar conceitos-chave e se preparar para provas, trabalhos ou desafios pessoais
            </li>
          </ol>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3">
            <div className="text-yellow-500 text-xl">💡</div>
            <div>
              <p className="font-semibold text-yellow-700 mb-1">Dica de estudo</p>
              <p className="text-sm text-yellow-600">
                Crie o hábito de revisar suas coleções regularmente para maximizar a retenção de conteúdo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New collection button */}
      <Button
        text="Nova Colecao" additionalClasses="mb-5" onClick={() => setNewCollection(true)}>
      </Button>

      {/* Cards collections section */}
      <CollectionsSection
        collections={cardsCollection}
        onEditCollection={handleOpenEditSection}
      ></CollectionsSection>

      {/* New collection section*/}
      {newCollection && <NewCollectionSection handleClose={() => setNewCollection(false)}></NewCollectionSection>}

      {/* Edit collection section */}
      {editSectionCollection && (
        <EditCollection
          handleCloseEditSection={handleCloseEditSection}
          collection={editSectionCollection}
        ></EditCollection>
      )}
    </main>
  );
}
