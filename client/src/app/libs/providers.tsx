"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import UserProvider from "../context/userContext";
import { ImageContextProvider } from "../context/imageContext";

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
        <ImageContextProvider>
          {children}
        </ImageContextProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default Providers;
