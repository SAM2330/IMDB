import {
  PREBUILD_ITEMS,
  type PrebuildManifestItem,
} from "../generated/prebuild-manifest";

export type PrebuildItem = PrebuildManifestItem;

/**
 * The exact set of titles pre-rendered at build time. The manifest is generated
 * by `scripts/generate-prebuild-manifest.mjs` (run automatically by `npm run
 * build`) from the curated SEO catalog and every title the homepage can link to.
 *
 * Keeping this list static means the homepage and SEO pages can be fully static
 * with `dynamicParams = false`; search/watchlist/similar links fall back to the
 * `/title` client shell for titles that are not in this list.
 */
export async function getPrebuildItems(): Promise<PrebuildItem[]> {
  if (PREBUILD_ITEMS.length === 0) {
    throw new Error(
      "The prebuild manifest is empty. Run `npm run prebuild` before building."
    );
  }

  return PREBUILD_ITEMS;
}
