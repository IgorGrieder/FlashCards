"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import UserProvider from "../context/userContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 15 minutes

    },
  },
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {children}
      </UserProvider>
    </QueryClientProvider>
  );
};

export default Providers;
