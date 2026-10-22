import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PREBUILD_ITEMS } from "./generated/prebuild-manifest";
import { slugify } from "./utils/slug";

const PREBUILT_DETAILS = new Map(
  PREBUILD_ITEMS.map((item) => [`${item.media_type}:${item.id}`, item] as const)
);

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Non-prebuilt detail URLs used to be indexable. They now 404 because the
  // static routes only exist for the build-time manifest. Send crawlers and
  // visitors to the client-rendered title shell instead of dropping them.
  const detailMatch = pathname.match(/^\/(movie|tv)\/(\d+)(?:\/(.*))?$/);
  if (detailMatch) {
    const type = detailMatch[1] as "movie" | "tv";
    const id = Number(detailMatch[2]);
    const prebuilt = PREBUILT_DETAILS.get(`${type}:${id}`);

    if (!prebuilt) {
      const targetUrl = new URL("/title", request.url);
      targetUrl.searchParams.set("type", type);
      targetUrl.searchParams.set("id", String(id));
      return NextResponse.redirect(targetUrl, 301);
    }

    // Older links sometimes omit the slug or use an outdated one. Point them
    // at the canonical static URL so they do not hit the route's 404 boundary.
    const canonicalSlug = slugify(prebuilt.title);
    if (detailMatch[3] !== canonicalSlug) {
      return NextResponse.redirect(
        new URL(`/${type}/${id}/${canonicalSlug}`, request.url),
        301
      );
    }
  }

  // Handle legacy /movie.html?id=...&type=...
  if (pathname === "/movie.html") {
    const id = searchParams.get("id");
    const type = searchParams.get("type") === "tv" ? "tv" : "movie";

    if (id) {
      const targetUrl = new URL("/title", request.url);
      targetUrl.searchParams.set("type", type);
      targetUrl.searchParams.set("id", id);
      return NextResponse.redirect(targetUrl, 301);
    }
    return NextResponse.redirect(new URL("/", request.url), 301);
  }

  // Handle legacy /watch.html?id=...
  if (pathname === "/watch.html") {
    const url = request.nextUrl.clone();
    url.pathname = "/watch";
    return NextResponse.redirect(url, 301);
  }

  // Handle legacy /search.html?q=...
  if (pathname === "/search.html") {
    const url = request.nextUrl.clone();
    url.pathname = "/search";
    return NextResponse.redirect(url, 301);
  }

  // Handle legacy /watchlist.html
  if (pathname === "/watchlist.html") {
    return NextResponse.redirect(new URL("/watchlist", request.url), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/movie/:path*",
    "/tv/:path*",
    "/movie.html",
    "/watch.html",
    "/search.html",
    "/watchlist.html"
  ],
};
