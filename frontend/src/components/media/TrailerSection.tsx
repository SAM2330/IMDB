"use client";

import { TMDBVideo } from "../../types/tmdb";

interface TrailerSectionProps {
  videos?: { results: TMDBVideo[] };
}

export function TrailerSection({ videos }: TrailerSectionProps) {
  const trailer = videos?.results?.find(
    (v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube"
  );

  if (!trailer) return null;

  return (
    <section id="trailerSection" className="px-5 md:px-10 py-10 max-w-5xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Trailer</h2>
      <div className="relative aspect-video w-full rounded-[8px] overflow-hidden bg-black shadow-2xl border border-[#333]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
          title="Movie Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </section>
  );
}
