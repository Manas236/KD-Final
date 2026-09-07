/* ============================================================
   Editor round-trip probe — Phase 4 gate
   ------------------------------------------------------------
   Drives a real browser through the whole feature, because every part
   of it that can go wrong goes wrong in the browser: the sign-in
   cookies, the dynamic import gated on the hint cookie, the gesture
   model, the optimistic write, the POST, and the repaint from the
   server's answer on the NEXT load.

   Nesting Tree's version of this was never run. The keying was found
   to be broken after 350 rows had accumulated, and 86 of them were
   already inert. This runs against an empty table, which is the only
   time the key format is free to change.

   Usage:  node scripts/probe-editor.mjs [origin] [path]
   ============================================================ */
import { chromium } from "playwright";
import fs from "node:fs";
import "dotenv/config";

const ORIGIN = process.argv[2] || `http://localhost:${process.env.PORT || 4322}`;
const PAGE = process.argv[3] || "/probe";

const SLUG = process.env.EDIT_LOGIN_SLUG;
const PASS = process.env.EDIT_PASSPHRASE;
if (!SLUG || !PASS) {
  console.error("EDIT_LOGIN_SLUG and EDIT_PASSPHRASE must be set in .env");
  process.exit(1);
}

/* The two slots to exercise, and what to type into each. Overridable so
   the same script can be pointed at the real homepage in Phase 7. */
const TARGETS = JSON.parse(
  process.env.PROBE_TARGETS ||
    '[["probe.one.heading","EDITED heading one"],["probe.two.paragraph","EDITED paragraph two."]]'
);

let failures = 0;
const check = (ok, label, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "  PASS  " : "  FAIL  "}${label}${detail ? " — " + detail : ""}`);
};

/* Prefer the Chrome already on this machine over Playwright's own
   download: the bundled build is a 150 MB fetch for a check that wants a
   browser, not a specific one. Falls back if there is no system Chrome. */
async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1551, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("  [page error] " + e.message));

try {
  /* ---------- 1. sign in ---------- */
  await page.goto(`${ORIGIN}/studio/${SLUG}`, { waitUntil: "domcontentloaded" });
  await page.fill("#pass", PASS);
  await page.click("#go");
  await page.waitForURL(`${ORIGIN}/`, { timeout: 15000 });

  const cookies = await ctx.cookies();
  const names = cookies.map((c) => c.name);
  check(names.includes("kd_edit"), "signed in: kd_edit cookie set");
  check(names.includes("kd_edit_ui"), "signed in: kd_edit_ui hint cookie set");

  /* A wrong slug must be indistinguishable from a path that was never a
     route. Checked here because it is the one security property of this
     page that a refactor could quietly remove. */
  const wrong = await page.request.get(`${ORIGIN}/studio/definitely-not-the-slug`);
  check(wrong.status() === 404, "wrong slug is a plain 404", `got ${wrong.status()}`);

  /* ---------- 2. edit both slots ---------- */
  await page.goto(ORIGIN + PAGE, { waitUntil: "networkidle" });

  // The editor is a dynamic import gated on the hint cookie.
  await page.waitForSelector(".nt-bar .nt-pill-mode", { timeout: 15000 });
  check(true, "editor bundle loaded for a signed-in browser");

  await page.click(".nt-pill-mode"); // "Edit text"
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-nt-mode"));

  for (const [key, text] of TARGETS) {
    const sel = `[data-edit="${key}"]`;
    const el = page.locator(sel);
    check((await el.count()) === 1, `slot present: ${key}`);
    check(
      await el.evaluate((n) => n.hasAttribute("data-nt-editable")),
      `slot marked editable: ${key}`
    );

    await el.click();
    await page.waitForFunction(
      (s) => document.querySelector(s)?.hasAttribute("data-nt-editing"),
      sel
    );
    await page.keyboard.press("Control+A");
    await page.keyboard.type(text);
    await page.keyboard.press("Enter");
    // Let the POST settle before moving to the next one.
    await page.waitForFunction(
      (a) => document.querySelector(a[0])?.textContent.trim() === a[1],
      [sel, text],
      { timeout: 10000 }
    );
  }
  check(true, "both slots edited and committed");

  /* ---------- 3. the rows are actually in the database ---------- */
  const api = await page.request.get(
    `${ORIGIN}/api/content?path=${encodeURIComponent(PAGE)}`
  );
  const body = await api.json();
  for (const [key, text] of TARGETS) {
    check(
      body.edits?.[key]?.text === text,
      `stored under the declared key: ${key}`,
      body.edits?.[key] ? `got "${body.edits[key].text}"` : "no row"
    );
  }
  check(
    Object.keys(body.edits || {}).every((k) => !k.includes("nth-of-type")),
    "no positional keys were written"
  );

  /* ---------- 4. reload in a CLEAN browser and see it repaint ----------
     A fresh context has no localStorage and no cookies, so this is what
     a member of the public sees. On Nesting Tree this was the case that
     failed silently for weeks: the edit was visible to its author and
     to nobody else. */
  const anon = await browser.newContext({ viewport: { width: 1551, height: 900 } });
  const anonPage = await anon.newPage();
  await anonPage.goto(ORIGIN + PAGE, { waitUntil: "networkidle" });
  for (const [key, text] of TARGETS) {
    const got = (await anonPage.locator(`[data-edit="${key}"]`).textContent())?.trim();
    check(got === text, `repaints for a signed-out visitor: ${key}`, `got "${got}"`);
  }
  const hasBar = await anonPage.locator(".nt-bar").count();
  check(hasBar === 0, "no editor furniture for a signed-out visitor");
  await anon.close();

  /* ---------- 5. and repaints for the editor too ---------- */
  await page.reload({ waitUntil: "networkidle" });
  for (const [key, text] of TARGETS) {
    const got = (await page.locator(`[data-edit="${key}"]`).textContent())?.trim();
    check(got === text, `persists across reload: ${key}`, `got "${got}"`);
  }
} catch (err) {
  failures++;
  console.log("  FAIL  threw: " + err.message);
} finally {
  await browser.close();
}

console.log(failures ? `\n${failures} FAILURE(S)` : "\nAll editor round-trip checks passed.");
process.exit(failures ? 1 : 0);
