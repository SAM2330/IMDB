"use client";

import Link from "next/link";
import { TMDBMediaItem } from "../../types/tmdb";
import { getMediaDetailUrl, getTMDBImageUrl, getWatchUrl } from "../../utils/slug";
import { Play, Info } from "lucide-react";

interface HeroBannerProps {
  item: TMDBMediaItem | null;
}

export function HeroBanner({ item }: HeroBannerProps) {
  if (!item) {
    return (
      <div className="relative h-[65vh] min-h-[480px] bg-[#141414] animate-pulse flex items-center px-10">
        <div className="max-w-[600px] space-y-4">
          <div className="h-12 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const isTV = item.media_type === "tv" || ("first_air_date" in item && !("release_date" in item));
  const type = isTV ? "tv" : "movie";
  const title = item.title || item.name || "Featured Title";
  const backdropUrl = getTMDBImageUrl(item.backdrop_path, "original");
  const detailUrl = getMediaDetailUrl(item.id, type, title);
  const watchUrl = getWatchUrl(item.id, type);

  return (
    <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
      {/* Backdrop Image */}
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        {/* Left Side Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/60 to-[#0a0a0a]/30" />
        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-[600px] pt-36 md:pt-40 pb-16 px-5 md:px-10 flex flex-col justify-end h-full">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
          {title}
        </h1>
        <p className="text-sm md:text-base text-[#b3b3b3] mb-6 line-clamp-3 leading-relaxed drop-shadow">
          {item.overview || "Stream this title now on StreamFlix."}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={watchUrl}
            className="btn py-3 px-7 text-base font-semibold rounded-[8px] bg-[#e50914] hover:bg-[#f40612] text-white flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Watch Now</span>
          </Link>
          <Link
            href={detailUrl}
            className="btn btn-secondary py-3 px-7 text-base font-semibold rounded-[8px] bg-white/15 hover:bg-white/25 text-white flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Info className="w-5 h-5" />
            <span>More Info</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
