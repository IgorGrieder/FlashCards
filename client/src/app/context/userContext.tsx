"use client";
import { createContext, useState } from "react";
import { UserCtx } from "../types/types";

export const UserContext = createContext<UserCtx | null>(null);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state directly from localStorage
  const [user, setUser] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  // function to store the user information
  const login = (user: string) => {
    if (typeof window !== "undefined") {
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  // Function to log out the user in the context
  const logout = () => {
    if (typeof window !== "undefined") {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
