import { useContext } from "react";
import { useQuery } from "react-query";
import { UserContext } from "../context/userContext";
import axios, { AxiosResponse } from "axios";
import { Collection, CollectionsRespose } from "../types/types";
import { useRouter } from "next/navigation";

export default function MainUserPage() {
  const userCtx = useContext(UserContext);
  const router = useRouter();

  // Function to call the api to get the users collection
  const fetchCollectionsData = async (): Promise<void> => {
    try {
      const result: AxiosResponse<CollectionsRespose> =
        await axios.get("/get-collections");

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

  if (query.isError) {
    return <main></main>;
  }

  return (
    <main>
      <>
        {cardsCollection.map((item) => (
          <div key={crypto.randomUUID()}>Ola {item.name}</div>
        ))}
      </>
    </main>
  );
}
