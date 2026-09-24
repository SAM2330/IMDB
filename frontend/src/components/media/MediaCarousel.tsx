"use client";

import { useRef, useEffect } from "react";
import { TMDBMediaItem } from "../../types/tmdb";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaCarouselProps {
  title: string;
  items: TMDBMediaItem[];
  autoScrollInterval?: number;
}

export function MediaCarousel({ title, items, autoScrollInterval = 6000 }: MediaCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScrollInterval || !containerRef.current || items.length === 0) return;

    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScrollInterval, items.length]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const offset = direction === "left" ? -400 : 400;
    containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative group/section px-5 md:px-10 py-6">
      <h2 className="text-lg md:text-xl font-bold text-white mb-4">{title}</h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/70 hover:bg-[#e50914] text-white rounded-full flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 shadow-lg -ml-4 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={containerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
        >
          {items.map((item) => (
            <div key={`${item.id}-${item.media_type || 'item'}`} className="w-[150px] md:w-[180px] flex-shrink-0">
              <MovieCard item={item} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/70 hover:bg-[#e50914] text-white rounded-full flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 shadow-lg -mr-4 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
