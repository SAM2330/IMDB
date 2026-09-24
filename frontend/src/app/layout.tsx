import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "../components/layout/Header";
import { QueryProvider } from "../components/providers/QueryProvider";
import { Analytics } from "../components/analytics/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StreamFlix - Watch Movies & TV Shows Online",
    template: "%s - StreamFlix"
  },
  description:
    "Watch movies, TV shows, and favorite series on StreamFlix with trending titles, fan favorites, genre collections, and multiple streaming server choices.",
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/favicon-96x96.png"
  },
  openGraph: {
    title: "StreamFlix - Watch Movies & TV Shows Online",
    description: "Discover trending movies, TV shows, fan favorites, and genre collections on StreamFlix.",
    url: siteUrl,
    siteName: "StreamFlix",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamFlix - Watch Movies & TV Shows Online",
    description: "Discover trending movies, TV shows, fan favorites, and genre collections on StreamFlix."
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StreamFlix",
    "alternateName": "StreamFlix",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased flex flex-col">
        <QueryProvider>
          <Analytics />
          <Header />
          <main className="flex-1">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
