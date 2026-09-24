import { Metadata } from "next";
import { WatchlistGrid } from "../../components/watchlist/WatchlistGrid";

export const metadata: Metadata = {
  title: "My List",
  description: "Your saved StreamFlix watchlist.",
  robots: {
    index: false,
    follow: true
  }
};

export default function WatchlistPage() {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 md:px-10 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">My List</h1>
      </div>
      <div className="max-w-6xl mx-auto">
        <WatchlistGrid />
      </div>
    </div>
  );
}
