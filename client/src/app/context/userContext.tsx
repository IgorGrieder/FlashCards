"use client";
import { createContext, useReducer } from "react";
import { ActionUser, User, UserCtx } from "../types/types";

export const UserContext = createContext<UserCtx | null>(null);

const reducer = (state: User | null, action: ActionUser): User | null => {
  switch (action.type) {
    case "LOGIN":
      return action.payload; // Setting user data
    case "LOGOUT":
      return null; // Clearing user data
    case "UPDATE":
      return state ? { ...state, ...action.payload } : null; // Updating user data
    default:
      return state;
  }
};

// Initializer function
const initializer = (): User | null => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }
  return null;
};

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state directly from localStorage using reducer
  const [user, dispatch] = useReducer(reducer, null, initializer);

  return (
    <UserContext.Provider value={{ user, dispatch }}>
      {children}
    </UserContext.Provider>
  );
}
