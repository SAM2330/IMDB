import { mediaApi } from "../services/api";
import { HeroBanner } from "../components/media/HeroBanner";
import { Top3Cards } from "../components/media/Top3Cards";
import { MovieCard } from "../components/media/MovieCard";
import { MediaCarousel } from "../components/media/MediaCarousel";
import { TMDBMediaItem } from "../types/tmdb";

export const revalidate = 3600; // ISR revalidate every hour

export default async function HomePage() {
  let trending: TMDBMediaItem[] = [];
  let topPicks: TMDBMediaItem[] = [];
  let fanFavorites: TMDBMediaItem[] = [];
  let actionMovies: TMDBMediaItem[] = [];
  let dramaTV: TMDBMediaItem[] = [];
  let comedyMovies: TMDBMediaItem[] = [];
  let thrillerMovies: TMDBMediaItem[] = [];
  let scifiTV: TMDBMediaItem[] = [];
  let crimeTV: TMDBMediaItem[] = [];
  let mysteryTV: TMDBMediaItem[] = [];

  try {
    const [
      trendingData,
      topPicksData,
      fanFavData,
      actionData,
      dramaData,
      comedyData,
      thrillerData,
      scifiData,
      crimeData,
      mysteryData
    ] = await Promise.all([
      mediaApi.getTrending().catch(() => ({ results: [] })),
      mediaApi.getTopPicks().catch(() => ({ results: [] })),
      mediaApi.getFanFavorites().catch(() => ({ results: [] })),
      mediaApi.getByGenre("movie", 28).catch(() => ({ results: [] })),
      mediaApi.getByGenre("tv", 18).catch(() => ({ results: [] })),
      mediaApi.getByGenre("movie", 35).catch(() => ({ results: [] })),
      mediaApi.getByGenre("movie", 53).catch(() => ({ results: [] })),
      mediaApi.getByGenre("tv", 10765).catch(() => ({ results: [] })),
      mediaApi.getByGenre("tv", 80).catch(() => ({ results: [] })),
      mediaApi.getByGenre("tv", 9648).catch(() => ({ results: [] }))
    ]);

    trending = trendingData.results || [];
    topPicks = topPicksData.results || [];
    fanFavorites = fanFavData.results || [];
    actionMovies = actionData.results || [];
    dramaTV = dramaData.results || [];
    comedyMovies = comedyData.results || [];
    thrillerMovies = thrillerData.results || [];
    scifiTV = scifiData.results || [];
    crimeTV = crimeData.results || [];
    mysteryTV = mysteryData.results || [];
  } catch (e) {
    console.error("Error fetching homepage media data:", e);
  }

  const featured = trending.find((item) => item.backdrop_path) || trending[0] || null;
  const top10Rest = trending.slice(3, 10);

  return (
    <div className="pb-16">
      {/* Dynamic Hero Banner */}
      <HeroBanner item={featured} />

      {/* Top 10 Trending Section */}
      <section className="px-5 md:px-10 pt-10 md:pt-14 pb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🔥</span> Trending This Week
        </h2>

        {/* Top 3 Large Cards */}
        {trending.length > 0 && <Top3Cards items={trending.slice(0, 3)} />}

        {/* Ranks 4 to 10 Grid */}
        {top10Rest.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {top10Rest.map((item, idx) => (
              <MovieCard key={item.id} item={item} rank={idx + 4} />
            ))}
          </div>
        )}
      </section>

      {/* Media Carousels */}
      <MediaCarousel title="Top Picks For You" items={topPicks} />
      <MediaCarousel title="Fan Favorites" items={fanFavorites} />
      <MediaCarousel title="Action Movies" items={actionMovies} />
      <MediaCarousel title="Drama Series" items={dramaTV} />
      <MediaCarousel title="Comedy Movies" items={comedyMovies} />
      <MediaCarousel title="Thriller Movies" items={thrillerMovies} />
      <MediaCarousel title="Sci-Fi Series" items={scifiTV} />
      <MediaCarousel title="Crime Series" items={crimeTV} />
      <MediaCarousel title="Mystery Series" items={mysteryTV} />
    </div>
  );
}
