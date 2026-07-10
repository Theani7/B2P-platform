import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { UnsavedChangesProvider } from "./context/UnsavedChangesContext";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <UnsavedChangesProvider>
              <AppRoutes />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    border: '1px solid #f0f4fe',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#14141e',
                    background: '#ffffff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#16ca2e',
                      secondary: '#ffffff',
                    },
                    style: {
                      border: '1px solid #16ca2e',
                      background: '#fcfcfc',
                    }
                  },
                  error: {
                    iconTheme: {
                      primary: '#f26052',
                      secondary: '#ffffff',
                    },
                    style: {
                      border: '1px solid #f26052',
                      background: '#fcfcfc',
                    }
                  }
                }}
              />
            </UnsavedChangesProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
