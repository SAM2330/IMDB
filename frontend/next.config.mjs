/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/search.html",
        destination: "/search",
        permanent: true,
      },
      {
        source: "/watchlist.html",
        destination: "/watchlist",
        permanent: true,
      },
      {
        source: "/watch.html",
        destination: "/watch",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
