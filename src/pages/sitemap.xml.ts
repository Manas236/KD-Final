/* ============================================================
   /sitemap.xml — every public page, and every photograph on it
   ------------------------------------------------------------
   Served, not generated. @astrojs/sitemap writes its file from the
   routes it can see at build time, and on this site that was ten of
   twenty pages: every page is `prerender = false` (OPEN-QUESTIONS.md
   #21), so `/projects/[slug]` was a pattern to it, not ten URLs, and
   not one project page was in the sitemap. This endpoint answers the
   same way the pages do — at request time, from the same data modules
   the pages render from — so the list is by construction the set of
   pages that exist.

   Three sources, and nothing is listed by hand:

     1. STATIC PAGES — `import.meta.glob` over src/pages/**\/*.astro.
        The keys are file paths, read without loading a module, and
        each becomes a route the way Astro's router would spell it.
        Dynamic files (`[slug]`) are skipped here and covered below;
        `/studio/*` is the editor's sign-in and is noindex; `/404` is
        the error page and is not a destination.
     2. PROJECT PAGES — one URL per entry in project-detail.ts and one
        per "Beyond the railway" page in social-projects.ts, the same
        `slugify()` the cards and the route use (src/lib/slug.ts).
     3. IMAGES — the hero and every gallery photograph of each project
        page and of the plant page, as `<image:image>` entries, at the
        exact rendition the page puts in its <img src> so the crawler
        finds one URL, not two. Same getImage() call as the components;
        keep the sizes in step with ProjectDetailPage.astro,
        SocialProjectPage.astro, vindhane-plant.astro and
        GalleryGrid.astro. A page with no photograph lists none.

   Origin comes from `site` in astro.config.mjs (PUBLIC_SITE_URL).
   scripts/check-site-url.mjs refuses a release build while that is
   unset, because a sitemap of localhost URLs is worse than none.

   No <lastmod>: nothing here records when a page last changed, and a
   made-up date is a lie the crawler acts on.
   ============================================================ */
import type { APIRoute } from "astro";
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { projectDetails } from "../data/project-detail";
import { getGallery } from "../data/gallery";
import { galleryImage } from "../lib/gallery-images";
import { socialPages } from "../data/social-projects";
import { plant } from "../data/plant";
import plantHero from "../assets/project-vindhane-plant.jpg";
import { rmcPlant } from "../data/rmc-plant";

export const prerender = false;

/* The renditions the pages actually render. [slug].astro and
   vindhane-plant.astro draw the hero at 1551×700; GalleryGrid.astro
   draws every tile at 800×552. */
const HERO = { width: 1551, height: 700 };
const TILE = { width: 800, height: 552 };

const PLANT_ROUTE = "/resources/vindhane-plant";
const RMC_ROUTE = "/resources/rmc-plant-karjat";

interface SitemapImage {
  readonly loc: string;
  readonly title: string;
}

interface SitemapEntry {
  readonly loc: string;
  readonly images: readonly SitemapImage[];
}

/* `./about.astro` → `/about`, `./index.astro` → `/`,
   `./resources/vindhane-plant.astro` → `/resources/vindhane-plant`. */
function routeOf(file: string): string {
  return (
    "/" +
    file
      .replace(/^\.\//, "")
      .replace(/\.astro$/, "")
      .replace(/(^|\/)index$/, "")
  ).replace(/\/+$/, "") || "/";
}

function staticRoutes(): string[] {
  const files = Object.keys(import.meta.glob("./**/*.astro"));
  return files
    .filter((f) => !f.includes("[") && !f.startsWith("./studio/") && f !== "./404.astro")
    .map(routeOf)
    .sort();
}

async function rendition(
  src: ImageMetadata,
  size: { width: number; height: number },
  origin: URL
): Promise<string> {
  const { src: path } = await getImage({ src, ...size });
  return new URL(path, origin).href;
}

async function projectImages(
  title: string,
  hero: ImageMetadata,
  heroAlt: string,
  photos: readonly { file: string; caption: string }[] | undefined,
  origin: URL
): Promise<SitemapImage[]> {
  const out: SitemapImage[] = [{ loc: await rendition(hero, HERO, origin), title: heroAlt }];
  for (const photo of photos ?? []) {
    out.push({
      loc: await rendition(galleryImage(photo.file), TILE, origin),
      title: `${title} — ${photo.caption}`,
    });
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(entries: readonly SitemapEntry[]): string {
  const urls = entries
    .map(({ loc, images }) => {
      const imageXml = images
        .map(
          (img) =>
            `    <image:image>\n` +
            `      <image:loc>${escapeXml(img.loc)}</image:loc>\n` +
            `      <image:title>${escapeXml(img.title)}</image:title>\n` +
            `    </image:image>\n`
        )
        .join("");
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n${imageXml}  </url>\n`;
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls +
    `</urlset>\n`
  );
}

export const GET: APIRoute = async ({ site }) => {
  /* `site` is always set — astro.config.mjs falls back to localhost —
     but the type says it may not be, and a sitemap with no origin is
     not a sitemap. */
  if (!site) return new Response("site is not configured", { status: 500 });

  const entries: SitemapEntry[] = [];

  for (const route of staticRoutes()) {
    const { rmc } = rmcPlant;
    const images =
      route === PLANT_ROUTE
        ? await projectImages(plant.plant.title, plantHero, plant.plant.alt, plant.plant.gallery, site)
        : route === RMC_ROUTE
          ? await projectImages(rmc.title, galleryImage(rmc.file), rmc.alt, rmc.gallery, site)
          : [];
    entries.push({ loc: new URL(route, site).href, images });
  }

  for (const project of projectDetails) {
    entries.push({
      loc: new URL(`/projects/${project.slug}`, site).href,
      images: await projectImages(
        project.title,
        project.image,
        project.alt,
        getGallery(project.title)?.photos,
        site
      ),
    });
  }

  for (const [slug, { detail }] of Object.entries(socialPages)) {
    entries.push({
      loc: new URL(`/projects/${slug}`, site).href,
      images: detail.file
        ? await projectImages(detail.title, galleryImage(detail.file), detail.alt ?? detail.title, detail.gallery, site)
        : [],
    });
  }

  return new Response(render(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
