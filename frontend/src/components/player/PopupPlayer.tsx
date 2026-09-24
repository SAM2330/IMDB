"use client";

import { useEffect } from "react";
import { STREAMING_SERVERS, buildEmbedUrl } from "../../utils/streaming";
import { TMDBEpisode } from "../../types/tmdb";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PopupPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "movie" | "tv";
  id: number | string;
  season: number;
  episode: number;
  episodes: TMDBEpisode[];
  selectedServer: string;
  onServerChange: (server: string) => void;
  onEpisodeChange: (episodeNumber: number) => void;
}

export function PopupPlayer({
  isOpen,
  onClose,
  title,
  type,
  id,
  season,
  episode,
  episodes,
  selectedServer,
  onServerChange,
  onEpisodeChange,
}: PopupPlayerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentEpIndex = episodes.findIndex((e) => e.episode_number === episode);
  const currentEp = episodes[currentEpIndex];
  const hasPrev = currentEpIndex > 0;
  const hasNext = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1;

  const embedUrl = buildEmbedUrl(selectedServer, type, id, season, episode);

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 flex flex-col">
      {/* Player Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-black/80 border-b border-[#333]">
        <div className="truncate max-w-[50%]">
          <div className="text-sm md:text-base font-semibold text-white truncate">{title}</div>
          <div className="text-xs text-[#b3b3b3] truncate">
            {type === "tv"
              ? `Season ${season} · Episode ${episode}${currentEp?.name ? ` — ${currentEp.name}` : ""}`
              : "Movie"}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Server Selector Dropdown */}
          <select
            value={selectedServer}
            onChange={(e) => onServerChange(e.target.value)}
            className="px-3 py-1.5 bg-[#1f1f1f] border border-[#333] hover:border-[#e50914] text-white text-xs md:text-sm rounded-[8px] outline-none cursor-pointer"
            title="Streaming Server"
          >
            {Object.entries(STREAMING_SERVERS).map(([key, srv]) => (
              <option key={key} value={key}>
                {srv.label}
              </option>
            ))}
          </select>

          {/* Episode Navigation for TV */}
          {type === "tv" && (
            <>
              <button
                onClick={() => hasPrev && onEpisodeChange(episodes[currentEpIndex - 1].episode_number)}
                disabled={!hasPrev}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-[#e50914] disabled:opacity-30 disabled:hover:bg-white/10 text-white rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={() => hasNext && onEpisodeChange(episodes[currentEpIndex + 1].episode_number)}
                disabled={!hasNext}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-[#e50914] disabled:opacity-30 disabled:hover:bg-white/10 text-white rounded-[8px] text-xs font-medium transition-colors flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 md:w-9 md:h-9 bg-white/10 hover:bg-[#e50914] text-white rounded-full flex items-center justify-center transition-colors"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Player Iframe Body */}
      <div className="flex-1 w-full h-full bg-black flex items-center justify-center">
        <iframe
          src={embedUrl}
          title={title}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
