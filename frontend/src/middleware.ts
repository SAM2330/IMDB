import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle legacy /movie.html?id=...&type=...
  if (pathname === "/movie.html") {
    const id = searchParams.get("id");
    const type = searchParams.get("type") === "tv" ? "tv" : "movie";

    if (id) {
      const targetUrl = new URL(`/${type}/${id}/watch`, request.url);
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
    "/movie.html",
    "/watch.html",
    "/search.html",
    "/watchlist.html"
  ],
};
