/* ============================================================
   /robots.txt — what crawlers may fetch, and where the sitemap is
   ------------------------------------------------------------
   Served rather than dropped in public/ because the Sitemap line
   needs an absolute URL, and the origin is `site` from
   astro.config.mjs (PUBLIC_SITE_URL) — the same value the sitemap and
   every canonical are written against. At launch that is
   https://kdconstructions.net, the bare domain (www redirects to it,
   PRE-LAUNCH.md S2), so the line reads that and never the test IP.

   Since 27 Oct 2026 (PRE-LAUNCH.md S2):

   - /studio is disallowed: the editor's sign-in, gallery manager and
     applications list are nothing a search result should lead to.
     The line names the folder, never the sign-in slug under it.
   - /api is disallowed, except /api/content. The server writes saved
     edits into every page's HTML (src/lib/server-edits.ts), so a
     crawler reads Sir's text without calling anything. But when the
     server could not (no answer from the database), the head script's
     fetch of /api/content is what puts it on the page, and a crawler
     that renders the page must be allowed that fetch too. The longer
     Allow wins over the shorter Disallow for Google and Bing.

   Except on a test deployment (SITE_NOINDEX=1, src/lib/staging.ts):
   there it disallows everything and names no sitemap.
   ============================================================ */
import type { APIRoute } from "astro";
import { isNoindexDeployment } from "../lib/staging";

export const prerender = false;

export const GET: APIRoute = ({ site }) => {
  if (isNoindexDeployment()) {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
  const lines = ["User-agent: *", "Disallow: /studio", "Disallow: /api", "Allow: /api/content"];
  if (site) lines.push("", `Sitemap: ${new URL("/sitemap.xml", site).href}`);
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
