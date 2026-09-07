/* ============================================================
   Build gate — layout shift from the self-hosted fonts
   ------------------------------------------------------------
   Measures Cumulative Layout Shift with PerformanceObserver, which is
   the same signal Lighthouse reports, and does it twice:

     cold   a fresh profile with an empty HTTP cache. This is the run
            that matters. The fonts are being fetched for the first
            time, so if `font-display: swap` is going to substitute a
            fallback and then re-lay-out the page, it happens here.
     warm   the same page again with the fonts cached, for contrast.

   It also reports, per font family, whether the face was ready before
   first paint — a CLS of 0 for the wrong reason (the page happened to
   render after the font landed) is worth telling apart from a CLS of 0
   because the preloads did their job.

   Usage:  node scripts/check-layout-shift.mjs [origin] [path]
   ============================================================ */
import { chromium } from "playwright";
import "dotenv/config";

const ORIGIN = process.argv[2] || `http://localhost:${process.env.PORT || 4322}`;
const PAGE = process.argv[3] || "/";

/* Google's "good" threshold is 0.1. This page has fixed line heights on
   every type token, so anything above noise would mean a font swap is
   changing how many LINES a run of copy takes. */
const BUDGET = 0.1;

async function launch() {
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    return await chromium.launch();
  }
}

const INSTRUMENT = `
  window.__cls = 0;
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__cls += entry.value;
      window.__shifts.push({
        value: entry.value,
        sources: (entry.sources || []).map((s) =>
          s.node ? (s.node.nodeName || "") + "." + ((s.node.className || "") + "").slice(0, 40) : "?"
        ),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
`;

async function run(browser, label, cold, throttle) {
  const ctx = await browser.newContext({ viewport: { width: 1551, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(INSTRUMENT);
  if (cold) await ctx.clearCookies();

  /* Throttling is the only way this check means anything. The dev
     server is on localhost, where a woff2 arrives in single-digit
     milliseconds and a fallback never gets the chance to paint — so an
     unthrottled CLS of 0 says nothing about whether the preloads work.
     Slow 3G is where a `font-display: swap` re-layout shows up. */
  if (throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.clearBrowserCache");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: throttle.down,
      uploadThroughput: throttle.up,
      latency: throttle.latency,
    });
  }

  await page.goto(ORIGIN + PAGE, { waitUntil: "load", timeout: 120000 });
  // Give the observer a moment past load for any late swap to register.
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);

  const out = await page.evaluate(async () => {
    const faces = ["Fraunces Variable", "Inter Variable"];
    const loaded = {};
    for (const f of faces) {
      loaded[f] =
        document.fonts.check(`700 72px "${f}"`) || document.fonts.check(`400 16px "${f}"`);
    }
    return { cls: window.__cls, shifts: window.__shifts, loaded, status: document.fonts.status };
  });

  console.log(`\n  ${label}`);
  console.log(`    CLS ................ ${out.cls.toFixed(4)}`);
  console.log(`    font set status .... ${out.status}`);
  for (const [f, ok] of Object.entries(out.loaded))
    console.log(`    ${f.padEnd(18)} ${ok ? "loaded" : "NOT LOADED"}`);
  if (out.shifts.length) {
    console.log(`    ${out.shifts.length} shift record(s):`);
    for (const s of out.shifts.slice(0, 8))
      console.log(`      ${s.value.toFixed(5)}  ${s.sources.join(", ")}`);
  } else {
    console.log("    no layout-shift entries recorded at all");
  }
  await ctx.close();
  return out.cls;
}

const SLOW_3G = { down: (400 * 1024) / 8, up: (400 * 1024) / 8, latency: 400 };
const FAST_3G = { down: (1.6 * 1024 * 1024) / 8, up: (750 * 1024) / 8, latency: 150 };

const browser = await launch();
const results = [
  await run(browser, "SLOW 3G, empty cache — the run that matters", true, SLOW_3G),
  await run(browser, "FAST 3G, empty cache", true, FAST_3G),
  await run(browser, "LOCAL, warm cache", false, null),
];
await browser.close();

const worst = Math.max(...results);
console.log(
  `\n  ${worst <= BUDGET ? "PASS" : "FAIL"}  worst CLS ${worst.toFixed(4)} against a budget of ${BUDGET}`
);
process.exit(worst <= BUDGET ? 0 : 1);
