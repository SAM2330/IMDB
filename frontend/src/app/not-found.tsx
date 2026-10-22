import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-32 px-5 md:px-10 max-w-3xl mx-auto text-center min-h-screen">
      <p className="text-[#e50914] font-bold tracking-[0.2em] text-sm mb-3">404</p>
      <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
        This title isn&apos;t available at that link
      </h1>
      <p className="text-[#b3b3b3] mb-8">
        It may be a long-tail title that isn&apos;t pre-built. Search for it and
        StreamFlix will open it in the player shell.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/search"
          className="inline-flex items-center justify-center bg-[#e50914] hover:bg-[#f40612] text-white font-semibold px-6 py-3 rounded-[8px] transition-colors"
        >
          Search titles
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-[8px] transition-colors"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );
}
