import React from "react";
import { Clock, Trash2, Search as SearchIcon } from "lucide-react";
import type { SearchHistoryItem } from "../../features/search/types";
import { useClearSearchHistory } from "../../features/search/hooks";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect }) => {
  const clearHistory = useClearSearchHistory();

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <SearchIcon size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Search for campaigns, brands, or creators</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Searches
        </h3>
        <button 
          onClick={() => clearHistory.mutate()}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>
      <ul className="space-y-1">
        {history.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onSelect(item.query)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Clock size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{item.query}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
