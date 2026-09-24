import Link from "next/link";
import Image from "next/image";
import { TMDBMediaItem } from "../../types/tmdb";
import { getMediaDetailUrl, getTMDBImageUrl } from "../../utils/slug";

interface Top3CardsProps {
  items: TMDBMediaItem[];
}

export function Top3Cards({ items }: Top3CardsProps) {
  const top3 = items.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {top3.map((item, index) => {
        const isTV = item.media_type === "tv" || ("first_air_date" in item && !("release_date" in item));
        const type = isTV ? "tv" : "movie";
        const title = item.title || item.name || "Unknown";
        const detailUrl = getMediaDetailUrl(item.id, type, title);
        const posterUrl = getTMDBImageUrl(item.poster_path, "w500");

        return (
          <Link
            key={item.id}
            href={detailUrl}
            className="flex gap-4 bg-[#141414] hover:bg-[#1f1f1f] p-4 rounded-[8px] border border-[#333] transition-all duration-200 hover:-translate-y-1 text-inherit no-underline group"
          >
            <div className="relative w-[110px] md:w-[120px] aspect-[2/3] flex-shrink-0 rounded-[8px] overflow-hidden bg-[#0a0a0a]">
              <Image
                src={posterUrl}
                alt={`${title} poster`}
                fill
                sizes="120px"
                className="object-cover"
                unoptimized={posterUrl.startsWith("http")}
              />
            </div>
            <div className="flex-1 flex flex-col justify-start overflow-hidden">
              <h3 className="text-base md:text-lg font-bold text-[#f5c518] group-hover:text-[#e6b800] mb-2 truncate transition-colors">
                #{index + 1} {title}
              </h3>
              <p className="text-[13px] text-[#b3b3b3] leading-[1.4] line-clamp-4">
                {item.overview || "No overview available."}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
