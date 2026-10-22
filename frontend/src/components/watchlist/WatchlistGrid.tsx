"use client";

import { useWatchlist } from "../../hooks/useWatchlist";
import { MovieCard } from "../media/MovieCard";

export function WatchlistGrid() {
  const { watchlist, isLoaded, removeFromWatchlist } = useWatchlist();

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-5 md:px-10 py-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-[#141414] animate-pulse rounded-[8px]" />
        ))}
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="px-5 md:px-10 py-12 text-[#b3b3b3]">
        <p className="text-base md:text-lg">Your list is empty. Browse and add movies & shows!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-5 md:px-10 pb-12">
      {watchlist.map((item, index) => (
        <MovieCard
          key={`${item.id}-${index}`}
          item={item}
          onRemove={() => removeFromWatchlist(index)}
        />
      ))}
    </div>
  );
}
