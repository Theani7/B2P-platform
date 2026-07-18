import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Loader2, ArrowRight } from "lucide-react";
import { useSearch, useSearchHistory } from "../../features/search";
import { SearchResults } from "./SearchResults";
import { SearchHistory } from "./SearchHistory";
import { useDebounce } from "../../hooks/useDebounce";

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useSearch({ q: debouncedQuery });
  const { data: history } = useSearchHistory();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const hasResults = results && (
    (results.campaigns?.length || 0) > 0 ||
    (results.promoters?.length || 0) > 0 ||
    (results.businesses?.length || 0) > 0 ||
    (results.collaborations?.length || 0) > 0 ||
    (results.messages?.length || 0) > 0 ||
    (results.users?.length || 0) > 0
  );

  return (
    <div className="relative z-50" ref={containerRef}>
      {/* Search Input Trigger */}
      <div 
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg cursor-text hover:bg-gray-200 transition-colors w-64"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon size={16} className="text-gray-500" />
        <span className="text-sm text-gray-500 flex-1 text-left">Search...</span>
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border bg-white shadow-sm text-xs text-gray-500 font-mono">
          <span className="text-[10px]">⌘</span>K
        </div>
      </div>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-full md:w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
          
          {/* Active Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <SearchIcon size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns, creators, businesses..."
              className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-400 text-gray-900"
            />
            {isLoading && <Loader2 size={18} className="text-primary-500 animate-spin" />}
            {query && !isLoading && (
              <button 
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto">
            {debouncedQuery.length >= 2 ? (
              <div className="p-2">
                {hasResults ? (
                  <SearchResults results={results} onClose={() => setIsOpen(false)} />
                ) : !isLoading ? (
                  <div className="py-12 text-center">
                    <SearchIcon size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">No results found for "{debouncedQuery}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try searching with different keywords.</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-4">
                <SearchHistory 
                  history={history || []} 
                  onSelect={(q) => setQuery(q)} 
                />
              </div>
            )}
          </div>
          
          {/* Footer Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between">
            <span>Use <kbd className="bg-white border rounded px-1">↑</kbd> <kbd className="bg-white border rounded px-1">↓</kbd> to navigate</span>
            <span><kbd className="bg-white border rounded px-1">Enter</kbd> to select</span>
            <span><kbd className="bg-white border rounded px-1">Esc</kbd> to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
