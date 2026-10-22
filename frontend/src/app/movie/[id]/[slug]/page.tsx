import { cache } from "react";
import { Metadata } from "next";
import { notFound, redirect, RedirectType } from "next/navigation";
import { BackendApiError, mediaApi } from "../../../../services/api";
import { DetailHero } from "../../../../components/media/DetailHero";
import { MediaCache } from "../../../../components/media/MediaCache";
import { MediaCarousel } from "../../../../components/media/MediaCarousel";
import { getTMDBImageUrl, slugify } from "../../../../utils/slug";
import { getPrebuildItems } from "../../../../utils/prebuild";
import { toMediaCard } from "../../../../utils/media";
import { TMDBDetailItem } from "../../../../types/tmdb";

interface MoviePageProps {
  params: {
    id: string;
    slug: string;
  };
}

export const revalidate = false; // Build-time static only: no ISR write quota usage
export const dynamicParams = false; // Long-tail titles are served by the /title client shell

const getMovie = cache(async (id: number) => {
  return mediaApi.getMovieDetails(id);
});

export async function generateStaticParams() {
  const items = await getPrebuildItems();
  return items
    .filter((item) => item.media_type === "movie")
    .map((item) => ({
      id: String(item.id),
      slug: slugify(item.title || "details"),
    }));
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return { title: "Movie Not Found - StreamFlix" };

  try {
    const movie = await getMovie(id);
    const title = movie.title || "Movie";
    const canonicalSlug = slugify(title);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";
    const canonicalUrl = `${siteUrl}/movie/${movie.id}/${canonicalSlug}`;

    // If non-canonical slug, point canonical tag directly to canonical URL
    if (params.slug !== canonicalSlug) {
      return {
        alternates: {
          canonical: canonicalUrl,
        },
      };
    }

    const year = movie.release_date?.slice(0, 4) ? ` (${movie.release_date.slice(0, 4)})` : "";
    const pageTitle = `Watch ${title}${year} Online in HD`;
    const description =
      movie.overview?.trim()
        ? movie.overview.length > 155
          ? `${movie.overview.slice(0, 152).trim()}...`
          : movie.overview
        : `Watch ${title} details, trailer, cast, rating, and streaming options on StreamFlix.`;

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
    movie = await getMovie(id);
  } catch (e) {
    // A real 404 from TMDB means the title does not exist. Anything else
    // (timeout, 5xx, sleeping backend) should surface as an error instead of
    // being cached as a permanent 404 for a valid page.
    if (e instanceof BackendApiError && e.status === 404) {
      notFound();
    }
    console.error("Failed to load movie details:", e);
    throw e;
  }

  if (!movie) {
    notFound();
  }

  // Canonical slug enforcement: 308 permanent redirect if slug is non-canonical (e.g. /watch, typos, outdated slugs)
  const canonicalSlug = slugify(movie.title || "details");
  if (params.slug !== canonicalSlug) {
    redirect(`/movie/${movie.id}/${canonicalSlug}`, RedirectType.replace);
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

  const similarMovies =
    movie.similar?.results?.map((m) => ({
      ...toMediaCard(m),
      media_type: "movie" as const,
    })) || [];

  const trailer = movie.videos?.results?.find(
    (v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube"
  );

  // Only send the fields the client hero actually renders. This keeps full
  // credits, all videos, and the similar list out of the RSC payload.
  const heroItem: TMDBDetailItem = {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    genres: movie.genres,
    runtime: movie.runtime,
    credits: movie.credits ? { cast: movie.credits.cast.slice(0, 5) } : undefined,
    videos: trailer ? { results: [trailer] } : undefined,
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MediaCache type="movie" item={heroItem} />
      <DetailHero item={heroItem} type="movie" />
      {similarMovies.length > 0 && (
        <MediaCarousel title="Similar Movies" items={similarMovies} autoScrollInterval={0} rel="nofollow" clientDetail />
      )}
    </div>
  );
}
