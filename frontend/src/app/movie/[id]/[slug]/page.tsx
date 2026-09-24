import { Metadata } from "next";
import { notFound } from "next/navigation";
import { mediaApi } from "../../../../services/api";
import { DetailHero } from "../../../../components/media/DetailHero";
import { MediaCarousel } from "../../../../components/media/MediaCarousel";
import { getTMDBImageUrl, slugify } from "../../../../utils/slug";

interface MoviePageProps {
  params: {
    id: string;
    slug: string;
  };
}

export const revalidate = 86400; // 24 hours ISR

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return { title: "Movie Not Found - StreamFlix" };

  try {
    const movie = await mediaApi.getMovieDetails(id);
    const title = movie.title || "Movie";
    const year = movie.release_date?.slice(0, 4) ? ` (${movie.release_date.slice(0, 4)})` : "";
    const pageTitle = `${title}${year}`;
    const description =
      movie.overview?.trim()
        ? movie.overview.length > 155
          ? `${movie.overview.slice(0, 152).trim()}...`
          : movie.overview
        : `Watch ${title} details, trailer, cast, rating, and streaming options on StreamFlix.`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";
    const canonicalUrl = `${siteUrl}/movie/${movie.id}/${slugify(title)}`;
    const imageUrl = movie.backdrop_path
      ? getTMDBImageUrl(movie.backdrop_path, "original")
      : getTMDBImageUrl(movie.poster_path, "w500");

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: pageTitle,
        description,
        url: canonicalUrl,
        siteName: "StreamFlix",
        type: "video.movie",
        images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: "Movie - StreamFlix" };
  }
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  let movie;
  try {
    movie = await mediaApi.getMovieDetails(id);
  } catch (e) {
    console.error("Failed to load movie details:", e);
    notFound();
  }

  if (!movie) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview,
    image: movie.poster_path ? getTMDBImageUrl(movie.poster_path, "w500") : undefined,
    datePublished: movie.release_date,
    ...(movie.vote_average && movie.vote_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(movie.vote_average.toFixed(1)),
            ratingCount: movie.vote_count,
            bestRating: 10,
            worstRating: 0,
          },
        }
      : {}),
  };

  const similarMovies = movie.similar?.results?.map((m) => ({ ...m, media_type: "movie" as const })) || [];

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DetailHero item={movie} type="movie" />
      {similarMovies.length > 0 && (
        <MediaCarousel title="Similar Movies" items={similarMovies} autoScrollInterval={0} />
      )}
    </div>
  );
}
