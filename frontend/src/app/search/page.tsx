"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mediaApi } from "../../services/api";
import { TMDBMediaItem } from "../../types/tmdb";
import { MovieCard } from "../../components/media/MovieCard";
import { Search } from "lucide-react";

const MIN_QUERY_LENGTH = 2;

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [results, setResults] = useState<TMDBMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync search input when URL query changes
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Debounced search trigger. A 700ms delay, a 2-character minimum, and
  // request cancellation prevent a request per keystroke from reaching Render.
  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      abortRef.current = null;
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setError(null);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await mediaApi.search(query, 1, controller.signal);
        setResults(data.results || []);
        // Update the URL without a Next.js navigation. router.replace() would
        // request the /search RSC payload from Vercel on every debounced query.
        window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Search failed:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 700);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const trimmedTerm = searchTerm.trim();
  const isQueryTooShort = trimmedTerm.length > 0 && trimmedTerm.length < MIN_QUERY_LENGTH;

  return (
    <div className="pt-24 px-5 md:px-10 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Search Results</h1>

        {/* Inline Search Input Bar */}
        <div className="relative max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies & TV shows..."
            className="w-full pl-12 pr-4 py-3 bg-[#141414] border border-[#333] focus:border-[#e50914] text-white rounded-[8px] outline-none transition-colors text-base"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#141414] animate-pulse rounded-[8px]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-[#141414] border border-red-500/30 rounded-[8px] text-red-400">
            {error}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((item) => (
              <MovieCard key={`${item.id}-${item.media_type}`} item={item} />
            ))}
          </div>
        ) : isQueryTooShort ? (
          <div className="py-12 text-[#b3b3b3]">
            <p className="text-lg">Type at least {MIN_QUERY_LENGTH} characters to search.</p>
          </div>
        ) : trimmedTerm ? (
          <div className="py-12 text-[#b3b3b3]">
            <p className="text-lg">No results found for &quot;{searchTerm}&quot;.</p>
          </div>
        ) : (
          <div className="py-12 text-[#b3b3b3]">
            <p className="text-lg">Type something in the search box to discover movies and shows.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 px-10 text-center text-[#b3b3b3]">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
