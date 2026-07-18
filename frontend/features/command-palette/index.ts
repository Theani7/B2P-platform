import { useCallback, useState } from "react";

export type CommandType = "navigation" | "action" | "search" | "recent_page";

export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  type: CommandType;
  icon?: string;
  keywords?: string[];
  action: () => void;
}

const PAGES_KEY = "b2p_recent_pages";
const CMDS_KEY = "b2p_recent_commands";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function useRecentPages() {
  const [pages, setPages] = useState<{ title: string; path: string }[]>(() =>
    readJSON(PAGES_KEY, []),
  );
  const addRecentPage = useCallback((title: string, path: string) => {
    setPages((prev) => {
      const next = [{ title, path }, ...prev.filter((p) => p.path !== path)].slice(0, 5);
      localStorage.setItem(PAGES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { recentPages: pages, addRecentPage };
}

export function useRecentCommands() {
  const [cmds, setCmds] = useState<string[]>(() => readJSON(CMDS_KEY, []));
  const addRecentCommand = useCallback((id: string) => {
    setCmds((prev) => {
      const next = [id, ...prev.filter((c) => c !== id)].slice(0, 8);
      localStorage.setItem(CMDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  const clearRecentCommands = useCallback(() => {
    localStorage.removeItem(CMDS_KEY);
    setCmds([]);
  }, []);
  return { recentCommands: cmds, addRecentCommand, clearRecentCommands };
}
