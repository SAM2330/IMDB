export interface StreamingServer {
  label: string;
  movie: (id: number | string) => string;
  tv: (id: number | string, season: number | string, episode: number | string) => string;
}

export const STREAMING_SERVERS: Record<string, StreamingServer> = {
  vidsrc: {
    label: "VidSrc",
    movie: id => `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id, s, e) => `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1`
  },
  vixsrc: {
    label: "VixSrc",
    movie: id => `https://vixsrc.to/movie/${id}`,
    tv: (id, s, e) => `https://vixsrc.to/tv/${id}/${s}/${e}`
  },
  vidlink: {
    label: "VidLink",
    movie: id => `https://vidlink.pro/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoPlay=true`
  },
  vidfast: {
    label: "VidFast",
    movie: id => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`
  },
  vidsrcpm: {
    label: "VidSrc.pm",
    movie: id => `https://vidsrc.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
  },
  twembed: {
    label: "2Embed",
    movie: id => `https://www.2embed.skin/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}`
  },
  autoembed: {
    label: "AutoEmbed",
    movie: id => `https://autoembed.co/movie/tmdb/${id}`,
    tv: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`
  },
  moviesapi: {
    label: "MoviesAPI",
    movie: id => `https://moviesapi.to/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.to/tv/${id}-${s}-${e}`
  },
  vidrock: {
    label: "VidRock",
    movie: id => `https://vidrock.net/movie/${id}?autoplay=true`,
    tv: (id, s, e) => `https://vidrock.net/tv/${id}/${s}/${e}?autoplay=true`
  },
  videasy: {
    label: "Videasy",
    movie: id => `https://player.videasy.net/movie/${id}?overlay=true`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}?overlay=true`
  },
  godrive: {
    label: "GoDrive",
    movie: id => `https://godriveplayer.com/player.php?type=movie&tmdb=${id}`,
    tv: (id, s, e) => `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}`
  },
  smashystream: {
    label: "SmashyStream",
    movie: id => `https://player.smashystream.com/playere.php?tmdb=${id}`,
    tv: (id, s, e) => `https://player.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  }
};

export function buildEmbedUrl(serverKey: string, type: "movie" | "tv", id: number | string, season = 1, episode = 1): string {
  const server = STREAMING_SERVERS[serverKey] || STREAMING_SERVERS.vidsrc;
  return type === "movie" ? server.movie(id) : server.tv(id, season, episode);
}
