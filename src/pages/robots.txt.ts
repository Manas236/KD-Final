/* ============================================================
   /robots.txt — crawl everything, and here is the sitemap
   ------------------------------------------------------------
   Served rather than dropped in public/ because the Sitemap line
   needs an absolute URL, and the origin is `site` from
   astro.config.mjs (PUBLIC_SITE_URL) — the same value the sitemap and
   every canonical are written against.

   Nothing is disallowed, on purpose:

   - NOT /api/. The head script on every page fetches /api/content to
     paint the in-page editor's saved copy (BaseLayout.astro, "THE READ
     PATH"). Googlebot renders pages, and a render that cannot reach
     that endpoint indexes the copy the site was built with instead of
     the copy it now says. Nothing links to /api/, so nothing there is
     crawled as a page anyway.
   - NOT /studio/. The sign-in page sets X-Robots-Tag: noindex and its
     slug is a 40-character secret nothing links to; a Disallow line
     would only announce that the path exists.
   ============================================================ */
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ site }) => {
  const lines = ["User-agent: *", "Allow: /"];
  if (site) lines.push("", `Sitemap: ${new URL("/sitemap.xml", site).href}`);
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
