"use client";
import { createContext, useReducer } from "react";
import { ActionUser, User, UserCtx } from "../types/types";

export const UserContext = createContext<UserCtx | null>(null);

const reducer = (state: User | null, action: ActionUser): User | null => {
  switch (action.type) {
    case "LOGIN":
      const userLogged = action.payload;
      // Now set the information into the local storage
      localStorage.setItem("user", JSON.stringify(userLogged));

      return userLogged; // Setting user data
    case "LOGOUT":
      localStorage.removeItem("user"); // Clearing the local storage information about the user
      return null; // Clearing user data
    case "UPDATE":
      const userUpdated = { ...state, ...action.payload };

      // Updating the local storage
      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(userUpdated));
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
