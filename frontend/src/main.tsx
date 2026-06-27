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
                    boxShadow: 'none',
                    border: '1px solid #E5E7EB', // gray-200
                    borderRadius: '12px', // rounded-xl
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827', // gray-900
                    background: '#FFFFFF',
                  },
                  success: {
                    iconTheme: {
                      primary: '#1D9E75', // brand-teal
                      secondary: '#FFFFFF',
                    },
                    style: {
                      border: '1px solid #1D9E75',
                      background: '#F0FDF4',
                    }
                  },
                  error: {
                    iconTheme: {
                      primary: '#D85A30', // brand-coral
                      secondary: '#FFFFFF',
                    },
                    style: {
                      border: '1px solid #D85A30',
                      background: '#FEF2F2',
                    }
                  }
                }}
              />
            </UnsavedChangesProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
