/* Staging: keep a test deployment out of every search index.
   See src/lib/staging.ts. A no-op unless SITE_NOINDEX=1. */
import { defineMiddleware } from "astro:middleware";
import { isNoindexDeployment } from "./lib/staging";

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (isNoindexDeployment()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
});
