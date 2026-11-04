/* ============================================================
   /studio/launch's numbers: what the switch would take off right now
   ------------------------------------------------------------
   src/lib/launch-report.ts with this site's copy modules and saved
   edits. scripts/pending-report.mjs is the same report on the command
   line, so the count in the confirm dialog is the count it prints.
   ============================================================ */
import { about } from "../data/about";
import { galleryPage } from "../data/gallery-page";
import { home } from "../data/home";
import { privacy, terms } from "../data/legal";
import { notFound } from "../data/not-found";
import { capabilities, careers, clients, company, contact, csr, hse, resources } from "../data/pages";
import { plant } from "../data/plant";
import { projects } from "../data/projects";
import { rmcPlant } from "../data/rmc-plant";
import { socialPages } from "../data/social-projects";
import { projectKept } from "./launch";
import { buildLaunchReport, type LaunchReport } from "./launch-report";
import { editsForPage } from "./server-edits";

const COPY: Record<string, unknown> = {
  home,
  about,
  projects,
  capabilities,
  resources,
  hse,
  clients,
  contact,
  csr,
  company,
  careers,
  plant,
  rmcPlant,
  galleryPage,
  privacy,
  terms,
  notFound,
  socialPages,
};

export interface LaunchSummary extends LaunchReport {
  hidden: number;
  kept: number;
  /** Pages that lose something, the ones that go whole among them. */
  pages: number;
}

export async function launchSummary(): Promise<LaunchSummary> {
  const social = projects.social;
  const report = await buildLaunchReport({
    social,
    pagesOf: (row) =>
      "each" in row
        ? Object.entries(COPY[row.exportName] as Record<string, unknown>).map(([slug, copy]) => ({ route: `${row.route}/${slug}`, copy }))
        : [{ route: row.route, copy: COPY[row.exportName] }],
    savedKeys: async (route) => Object.keys((await editsForPage(route)) ?? {}).map((k) => k.toLowerCase()),
    projectKept: (i) => projectKept(social.items[i].title),
  });
  const hidden = report.rows.filter((r) => r.status === "hidden");
  return {
    ...report,
    hidden: hidden.length,
    kept: report.rows.filter((r) => r.status === "kept").length,
    pages: new Set(hidden.map((r) => r.route)).size,
  };
}
