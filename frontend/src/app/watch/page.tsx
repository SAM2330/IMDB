"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { mediaApi } from "../../services/api";
import { TMDBMovie, TMDBTVShow, TMDBEpisode, TMDBSeasonSummary } from "../../types/tmdb";
import { STREAMING_SERVERS } from "../../utils/streaming";
import { getTMDBImageUrl } from "../../utils/slug";
import { PopupPlayer } from "../../components/player/PopupPlayer";
import { Play, Star, Clock } from "lucide-react";

function WatchContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const typeParam = (searchParams.get("type") as "movie" | "tv") || "movie";
  const seasonParam = parseInt(searchParams.get("season") || "1", 10);
  const episodeParam = parseInt(searchParams.get("episode") || "1", 10);
  const serverParam = searchParams.get("server") || "vidsrc";
  const autoPlay = searchParams.get("play") === "true" || !!searchParams.get("episode");

  const [item, setItem] = useState<TMDBMovie | TMDBTVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState(serverParam);
  const [currentSeason, setCurrentSeason] = useState(seasonParam);
  const [currentEpisode, setCurrentEpisode] = useState(episodeParam);
  const [seasons, setSeasons] = useState<TMDBSeasonSummary[]>([]);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    if (!idParam) return;
    const fetchMedia = async () => {
      setLoading(true);
      try {
        if (typeParam === "tv") {
          const show = await mediaApi.getTVDetails(idParam);
          setItem(show);
          const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
          setSeasons(validSeasons);
        } else {
          const movie = await mediaApi.getMovieDetails(idParam);
          setItem(movie);
        }
      } catch (err) {
        console.error("Error loading watch media:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [idParam, typeParam]);

  useEffect(() => {
    if (typeParam === "tv" && idParam && currentSeason > 0) {
      const fetchEpisodes = async () => {
        setEpisodesLoading(true);
        try {
          const data = await mediaApi.getTVSeason(idParam, currentSeason);
          setEpisodes(data.episodes || []);
        } catch (err) {
          console.error("Error loading episodes:", err);
        } finally {
          setEpisodesLoading(false);
        }
      };

      fetchEpisodes();
    }
  }, [idParam, typeParam, currentSeason]);

  useEffect(() => {
    if (autoPlay && !loading && item) {
      setIsPlayerOpen(true);
    }
  }, [autoPlay, loading, item]);

  if (!idParam) {
    return (
      <div className="pt-32 px-10 text-center text-[#b3b3b3]">
        <p>No media specified. Please select a movie or show to watch.</p>
      </div>
    );
  }

  if (loading || !item) {
    return (
      <div className="pt-32 px-5 md:px-10 max-w-6xl mx-auto animate-pulse space-y-6">
        <div className="h-44 bg-[#141414] rounded-[8px]" />
        <div className="h-64 bg-[#141414] rounded-[8px]" />
      </div>
    );
  }

  const title = ("title" in item ? item.title : item.name) || "Watch";
  const releaseDate = ("release_date" in item ? item.release_date : "first_air_date" in item ? item.first_air_date : "") || "";
  const year = releaseDate.slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const posterUrl = getTMDBImageUrl(item.poster_path, "w500");

  let metaDetails = "";
  if (typeParam === "tv" && "number_of_seasons" in item) {
    metaDetails = `${item.number_of_seasons} Seasons`;
  } else if (typeParam === "movie" && "runtime" in item && item.runtime) {
    metaDetails = `${item.runtime} min`;
  }

  return (
    <div className="pt-20 md:pt-24 min-h-screen pb-16">
      {/* Watch Media Header */}
      <div className="bg-[#141414] border-b border-[#333] px-5 md:px-10 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="relative w-28 md:w-36 aspect-[2/3] flex-shrink-0 rounded-[8px] overflow-hidden shadow-lg bg-black">
            <Image
              src={posterUrl}
              alt={`${title} poster`}
              fill
              sizes="150px"
              className="object-cover"
              unoptimized={posterUrl.startsWith("http")}
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{title}</h1>
            <div className="flex items-center justify-center md:justify-start flex-wrap gap-4 text-sm text-[#b3b3b3]">
              {year && <span>{year}</span>}
              {metaDetails && <span>{metaDetails}</span>}
              {rating !== "N/A" && (
                <span className="flex items-center gap-1 text-[#f5c518] font-semibold">
                  <Star className="w-4 h-4 fill-[#f5c518]" />
                  {rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Watch Controls & Episodes */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8">
        {/* Streaming Server Selector */}
        <div className="flex items-center gap-3 mb-8">
          <label htmlFor="serverSelect" className="text-sm font-semibold text-[#b3b3b3] whitespace-nowrap">
            Streaming Server:
          </label>
          <select
            id="serverSelect"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            className="px-4 py-2.5 bg-[#1f1f1f] border-2 border-[#333] hover:border-[#e50914] text-white text-sm font-medium rounded-[8px] outline-none cursor-pointer min-w-[200px]"
          >
            {Object.entries(STREAMING_SERVERS).map(([key, srv]) => (
              <option key={key} value={key}>
                {srv.label}
              </option>
            ))}
          </select>
        </div>

        {/* TV Series: Season Tabs & Episode Grid */}
        {typeParam === "tv" && (
          <div>
            {/* Season Tabs */}
            <div className="flex gap-2 flex-wrap pb-4 border-b border-[#333] mb-6">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSeason(s.season_number);
                    setCurrentEpisode(1);
                  }}
                  className={`px-4 py-2 rounded-[8px] text-sm font-medium transition-colors ${
                    currentSeason === s.season_number
                      ? "bg-[#e50914] text-white"
                      : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s.name || `Season ${s.season_number}`}
                </button>
              ))}
            </div>

            {/* Episode Grid */}
            {episodesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-[#141414] animate-pulse rounded-[8px]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setCurrentEpisode(ep.episode_number);
                      setIsPlayerOpen(true);
                    }}
                    className={`flex gap-3.5 p-3.5 bg-[#141414] hover:bg-[#1f1f1f] border rounded-[8px] cursor-pointer transition-all hover:translate-x-1 group ${
                      currentEpisode === ep.episode_number
                        ? "border-[#e50914] bg-[#e50914]/10"
                        : "border-[#333] hover:border-[#e50914]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                        currentEpisode === ep.episode_number
                          ? "bg-[#e50914] text-white"
                          : "bg-[#1f1f1f] group-hover:bg-[#e50914] text-white"
                      }`}
                    >
                      {ep.episode_number}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-semibold text-white mb-1 truncate">
                        {ep.name || `Episode ${ep.episode_number}`}
                      </h4>
                      <p className="text-xs text-[#b3b3b3] line-clamp-2 leading-relaxed mb-1">
                        {ep.overview || "No description available."}
                      </p>
                      {ep.runtime && (
                        <div className="flex items-center gap-1 text-[11px] text-[#b3b3b3]">
                          <Clock className="w-3 h-3" />
                          <span>{ep.runtime} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Movie: Play Button */}
        {typeParam === "movie" && (
          <div className="text-center py-16">
            <button
              onClick={() => setIsPlayerOpen(true)}
              className="btn py-4 px-12 text-lg font-bold rounded-[8px] bg-[#e50914] hover:bg-[#f40612] text-white shadow-xl hover:scale-105 transition-transform"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Play Movie</span>
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Video Popup Player */}
      <PopupPlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        title={title}
        type={typeParam}
        id={idParam}
        season={currentSeason}
        episode={currentEpisode}
        episodes={episodes}
        selectedServer={server}
        onServerChange={setServer}
        onEpisodeChange={(ep) => setCurrentEpisode(ep)}
      />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="pt-32 px-10 text-center text-[#b3b3b3]">Loading watch player...</div>}>
      <WatchContent />
    </Suspense>
  );
}
