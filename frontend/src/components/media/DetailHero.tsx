"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "../../types/tmdb";
import { getTMDBImageUrl, getWatchUrl } from "../../utils/slug";
import { useWatchlist } from "../../hooks/useWatchlist";
import { Play, Plus, Check, Film, Star, X } from "lucide-react";

interface DetailHeroProps {
  item: TMDBMovie | TMDBTVShow;
  type: "movie" | "tv";
}

export function DetailHero({ item, type }: DetailHeroProps) {
  const { addToWatchlist, isInWatchlist } = useWatchlist();
  const isSaved = isInWatchlist(item.id);
  const [showTrailer, setShowTrailer] = useState(false);

  const title = ("title" in item ? item.title : item.name) || "Untitled";
  const releaseDate = ("release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : "") || "";
  const year = releaseDate.slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  
  const backdropUrl = getTMDBImageUrl(item.backdrop_path, "original");
  const posterUrl = getTMDBImageUrl(item.poster_path, "w500");

  let runtimeText = "";
  if (type === "movie" && "runtime" in item && item.runtime) {
    const hours = Math.floor(item.runtime / 60);
    const mins = item.runtime % 60;
    runtimeText = `${hours > 0 ? `${hours}h ` : ""}${mins}m`;
  } else if (type === "tv" && "number_of_seasons" in item && item.number_of_seasons) {
    runtimeText = `${item.number_of_seasons} Season${item.number_of_seasons !== 1 ? "s" : ""}`;
  }

  const castNames = item.credits?.cast
    ?.slice(0, 5)
    .map((c) => c.name)
    .join(", ");

  const trailer = item.videos?.results?.find(
    (v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube"
  );

  const handleTrailerClick = () => {
    setShowTrailer(true);
    setTimeout(() => {
      const el = document.getElementById("trailerSection");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <>
      <div className="relative min-h-[70vh] pt-20 md:pt-24 overflow-hidden">
        {/* Backdrop with gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 pt-10 md:pt-16 pb-12 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
          {/* Poster */}
          <div className="relative w-56 md:w-72 aspect-[2/3] flex-shrink-0 rounded-[8px] overflow-hidden shadow-2xl bg-[#141414] border border-white/10">
            <Image
              src={posterUrl}
              alt={`${title} poster`}
              fill
              sizes="(max-width: 768px) 220px, 300px"
              priority
              className="object-cover"
              unoptimized={posterUrl.startsWith("http")}
            />
          </div>

          {/* Info & Meta */}
          <div className="flex-1 flex flex-col text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-md">
              {title}
            </h1>

            <div className="flex items-center justify-center md:justify-start flex-wrap gap-4 text-sm text-[#b3b3b3] mb-4">
              {year && <span>{year}</span>}
              {rating !== "N/A" && (
                <span className="flex items-center gap-1 text-[#f5c518] font-bold">
                  <Star className="w-4 h-4 fill-[#f5c518]" />
                  {rating}
                </span>
              )}
              {runtimeText && <span>{runtimeText}</span>}
            </div>

            {/* Genres */}
            {item.genres && item.genres.length > 0 && (
              <div className="flex items-center justify-center md:justify-start flex-wrap gap-2 mb-5">
                {item.genres.map((g) => (
                  <span
                    key={g.id}
                    className="bg-white/10 text-[#b3b3b3] px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Plot Overview */}
            <p className="text-sm md:text-base text-[#b3b3b3] leading-relaxed max-w-2xl mb-6">
              {item.overview || "No description available."}
            </p>

            {/* Cast */}
            {castNames && (
              <div className="text-sm text-[#b3b3b3] mb-7">
                <strong className="text-white">Cast:</strong> {castNames}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start flex-wrap gap-3">
              <Link
                href={getWatchUrl(item.id, type)}
                className="btn py-3 px-7 text-sm md:text-base font-semibold rounded-[8px] bg-[#e50914] hover:bg-[#f40612] text-white flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{type === "tv" ? "Watch Series" : "Watch Now"}</span>
              </Link>

              {trailer && (
                <button
                  onClick={handleTrailerClick}
                  className="btn btn-secondary py-3 px-6 text-sm md:text-base font-semibold rounded-[8px] bg-white/15 hover:bg-white/25 text-white flex items-center gap-2"
                >
                  <Film className="w-4 h-4" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                onClick={() => addToWatchlist(item, type)}
                className="btn btn-gold py-3 px-6 text-sm md:text-base font-semibold rounded-[8px] bg-[#f5c518] hover:bg-[#e6b800] text-black flex items-center gap-2"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isSaved ? "In My List" : "+ My List"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Section (Only rendered when user presses Trailer button) */}
      {showTrailer && trailer && (
        <section id="trailerSection" className="px-5 md:px-10 py-10 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Trailer</h2>
            <button
              onClick={() => setShowTrailer(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-[#e50914] text-white rounded-[8px] text-xs font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Close Trailer</span>
            </button>
          </div>
          <div className="relative aspect-video w-full rounded-[8px] overflow-hidden bg-black shadow-2xl border border-[#333]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </section>
      )}
    </>
  );
}
