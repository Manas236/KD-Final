/* ============================================================
   Staging switch — a copy of the site that search engines skip
   ------------------------------------------------------------
   SITE_NOINDEX=1 in the server's .env marks this deployment as a test
   copy (e.g. the review server on a bare IP). Then:

   - every response carries X-Robots-Tag: noindex, nofollow
     (src/middleware.ts) — pages, images, the API, everything;
   - /robots.txt says Disallow: / and drops the Sitemap line.

   Read from process.env at request time, not import.meta.env, so the
   same build can be switched by editing .env and restarting — no
   rebuild. Remove the line (or set it to anything but 1/true) on the
   real domain, or the site never enters the index.
   ============================================================ */
import "dotenv/config"; // loads the .env file into process.env, as src/lib/db.ts does

export function isNoindexDeployment(): boolean {
  const v = (process.env.SITE_NOINDEX ?? "").trim().toLowerCase();
  return v === "1" || v === "true";
}
