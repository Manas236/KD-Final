/* ============================================================
   Go-live gate — the site must know its own address
   ------------------------------------------------------------
   Every absolute URL the site emits — canonical, og:url, og:image,
   the JSON-LD @id and logo, every <loc> in /sitemap.xml, the Sitemap
   line in /robots.txt — is written against `site` in astro.config.mjs,
   which is PUBLIC_SITE_URL or, unset, http://localhost:4322. That
   fallback is right for development and ruinous in production: a page
   whose canonical says localhost tells the crawler the real domain is
   a duplicate of somewhere it cannot reach, and a sitemap of localhost
   URLs submits nothing. Neither fails loudly; the site just never
   ranks. So `npm run build:release` runs this first and refuses.

   Reads .env the way astro.config.mjs does (dotenv is a dependency),
   then the environment proper, so a CI that exports the variable
   without a .env file passes too.

   Usage:  node scripts/check-site-url.mjs
   ============================================================ */
import "dotenv/config";

const raw = (process.env.PUBLIC_SITE_URL ?? "").trim();

function fail(reason) {
  console.log(`  FAIL  PUBLIC_SITE_URL ${reason}`);
  console.log(
    "        Set it in .env (or the environment) to the site's public origin,\n" +
      "        e.g. PUBLIC_SITE_URL=https://www.kdconstructions.net — no path,\n" +
      "        no trailing slash. OPEN-QUESTIONS.md #13."
  );
  process.exit(1);
}

if (!raw) fail("is not set — every canonical and sitemap URL would say localhost");

let url;
try {
  url = new URL(raw);
} catch {
  fail(`is not a URL: ${raw}`);
}

if (url.protocol !== "https:") fail(`must be https, got ${url.protocol}//`);
if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(url.hostname)) {
  fail(`points at ${url.hostname} — that is the development fallback`);
}
if (url.pathname !== "/" || url.search || url.hash) {
  fail(`must be an origin only, got ${raw}`);
}

console.log(`  PASS  PUBLIC_SITE_URL=${url.origin}`);

/* The staging switch (src/lib/staging.ts) keeps a test copy out of the
   index. Left on at launch, the real site never enters it either. */
const noindex = (process.env.SITE_NOINDEX ?? "").trim().toLowerCase();
if (noindex === "1" || noindex === "true") {
  console.log("  FAIL  SITE_NOINDEX is on — the launch site would tell every crawler to go away.");
  console.log("        Remove it from .env (it is for the test server only). PRE-LAUNCH.md G6.");
  process.exit(1);
}
console.log("  PASS  SITE_NOINDEX is off");
