import { Metadata } from "next";
import { Suspense } from "react";
import { TitleContent } from "./TitleContent";

export const metadata: Metadata = {
  title: "Watch on StreamFlix",
  robots: {
    index: false,
    follow: false
  }
};

function TitleFallback() {
  return (
    <div className="pt-32 px-5 md:px-10 max-w-6xl mx-auto animate-pulse space-y-6">
      <div className="h-72 md:h-96 bg-[#141414] rounded-[8px]" />
      <div className="h-40 bg-[#141414] rounded-[8px]" />
    </div>
  );
}

export default function TitlePage() {
  return (
    <Suspense fallback={<TitleFallback />}>
      <TitleContent />
    </Suspense>
  );
}
