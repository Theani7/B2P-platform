import React from "react";
import { Link } from "react-router-dom";
import type { SearchResponse, SearchResultItem } from "../../features/search/types";
import { Briefcase, User, Target, Layers, MessageSquare, Shield } from "lucide-react";

interface SearchResultsProps {
  results: SearchResponse | undefined;
  onClose: () => void;
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case 'campaign': return <Target size={16} className="text-purple-500" />;
    case 'promoter': return <User size={16} className="text-teal-500" />;
    case 'business': return <Briefcase size={16} className="text-amber-500" />;
    case 'collaboration': return <Layers size={16} className="text-blue-500" />;
    case 'message': return <MessageSquare size={16} className="text-gray-500" />;
    case 'user': return <Shield size={16} className="text-red-500" />;
    default: return <Search size={16} className="text-gray-400" />;
  }
};

const ResultSection = ({ title, items, onClose }: { title: string, items?: SearchResultItem[], onClose: () => void }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="mb-4 last:mb-0">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <Link 
              to={item.url}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  getEntityIcon(item.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onClose }) => {
  if (!results) return null;

  return (
    <div>
      <ResultSection title="Campaigns" items={results.campaigns} onClose={onClose} />
      <ResultSection title="Creators & Influencers" items={results.promoters} onClose={onClose} />
      <ResultSection title="Brands & Businesses" items={results.businesses} onClose={onClose} />
      <ResultSection title="Collaborations" items={results.collaborations} onClose={onClose} />
      <ResultSection title="Users (Admin)" items={results.users} onClose={onClose} />
      <ResultSection title="Messages" items={results.messages} onClose={onClose} />
    </div>
  );
};
