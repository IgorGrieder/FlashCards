"use client";
import { createContext, useEffect, useReducer, useState } from "react";
import { ActionUser, User, UserCtx } from "../types/types";
import { useRouter } from "next/navigation";
import LoadingPage from "../components/loadingPage";

export const UserContext = createContext<UserCtx | null>(null);

const reducer = (state: User | null, action: ActionUser): User | null => {
  switch (action.type) {
    case "LOGIN":
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
      return action.payload;

    case "LOGOUT":
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      return null;

    case "UPDATE":
      const userUpdated = { ...state, ...action.payload } as User;

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userUpdated));
      }
      return state ? userUpdated : null;

    default:
      return state;
  }
};

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, dispatch] = useReducer(reducer, null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize user from localStorage after mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch({ type: "LOGIN", payload: JSON.parse(storedUser) });
    }
    setIsLoading(false);
  }, []);

  // Handle authentication redirects
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Show loading state during SSR and initial client-side load
  if (isLoading) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <UserContext.Provider value={{ user, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}
