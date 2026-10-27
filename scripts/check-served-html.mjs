/* ============================================================
   Check: the pages as the server sends them
   ------------------------------------------------------------
   READ-ONLY. Every page is rendered on request (prerender = false
   everywhere), so dist/ holds the server bundle and never a page: a
   `grep` over dist/ says nothing about what a visitor gets, and since
   27 Oct 2026 the HTML also carries Sir's saved edits, written in by the
   server (src/lib/server-edits.ts). So the page checks read the running
   site instead:

     1. every URL in sitemap.xml answers 200, and /404 answers 404;
     2. no em dash (U+2014) anywhere in a page's HTML (text, attributes,
        the head, JSON-LD, inline scripts) or in sitemap.xml, the client's
        rule (CLAUDE.md), EXCEPT inside a saved edit the server wrote:
        the slot marked data-nt-server, its data-nt-* attributes, and a
        <title> or meta tag that follows a saved edit (data-nt-from).
        Sir's saved text is his, em dashes included, so those are
        listed, never failed;
     3. robots.txt is served as text.

   Usage:  node scripts/check-served-html.mjs [origin]
           origin defaults to http://localhost:<PORT from .env>
   Exit status 1 on any FAIL.
   ============================================================ */
import "dotenv/config";
import { parse } from "parse5";

const ORIGIN = (process.argv[2] || `http://localhost:${process.env.PORT || 4322}`).replace(/\/+$/, "");
const DASH = "—";

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log("  FAIL  " + msg);
};

const sitemapRes = await fetch(ORIGIN + "/sitemap.xml");
const sitemap = await sitemapRes.text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (sitemapRes.status !== 200) fail(`sitemap.xml answered ${sitemapRes.status}`);
if (sitemap.includes(DASH)) fail("sitemap.xml has an em dash");
console.log(`sitemap.xml: ${paths.length} URLs`);

function walk(node, visit, inSaved = false) {
  for (const n of node.childNodes ?? []) {
    const saved = inSaved || (n.attrs ?? []).some((a) => a.name === "data-nt-server" || a.name === "data-nt-from");
    visit(n, saved);
    walk(n.content ?? n, visit, saved);
  }
}

let saved = 0;
for (const path of [...paths, "/404"]) {
  const res = await fetch(ORIGIN + path, { redirect: "manual" });
  const want = path === "/404" ? 404 : 200;
  if (res.status !== want) fail(`${path} answered ${res.status}, expected ${want}`);
  const html = await res.text();
  if (!html.includes(DASH)) continue;

  const where = [];
  walk(parse(html), (n, inSaved) => {
    const texts = [];
    if (n.nodeName === "#text") texts.push(["text", n.value]);
    if (n.nodeName === "#comment") texts.push(["comment", n.data]);
    for (const a of n.attrs ?? []) texts.push([`${n.nodeName}[${a.name}]`, a.value]);
    for (const [kind, value] of texts) {
      if (!value.includes(DASH)) continue;
      const fromSaved = inSaved && (kind === "text" || /\[(data-nt-[a-z-]+|content)\]$/.test(kind));
      where.push({ kind, value, fromSaved });
    }
  });
  for (const w of where) {
    const at = w.value.indexOf(DASH);
    const snippet = w.value.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, " ");
    if (w.fromSaved) {
      saved++;
      console.log(`  ok    ${path}: em dash in a saved edit (${w.kind}): "…${snippet}…"`);
    } else {
      fail(`${path}: em dash in ${w.kind}: "…${snippet}…"`);
    }
  }
}

const robots = await fetch(ORIGIN + "/robots.txt");
if (robots.status !== 200 || !(robots.headers.get("content-type") ?? "").startsWith("text/plain")) {
  fail(`robots.txt answered ${robots.status} ${robots.headers.get("content-type")}`);
}

console.log(`\n${paths.length + 1} pages read; ${saved} em dash${saved === 1 ? "" : "es"} inside saved edits (allowed)`);
console.log(failures ? `FAIL  ${failures} problem(s)` : "PASS");
process.exit(failures ? 1 : 0);
