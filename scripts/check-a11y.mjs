/* ============================================================
   Check: automated accessibility scan, every page
   ------------------------------------------------------------
   READ-ONLY. Runs axe-core (the engine behind Lighthouse's and the
   browser extensions' accessibility audits) in a real browser on every
   URL in sitemap.xml and on the 404, at two widths: 1280, where the bar
   carries the About and Projects menus, and 390, where they fold into
   the drawer behind the menu button.

   Rules: WCAG 2.0, 2.1 and 2.2 at A and AA, plus axe's best-practice
   set (landmarks, one <h1>, unique ids and the like).

   COLOUR CONTRAST IS REPORTED, NEVER FAILED. The colours are the
   client-approved design (DESIGN-SYSTEM.md §0), so a contrast finding is
   a question for the client, not a fix for this script's user: it is
   listed under "Report only" with the two colours and the ratio, and
   does not set the exit status. Every other finding is a FAIL.

   Reduced motion, so a block still waiting for its scroll reveal
   (src/scripts/reveal.js) is never read at opacity 0.

   The pages are read at rest: menus, the phone drawer and the dialogs
   shut. On 29 Oct 2026 the same rules also passed with the drawer open,
   a bar menu open, the Lightbox and the certificate viewer open, and
   with motion on, but those states are not part of this script.

   Usage:  npm run check:a11y -- [origin]
           node scripts/check-a11y.mjs [origin]
           origin defaults to http://localhost:<PORT from .env>
   Exit status 1 on any finding other than colour contrast.
   ============================================================ */
import "dotenv/config";
import { chromium } from "playwright";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AXE = require.resolve("axe-core/axe.min.js");

const ORIGIN = (process.argv[2] || `http://localhost:${process.env.PORT || 4322}`).replace(/\/+$/, "");
const WIDTHS = [1280, 390];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const REPORT_ONLY = new Set(["color-contrast", "color-contrast-enhanced"]);

const sitemap = await (await fetch(ORIGIN + "/sitemap.xml")).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
paths.push("/404");

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

/* rule id -> { help, impact, report, hits: Map<"path@width", targets[]> } */
const rules = new Map();
const browser = await launch();
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  for (const path of paths) {
    const page = await context.newPage();
    await page.goto(ORIGIN + path, { waitUntil: "networkidle" });
    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(
      (tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags } }).then((r) => r.violations),
      TAGS,
    );
    for (const v of violations) {
      const rule = rules.get(v.id) ?? { help: v.help, impact: v.impact, report: REPORT_ONLY.has(v.id), hits: new Map() };
      rule.hits.set(
        `${path} @${width}`,
        v.nodes.map((n) => {
          const target = n.target.join(" ");
          const data = n.any.concat(n.all, n.none).find((c) => c.data && c.data.contrastRatio)?.data;
          return data ? `${target}  (${data.fgColor} on ${data.bgColor}, ${data.contrastRatio}:1, needs ${data.expectedContrastRatio})` : target;
        }),
      );
      rules.set(v.id, rule);
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

let failures = 0;
const print = (heading, list) => {
  console.log(`\n${heading}`);
  if (!list.length) console.log("  none");
  for (const [id, rule] of list) {
    console.log(`  ${rule.report ? "note" : "FAIL"}  ${id} (${rule.impact}): ${rule.help}`);
    for (const [where, targets] of rule.hits) {
      console.log(`        ${where}`);
      for (const t of targets.slice(0, 8)) console.log(`          ${t}`);
      if (targets.length > 8) console.log(`          … and ${targets.length - 8} more`);
    }
  }
};
const found = [...rules].sort(([a], [b]) => a.localeCompare(b));
const failing = found.filter(([, r]) => !r.report);
failures = failing.length;
print("Findings", failing);
print("Report only (colour contrast: the approved colours, not changed here)", found.filter(([, r]) => r.report));

console.log(`\n${paths.length} pages at ${WIDTHS.join(" and ")}px`);
console.log(failures ? `FAIL  ${failures} rule(s) with findings` : "PASS");
process.exit(failures ? 1 : 0);
