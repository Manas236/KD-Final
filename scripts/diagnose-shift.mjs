/* ============================================================
   Diagnostic — is the residual layout shift the fonts?
   ------------------------------------------------------------
   A control experiment, kept because it is the only thing that answers
   the question cleanly.

     A  normal load, throttled to Slow 3G with an empty cache.
     B  the same, with both real woff2 families blocked outright, so the
        page renders in the metric-matched fallback and NO SWAP CAN
        HAPPEN. If B is zero and A is not, every bit of A's shift is the
        swap; if the two match, the cause is somewhere else entirely.

   Result as of this build, against the production server:

     A  CLS 0.0082   h1 233 -> 233   body 4797
     B  CLS 0.0000   h1 233 -> 233   body 4719

   So the hero H1 does NOT move — fixed line heights plus the
   metric-matched fallback hold it exactly — and the residual is a
   78px difference in total page height, some run of body copy taking a
   different number of lines under Arial-scaled-to-Inter than under
   Inter itself. One global size-adjust per family cannot be exact for
   every string.

   Run it against the PRODUCTION server, not `astro dev`: the dev server
   injects stylesheets through JS, so the first paint is unstyled and
   the measurement picks up a shift that no visitor will ever see. Dev
   measured 0.0175 for that reason alone.

   Usage:  node scripts/diagnose-shift.mjs [origin]
   ============================================================ */
import { chromium } from "playwright";

const ORIGIN = process.argv[2] || "http://127.0.0.1:4323";
const INSTRUMENT = `
  window.__cls = 0; window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__cls += e.value;
      window.__shifts.push({ v: e.value, s: (e.sources||[]).map(x => x.node ? (x.node.nodeName||'')+'.'+((x.node.className||'')+'').slice(0,50) : '?') });
    }
  }).observe({ type: "layout-shift", buffered: true });
`;

async function launch() {
  try { return await chromium.launch({ channel: "chrome" }); }
  catch { return await chromium.launch(); }
}

async function run(browser, label, blockFonts) {
  const ctx = await browser.newContext({ viewport: { width: 1551, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(INSTRUMENT);
  if (blockFonts) {
    await page.route("**/*.woff2", (r) => r.abort());
  }
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.clearBrowserCache");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false, downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8, latency: 400,
  });

  // Watch the hero H1 geometry across the load.
  await page.goto(ORIGIN + "/", { waitUntil: "load", timeout: 120000 });
  const early = await page.evaluate(() => {
    const h = document.querySelector("h1");
    const r = h.getBoundingClientRect();
    return { h1: Math.round(r.height), h1top: Math.round(r.top) };
  });
  await page.waitForTimeout(5000);
  const out = await page.evaluate(() => {
    const h = document.querySelector("h1");
    const r = h.getBoundingClientRect();
    return {
      cls: window.__cls, shifts: window.__shifts,
      h1: Math.round(r.height), h1top: Math.round(r.top),
      body: Math.round(document.body.scrollHeight),
    };
  });
  console.log(`\n  ${label}`);
  console.log(`    CLS ${out.cls.toFixed(4)}   h1 height ${early.h1} -> ${out.h1}   body ${out.body}`);
  for (const s of out.shifts) console.log(`      ${s.v.toFixed(5)}  ${s.s.join(" | ")}`);
  if (!out.shifts.length) console.log("      (none)");
  await ctx.close();
  return out.cls;
}

const browser = await launch();
await run(browser, "A — normal load", false);
await run(browser, "B — real fonts blocked, fallback only, no swap possible", true);
await browser.close();
