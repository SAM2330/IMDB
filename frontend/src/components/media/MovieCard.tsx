"use client";

import Link from "next/link";
import Image from "next/image";
import { getMediaDetailUrl, getTMDBImageUrl } from "../../utils/slug";
import { TMDBMediaItem } from "../../types/tmdb";
import { Trash2 } from "lucide-react";

interface MovieCardProps {
  item: TMDBMediaItem;
  rank?: number;
  onRemove?: () => void;
  priority?: boolean;
}

export function MovieCard({ item, rank, onRemove, priority = false }: MovieCardProps) {
  const isTV = item.media_type === "tv" || ("first_air_date" in item && !("release_date" in item));
  const type = isTV ? "tv" : "movie";
  const title = item.title || item.name || "Unknown";
  const detailUrl = getMediaDetailUrl(item.id, type, title);
  const posterUrl = getTMDBImageUrl(item.poster_path, "w500");

  return (
    <div className="relative group min-w-[140px] md:min-w-[160px] flex-shrink-0 transition-transform duration-250 ease-out hover:scale-108 hover:z-20">
      <Link href={detailUrl} className="block text-inherit no-underline">
        <div className="relative aspect-[2/3] w-full rounded-[8px] overflow-hidden bg-[#141414] shadow-md group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-shadow">
          <Image
            src={posterUrl}
            alt={`${title} poster`}
            fill
            sizes="(max-width: 768px) 150px, 180px"
            priority={priority}
            className="object-cover rounded-[8px]"
            unoptimized={posterUrl.startsWith("http")}
          />
          {rank !== undefined && (
            <div className="absolute top-2 left-2 bg-[#e50914] text-white font-bold text-xs md:text-sm px-2.5 py-1 rounded-[4px] shadow">
              #{rank}
            </div>
          )}
        </div>
        <h3 className="text-[13px] font-medium text-[#b3b3b3] group-hover:text-white mt-2 truncate transition-colors">
          {title}
        </h3>
      </Link>

      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="mt-2 w-full py-1.5 px-3 flex items-center justify-center gap-1.5 bg-[#e50914]/20 hover:bg-[#e50914] text-[#e50914] hover:text-white border border-[#e50914] rounded text-xs font-semibold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      )}
    </div>
  );
}
