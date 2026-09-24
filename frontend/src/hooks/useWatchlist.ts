"use client";

import { useState, useEffect, useCallback } from "react";
import { WatchlistStoredItem } from "../types/tmdb";

const WATCHLIST_STORAGE_KEY = "watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistStoredItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load watchlist from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addToWatchlist = useCallback((item: {
    id: number;
    title?: string;
    name?: string;
    media_type?: "movie" | "tv";
    poster_path: string | null;
    overview?: string;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
  }, type: "movie" | "tv" = "movie") => {
    const title = item.title || item.name || "Unknown";
    const release = item.release_date || item.first_air_date;

    setWatchlist(prev => {
      if (prev.some(existing => existing.id === item.id)) {
        alert("Already in your list!");
        return prev;
      }

      const newItem: WatchlistStoredItem = {
        id: item.id,
        title,
        media_type: type,
        poster_path: item.poster_path,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: release
      };

      const updated = [...prev, newItem];
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save watchlist item", e);
      }

      alert("Added to My List!");
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((index: number) => {
    setWatchlist(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to remove watchlist item", e);
      }
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback((id: number) => {
    return watchlist.some(item => item.id === id);
  }, [watchlist]);

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
}
