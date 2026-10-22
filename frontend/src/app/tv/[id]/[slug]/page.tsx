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

interface TVPageProps {
  params: {
    id: string;
    slug: string;
  };
}

export const revalidate = false; // Build-time static only: no ISR write quota usage
export const dynamicParams = false; // Long-tail series are served by the /title client shell

const getShow = cache(async (id: number) => {
  return mediaApi.getTVDetails(id);
});

export async function generateStaticParams() {
  const items = await getPrebuildItems();
  return items
    .filter((item) => item.media_type === "tv")
    .map((item) => ({
      id: String(item.id),
      slug: slugify(item.title || "details"),
    }));
}

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return { title: "Series Not Found - StreamFlix" };

  try {
    const show = await getShow(id);
    const title = show.name || "Series";
    const canonicalSlug = slugify(title);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";
    const canonicalUrl = `${siteUrl}/tv/${show.id}/${canonicalSlug}`;

    // If non-canonical slug, point canonical tag directly to canonical URL
    if (params.slug !== canonicalSlug) {
      return {
        alternates: {
          canonical: canonicalUrl,
        },
      };
    }

    const year = show.first_air_date?.slice(0, 4) ? ` (${show.first_air_date.slice(0, 4)})` : "";
    const pageTitle = `Watch ${title}${year} Series Online`;
    const description =
      show.overview?.trim()
        ? show.overview.length > 155
          ? `${show.overview.slice(0, 152).trim()}...`
          : show.overview
        : `Watch ${title} details, episodes, trailer, cast, and streaming options on StreamFlix.`;

    const imageUrl = show.backdrop_path
      ? getTMDBImageUrl(show.backdrop_path, "original")
      : getTMDBImageUrl(show.poster_path, "w500");

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
        type: "video.tv_show",
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
    return { title: "Series - StreamFlix" };
  }
}

export default async function TVDetailPage({ params }: TVPageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  let show;
  try {
    show = await getShow(id);
  } catch (e) {
    // Only a real 404 should become a cached not-found page. Transient
    // backend failures should be retried by the next ISR request.
    if (e instanceof BackendApiError && e.status === 404) {
      notFound();
    }
    console.error("Failed to load TV details:", e);
    throw e;
  }

  if (!show) {
    notFound();
  }

  // Canonical slug enforcement: 308 permanent redirect if slug is non-canonical (e.g. /watch, typos, outdated slugs)
  const canonicalSlug = slugify(show.name || "details");
  if (params.slug !== canonicalSlug) {
    redirect(`/tv/${show.id}/${canonicalSlug}`, RedirectType.replace);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    description: show.overview,
    image: show.poster_path ? getTMDBImageUrl(show.poster_path, "w500") : undefined,
    datePublished: show.first_air_date,
    numberOfSeasons: show.number_of_seasons,
    numberOfEpisodes: show.number_of_episodes,
    ...(show.vote_average && show.vote_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(show.vote_average.toFixed(1)),
            ratingCount: show.vote_count,
            bestRating: 10,
            worstRating: 0,
          },
        }
      : {}),
  };

  const similarShows =
    show.similar?.results?.map((s) => ({
      ...toMediaCard(s),
      media_type: "tv" as const,
    })) || [];

  const trailer = show.videos?.results?.find(
    (v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube"
  );

  // Keep the client payload small: no similar list, full credits, or videos.
  const heroItem: TMDBDetailItem = {
    id: show.id,
    name: show.name,
    overview: show.overview,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    first_air_date: show.first_air_date,
    vote_average: show.vote_average,
    genres: show.genres,
    number_of_seasons: show.number_of_seasons,
    seasons: show.seasons?.filter((s) => s.season_number > 0),
    credits: show.credits ? { cast: show.credits.cast.slice(0, 5) } : undefined,
    videos: trailer ? { results: [trailer] } : undefined,
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MediaCache type="tv" item={heroItem} />
      <DetailHero item={heroItem} type="tv" />
      {similarShows.length > 0 && (
        <MediaCarousel title="Similar Shows" items={similarShows} autoScrollInterval={0} rel="nofollow" clientDetail />
      )}
    </div>
  );
}
