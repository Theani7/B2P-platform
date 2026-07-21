import React from "react";
import { Star, Image as ImageIcon, Video, Eye, Heart, Pencil, Trash2 } from "lucide-react";

export function PortfolioCard({ item, isOwner, onClick, onEdit, onDelete }: any) {
  const hasVideo = item.media?.some((m: any) => m.mediaType === "video");
  const coverImageUrl = item.coverImage || item.media?.[0]?.filePath;

  const getMediaUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${url}`;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
        onClick={() => onClick?.(item)}
      >
        {coverImageUrl ? (
          <img 
            src={getMediaUrl(coverImageUrl)}
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon size={32} className="mb-2 opacity-50" />
            <span className="text-xs font-medium">No cover image</span>
          </div>
        )}

        {item.featured && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-gray-900">Featured</span>
          </div>
        )}

        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-white">
          {hasVideo ? <Video size={14} /> : <ImageIcon size={14} />}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-base font-bold text-gray-900 cursor-pointer hover:text-signal-blue transition-colors" onClick={() => onClick?.(item)}>
              {item.title}
            </h3>
            {item.clientName && (
               <p className="text-sm text-gray-500 mt-0.5">for {item.clientName}</p>
             )}
          </div>
        </div>

        {(item.platforms?.length > 0 || item.tags?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.platforms?.map((p: string) => (
              <span key={p} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                {p}
              </span>
            ))}
            {item.tags?.slice(0, 2).map((t: string) => (
              <span key={t} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-100">
                #{t}
              </span>
            ))}
            {item.tags?.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-md border border-gray-100">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Eye size={14} />
              {item.views > 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Heart size={14} />
              {item.likes > 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
                className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-sky-wash hover:text-signal-blue transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
                className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
