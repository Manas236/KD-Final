/* Every request passes through here, for two things.

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
      src/lib/staging.ts. A no-op unless SITE_NOINDEX=1. */
import { defineMiddleware } from "astro:middleware";
import { isNoindexDeployment } from "./lib/staging";

const UNTOUCHED = /^\/(?:studio|api|_astro|_image|media|video)(?:\/|$)/;
const FILE = /\.[a-z0-9]+\/*$/i;

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const response =
    pathname.length > 1 && pathname.endsWith("/") && !UNTOUCHED.test(pathname) && !FILE.test(pathname)
      ? new Response(null, {
          status: 301,
          headers: { Location: "/" + pathname.replace(/^\/+/, "").replace(/\/+$/, "") + search },
        })
      : await next();
  if (isNoindexDeployment()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
});
