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

if (process.env.NODE_ENV === "production" && !process.env.API_SECRET) {
  console.warn(
    "\n[StreamFlix] API_SECRET is not set. Server-side/build requests to the " +
      "Render API will be rejected once Render has API_SECRET configured. " +
      "Set the same API_SECRET in Vercel and Render.\n"
  );
}

export default nextConfig;
