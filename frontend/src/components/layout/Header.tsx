"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Search } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-4 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-md"
          : "bg-gradient-to-b from-black/90 to-transparent"
      }`}
    >
      <Link href="/" className="text-2xl md:text-[26px] font-extrabold text-[#e50914] tracking-tight">
        Stream<span className="text-white">Flix</span>
      </Link>

      <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies & shows..."
            aria-label="Search movies and shows"
            className="w-44 md:w-64 px-4 py-2 text-sm text-white bg-white/10 border border-[#333] rounded-[8px] outline-none focus:border-[#e50914] transition-colors placeholder:text-[#b3b3b3]"
          />
        </div>
        <button
          type="submit"
          className="btn px-4 py-2 text-sm font-semibold rounded-[8px] bg-[#e50914] hover:bg-[#f40612] text-white transition-colors"
        >
          <Search className="w-4 h-4 md:hidden" />
          <span className="hidden md:inline">Search</span>
        </button>
      </form>

      <nav className="flex items-center gap-4 md:gap-6">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            pathname === "/" ? "text-white font-semibold" : "text-[#b3b3b3] hover:text-white"
          }`}
        >
          Home
        </Link>
        <Link
          href="/watchlist"
          className={`text-sm font-medium transition-colors ${
            pathname === "/watchlist" ? "text-white font-semibold" : "text-[#b3b3b3] hover:text-white"
          }`}
        >
          My List
        </Link>
      </nav>
    </header>
  );
}
