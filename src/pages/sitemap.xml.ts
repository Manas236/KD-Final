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
import { livePhotos, livePlantPhotos, liveSection, liveState, type LiveState } from "../lib/gallery-live";
import { galleryImage, isUpload, uploadUrls } from "../lib/gallery-images";
import { socialPages } from "../data/social-projects";
import { plant } from "../data/plant";
import plantHero from "../assets/project-vindhane-plant.jpg";
import { rmcPlant } from "../data/rmc-plant";
import { galleryPage } from "../data/gallery-page";
import { hse } from "../data/pages";

export const prerender = false;

/* The renditions the pages actually render. [slug].astro and
   vindhane-plant.astro draw the hero at 1551×700; GalleryGrid.astro
   draws every tile at 800×552. */
const HERO = { width: 1551, height: 700 };
const TILE = { width: 800, height: 552 };

const PLANT_ROUTE = "/resources/vindhane-plant";
const RMC_ROUTE = "/resources/rmc-plant-karjat";
const GALLERY_ROUTE = "/gallery";
const HSE_ROUTE = "/hse";

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

/* A gallery photo's tile URL: the 800×552 rendition, made by Astro for
   a src/assets photo or at upload time for a studio upload. */
async function tileUrl(file: string, origin: URL): Promise<string> {
  return isUpload(file) ? new URL(uploadUrls(file).tile, origin).href : rendition(galleryImage(file), TILE, origin);
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
      loc: await tileUrl(photo.file, origin),
      title: `${title} — ${photo.caption}`,
    });
  }
  return out;
}

/* /gallery: every tile on the page, at the tile rendition — the same
   photographs the project and plant entries list, here under the page
   that shows them all together. */
async function galleryPageImages(origin: URL, live: LiveState): Promise<SitemapImage[]> {
  const out: SitemapImage[] = [];
  for (const section of galleryPage.sections) {
    for (const group of liveSection(live, section.groups)) {
      for (const photo of group.photos) {
        out.push({
          loc: await tileUrl(photo.file, origin),
          title: `${group.project} — ${photo.caption}`,
        });
      }
    }
  }
  return out;
}

/* /hse: the photographs in its record bands, at the rendition
   hse/Record.astro draws (1232×480 for a row-wide lead, else 800×480).
   The looping clips are not images and are not listed. */
async function hseImages(origin: URL): Promise<SitemapImage[]> {
  const out: SitemapImage[] = [];
  for (const band of hse.record.bands) {
    const media = band.media ?? [];
    for (const [i, m] of media.entries()) {
      if (!m.file) continue;
      const wide = media.length % 2 === 1 && i === 0;
      out.push({
        loc: await rendition(galleryImage(m.file), wide ? { width: 1232, height: 480 } : { width: 800, height: 480 }, origin),
        title: `${hse.hero.kicker} — ${m.title}`,
      });
    }
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
  /* Photographs as the site shows them now, studio changes included —
     a photograph taken off the site must not stay in the sitemap. */
  const live = await liveState();

  for (const route of staticRoutes()) {
    const { rmc } = rmcPlant;
    const images =
      route === PLANT_ROUTE
        ? await projectImages(plant.plant.title, plantHero, plant.plant.alt, livePlantPhotos(live, PLANT_ROUTE), site)
        : route === RMC_ROUTE
          ? await projectImages(rmc.title, galleryImage(rmc.file), rmc.alt, livePlantPhotos(live, RMC_ROUTE), site)
          : route === GALLERY_ROUTE
            ? await galleryPageImages(site, live)
            : route === HSE_ROUTE
              ? await hseImages(site)
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
        livePhotos(live, project.title),
        site
      ),
    });
  }

  for (const [slug, { detail }] of Object.entries(socialPages)) {
    entries.push({
      loc: new URL(`/projects/${slug}`, site).href,
      images: detail.file
        ? await projectImages(detail.title, galleryImage(detail.file), detail.alt ?? detail.title, livePhotos(live, detail.title), site)
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
