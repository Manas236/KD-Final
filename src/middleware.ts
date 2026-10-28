/* Every request the app answers passes through here, for four things.

   1. ONE ADDRESS PER PAGE (22 Oct 2026). "/about/" used to answer 200
      as a copy of "/about", and named itself as canonical, so a link
      with a trailing slash made a second page in a search index. Any
      path ending in "/" other than "/" itself now answers 301 to the
      same path without it, query string kept. Left alone: /studio and
      /api (the editor and its routes answer exactly as they always
      have), Astro's own /_astro and /_image, the /media and /video
      files, and anything with a file extension. The target is built
      with one leading slash, so "//host/" can never turn into a
      redirect to another site.

   2. Staging: keep a test deployment out of every search index. See
      src/lib/staging.ts. A no-op unless SITE_NOINDEX=1.

   3. SAVED EDITS IN THE HTML (27 Oct 2026). An editable page (a path
      normalizePath() accepts) that renders 200 has its saved edits
      written into it before it is sent: src/lib/server-edits.ts. Asked
      only once a page has rendered 200, so an address that is not a
      page never costs a query or a cache entry. A page with none, a
      database that does not answer, or SERVER_EDITS=0 sends the page
      exactly as rendered, still streaming.

   4. SECURITY HEADERS (28 Oct 2026), on every response that passes
      through here: pages, the 404, redirects, the API, /media and
      /_image. No HSTS and no CSP, by decision. Files the node adapter
      serves straight from dist/client (public/ and /_astro/) never
      reach the middleware, so they go without; nginx in front can add
      the same four if they are wanted there too. The Maps embed on
      /contact is a frame of Google's page inside ours, which
      X-Frame-Options does not touch; the Permissions-Policy only
      switches off camera, microphone and location, which nothing on
      the site asks for. */
import { defineMiddleware } from "astro:middleware";
import { isNoindexDeployment } from "./lib/staging";
import { normalizePath } from "./lib/editable";
import { editsForPage, serverEditsEnabled, withSavedEdits } from "./lib/server-edits";

const UNTOUCHED = /^\/(?:studio|api|_astro|_image|media|video)(?:\/|$)/;
const FILE = /\.[a-z0-9]+\/*$/i;

const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const redirect =
    pathname.length > 1 && pathname.endsWith("/") && !UNTOUCHED.test(pathname) && !FILE.test(pathname);
  const editable = !redirect && context.request.method === "GET" && serverEditsEnabled() ? normalizePath(pathname) : null;
  let response = redirect
    ? new Response(null, {
        status: 301,
        headers: { Location: "/" + pathname.replace(/^\/+/, "").replace(/\/+$/, "") + search },
      })
    : await next();
  if (editable && response.status === 200 && (response.headers.get("content-type") ?? "").includes("text/html")) {
    response = await withSavedEdits(response, editable, editsForPage(editable));
  }
  if (isNoindexDeployment()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
});
