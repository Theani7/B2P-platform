"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/providers/AuthProvider";
import { NavigationProvider } from "@/providers/NavigationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  }));
  return (
    <QueryClientProvider client={client}>
      <NavigationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NavigationProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
