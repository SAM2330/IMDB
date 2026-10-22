"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mediaApi } from "../../services/api";
import { TMDBDetailView } from "../../types/tmdb";
import { DetailHero } from "../../components/media/DetailHero";
import { MediaCarousel } from "../../components/media/MediaCarousel";

function LoadingShell() {
  return (
    <div className="pt-32 px-5 md:px-10 max-w-6xl mx-auto animate-pulse space-y-6">
      <div className="h-72 md:h-96 bg-[#141414] rounded-[8px]" />
      <div className="h-40 bg-[#141414] rounded-[8px]" />
    </div>
  );
}

export function TitleContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  const [item, setItem] = useState<TMDBDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!/^\d+$/.test(id)) {
      setError("This title link is invalid.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    mediaApi
      .getDetailView(type, id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setItem(data);
        document.title = `${data.title || data.name || "Title"} - StreamFlix`;
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load title view:", err);
        setError("We could not load this title right now. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, type]);

  if (loading) {
    return <LoadingShell />;
  }

  if (error || !item) {
    return (
      <div className="pt-32 px-5 md:px-10 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
          Title unavailable
        </h1>
        <p className="text-[#b3b3b3] mb-8">{error || "This title could not be found."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold px-6 py-3 rounded-[8px] transition-colors"
        >
          Back to StreamFlix
        </Link>
      </div>
    );
  }

  const similar = item.similar?.results || [];

  return (
    <div className="pb-16">
      <DetailHero item={item} type={type} />
      {similar.length > 0 && (
        <MediaCarousel
          title={type === "tv" ? "Similar Shows" : "Similar Movies"}
          items={similar}
          autoScrollInterval={0}
        />
      )}
    </div>
  );
}
