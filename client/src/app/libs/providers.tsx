"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import UserProvider from "../context/userContext";
const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  );
};

export default Providers;
