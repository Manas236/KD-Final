/* Every request the app answers passes through here, for five things.

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
      exactly as rendered, still streaming. A page rendered in launch mode
      (src/lib/launch.ts) reads its edits while it renders, and those same
      rows are written here.

   4. SECURITY HEADERS (28 Oct 2026), on every response that passes
      through here: pages, the 404, redirects, the API, /media and
      /_image. No HSTS and no CSP, by decision. Files the node adapter
      serves straight from dist/client (public/ and /_astro/) never
      reach the middleware, so they go without; nginx in front can add
      the same four if they are wanted there too. The Maps embed on
      /contact is a frame of Google's page inside ours, which
      X-Frame-Options does not touch; the Permissions-Policy only
      switches off camera, microphone and location, which nothing on
      the site asks for.

   5. WHO IS ASKING, for launch mode (4 Nov 2026). A page request with a
      valid editor session is told so here, before the page renders: an
      editor sees everything, or previews the public's view, and gets the
      tools for that added to the finished page
      (src/lib/launch-editor.ts). Anyone else is not touched at all. */
import { defineMiddleware } from "astro:middleware";
import { isNoindexDeployment } from "./lib/staging";
import { normalizePath } from "./lib/editable";
import { editorView, forEditor } from "./lib/launch-editor";
import { editsForPage, serverEditsEnabled, withSavedEdits } from "./lib/server-edits";
/* Loaded here, on the first request after a restart, for its side effect:
   it starts listening for each connection's own address, which the write
   routes need to tell nginx from anyone else (src/lib/client-ip.ts). */
import "./lib/client-ip";

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
  const view =
    !redirect && context.request.method === "GET" && !UNTOUCHED.test(pathname) && !FILE.test(pathname)
      ? await editorView(context.request)
      : undefined;
  if (view) context.locals.kdLaunchView = view;
  let response = redirect
    ? new Response(null, {
        status: 301,
        headers: { Location: "/" + pathname.replace(/^\/+/, "").replace(/\/+$/, "") + search },
      })
    : await next();
  if (editable && response.status === 200 && (response.headers.get("content-type") ?? "").includes("text/html")) {
    /* In launch mode the page has already read its edits, to know which
       placeholders were answered (src/lib/launch.ts): write those rows. */
    response = await withSavedEdits(response, editable, context.locals.kdSavedEdits ?? editsForPage(editable));
  }
  if (view) response = await forEditor(response, view);
  if (isNoindexDeployment()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
});
