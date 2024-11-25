import React, { createContext, useState } from "react";
import { UserCtx } from "../types/types";

const UserContext = createContext<UserCtx | null>(null);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state directly from localStorage
  const [user, setUser] = useState<string | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // function to store the user information
  const login = (user: string) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Function to log out the user in the context
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
