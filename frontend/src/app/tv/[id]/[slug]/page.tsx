import { Metadata } from "next";
import { notFound } from "next/navigation";
import { mediaApi } from "../../../../services/api";
import { DetailHero } from "../../../../components/media/DetailHero";
import { MediaCarousel } from "../../../../components/media/MediaCarousel";
import { getTMDBImageUrl, slugify } from "../../../../utils/slug";

interface TVPageProps {
  params: {
    id: string;
    slug: string;
  };
}

export const revalidate = 86400; // 24 hours ISR

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return { title: "Series Not Found - StreamFlix" };

  try {
    const show = await mediaApi.getTVDetails(id);
    const title = show.name || "Series";
    const year = show.first_air_date?.slice(0, 4) ? ` (${show.first_air_date.slice(0, 4)})` : "";
    const pageTitle = `${title}${year}`;
    const description =
      show.overview?.trim()
        ? show.overview.length > 155
          ? `${show.overview.slice(0, 152).trim()}...`
          : show.overview
        : `Watch ${title} details, episodes, trailer, cast, and streaming options on StreamFlix.`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";
    const canonicalUrl = `${siteUrl}/tv/${show.id}/${slugify(title)}`;
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
    show = await mediaApi.getTVDetails(id);
  } catch (e) {
    console.error("Failed to load TV details:", e);
    notFound();
  }

  if (!show) {
    notFound();
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

  const similarShows = show.similar?.results?.map((s) => ({ ...s, media_type: "tv" as const })) || [];

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DetailHero item={show} type="tv" />
      {similarShows.length > 0 && (
        <MediaCarousel title="Similar Shows" items={similarShows} autoScrollInterval={0} />
      )}
    </div>
  );
}
