import { mediaApi } from "../services/api";
import { HeroBanner } from "../components/media/HeroBanner";
import { Top3Cards } from "../components/media/Top3Cards";
import { MovieCard } from "../components/media/MovieCard";
import { MediaCarousel } from "../components/media/MediaCarousel";
import { TMDBMediaItem } from "../types/tmdb";
import { toMediaCard, toMediaCards } from "../utils/media";

export const revalidate = 21600; // 6-hour ISR: trending data changes slowly and this cuts ISR/Render wakeups

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
        {trending.length > 0 && (
          <Top3Cards
            items={trending.slice(0, 3).map((item) => ({
              ...toMediaCard(item),
              overview: item.overview,
            }))}
          />
        )}

        {/* Ranks 4 to 10 Grid */}
        {top10Rest.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {top10Rest.map((item, idx) => (
              <MovieCard key={item.id} item={toMediaCard(item)} rank={idx + 4} />
            ))}
          </div>
        )}
      </section>

      {/* Media Carousels */}
      <MediaCarousel title="Top Picks For You" items={toMediaCards(topPicks)} />
      <MediaCarousel title="Fan Favorites" items={toMediaCards(fanFavorites)} />
      <MediaCarousel title="Action Movies" items={toMediaCards(actionMovies)} />
      <MediaCarousel title="Drama Series" items={toMediaCards(dramaTV)} />
      <MediaCarousel title="Comedy Movies" items={toMediaCards(comedyMovies)} />
      <MediaCarousel title="Thriller Movies" items={toMediaCards(thrillerMovies)} />
      <MediaCarousel title="Sci-Fi Series" items={toMediaCards(scifiTV)} />
      <MediaCarousel title="Crime Series" items={toMediaCards(crimeTV)} />
      <MediaCarousel title="Mystery Series" items={toMediaCards(mysteryTV)} />

      {/* SEO Content Section */}
      <section className="max-w-6xl mx-auto px-5 md:px-10 mt-14 pt-10 border-t border-white/10 text-[#888] text-sm leading-relaxed space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#e5e5e5]">
          Stream Movies and TV Series Online on StreamFlix
        </h2>
        <p>
          StreamFlix is your online destination for discovering and streaming trending movies, critically acclaimed TV shows, and top-rated series in high definition. Explore our curated collections spanning action blockbusters, thrilling crime dramas, laugh-out-loud comedies, and immersive sci-fi adventures. With comprehensive details including cast information, official trailers, release dates, and community ratings powered by TMDB, finding your next watch has never been easier.
        </p>
        <p>
          Whether you are catching up on this week&apos;s hottest releases or diving into timeless fan favorites, StreamFlix offers fast streaming servers, personalized watchlists, and seamless playback across all your devices. Bookmark your favorite titles to build your watchlist and stay updated with the latest cinema entertainment.
        </p>
      </section>
    </div>
  );
}
