"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import UserProvider from "../context/userContext";
import ImageProvider from "../context/imagesContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ImageProvider>
          {children}
        </ImageProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default Providers;
