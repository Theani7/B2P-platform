"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavigationContextType {
  pathname: string;
  optimisticPath: string | null;
  isNavigating: boolean;
  navigateTo: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  pathname: "",
  optimisticPath: null,
  isNavigating: false,
  navigateTo: () => {},
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Clear optimistic path once the pathname changes to match or anything new
  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  // Safety fallback: if navigation takes longer than 8s or fails, reset
  useEffect(() => {
    if (!optimisticPath) return;
    const timer = setTimeout(() => {
      setOptimisticPath(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [optimisticPath]);

  const navigateTo = useCallback(
    (href: string) => {
      if (!href) return;
      // Strip trailing slash or match exactly
      const cleanHref = href.split("?")[0].split("#")[0];
      const cleanCurrent = pathname.split("?")[0].split("#")[0];
      if (cleanHref === cleanCurrent && href === window.location.pathname + window.location.search) {
        return;
      }

      // Optimistically switch active item and indicate loading immediately
      setOptimisticPath(href);

      // Trigger navigation in React transition
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router]
  );

  const isNavigating = isPending || (!!optimisticPath && optimisticPath !== pathname);

  return (
    <NavigationContext.Provider
      value={{
        pathname,
        optimisticPath,
        isNavigating,
        navigateTo,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
