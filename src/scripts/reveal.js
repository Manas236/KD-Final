/* ============================================================
   Scroll reveal
   ------------------------------------------------------------
   Section blocks, cards, tiles and gallery items fade up a little as
   they come into view, once. The look is src/styles/motion.css §2; this
   file decides what moves and when.

   VISIBLE BY DEFAULT. Nothing is hidden by the stylesheet alone: an
   element is hidden only when this script has marked it with
   data-reveal, and it marks only what is below the fold (or above it,
   after a jump down the page) at the moment it runs. Whatever is on
   screen when the page loads is never touched, so there is no flash of
   an empty page, and with no script there is nothing to undo.

   WHAT MOVES. Every band on the site is a <section> holding one
   `max-w-kd` column. Inside it, this walks the column's children:

     · a `grid` (cards, tiles, gallery photographs, stats) gives up its
       items, which come in one after another;
     · a block holding a grid somewhere inside is walked into, so its
       heading and its grid move separately;
     · a block taller than the screen (the legal pages' text) is walked
       into as well, so it does not arrive as one wall;
     · anything else (a kicker, a heading, a paragraph) moves as one.

   Nothing is chosen by name, so a band added later is covered without
   touching this file. The homepage hero's copy (data-hero-in) has its
   own entrance and is skipped, as is anything already carrying a
   transform or an opacity of its own.

   ONCE. Each element is unobserved the moment it starts. When its
   transition is over the attribute is removed again, leaving the
   element exactly as the page built it.

   THE STAGGER is by arrival, not by position in the list: the items
   that come into view together are ordered top to bottom, left to
   right, 70ms apart, and the steps stop growing after five. A gallery
   of a hundred photographs fills as fast as it is scrolled.

   OFF when motion.css is off: no `kd-motion` on <html> (no script,
   /studio, the editor restoring edit mode), reduced motion, or no
   IntersectionObserver. If the editor is switched on later, every
   element still waiting is shown at once, any fade under way is jumped
   to its end, and the observer stops. (A running transition is not
   stopped by its CSS rule ceasing to match: the element's own style is
   already the transition's end value, so the browser lets it run on.)
   ============================================================ */

const root = document.documentElement;
/* Elements whose fade is under way, until settle() lets them go. */
const moving = new Set();

const STEP_MS = 70;
const MAX_STEPS = 5;
/* motion.css: the transition is 560ms. A little over, so the attribute
   is only removed once the element has come to rest. */
const SETTLE_MS = 620;

/* Blocks the walk never descends into or marks. */
const SKIP = "script, style, template, dialog, [hidden], [data-hero-in], [data-nt-ui]";
/* Text runs: never walked into, however tall. */
const LEAF_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "A", "BUTTON", "LABEL", "SPAN", "BLOCKQUOTE"]);

function isGrid(el) {
  return el.classList.contains("grid") && el.children.length > 1;
}

function isTall(el) {
  return (
    !LEAF_TAGS.has(el.tagName) &&
    el.children.length > 1 &&
    el.getBoundingClientRect().height > innerHeight * 0.9
  );
}

/* A target must rest at full opacity with no transform of its own, or
   the reveal would hand it back a different style than it had. */
function movable(el) {
  if (el.matches(SKIP)) return false;
  const style = getComputedStyle(el);
  return style.display !== "contents" && style.opacity === "1" && style.transform === "none";
}

function walk(container, out) {
  for (const child of container.children) {
    if (child.matches(SKIP)) continue;
    if (getComputedStyle(child).display === "contents") {
      walk(child, out);
    } else if (isGrid(child)) {
      for (const item of child.children) if (movable(item)) out.push(item);
    } else if (child.querySelector(".grid") || isTall(child)) {
      walk(child, out);
    } else if (movable(child)) {
      out.push(child);
    }
  }
  return out;
}

function targets() {
  const out = [];
  for (const column of document.querySelectorAll("main section > .max-w-kd")) {
    if (isGrid(column)) {
      for (const item of column.children) if (movable(item)) out.push(item);
    } else {
      walk(column, out);
    }
  }
  return out;
}

function onScreen(el) {
  const r = el.getBoundingClientRect();
  return r.width + r.height > 0 && r.bottom > 0 && r.top < innerHeight;
}

function settle(el) {
  moving.delete(el);
  el.removeAttribute("data-reveal");
  el.style.removeProperty("--kd-reveal-delay");
  if (el.getAttribute("style") === "") el.removeAttribute("style");
}

function start() {
  if (!root.classList.contains("kd-motion")) return;
  if (!("IntersectionObserver" in window)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (root.hasAttribute("data-nt-mode")) return;

  const waiting = new Set(targets().filter((el) => !onScreen(el)));
  if (!waiting.size) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((entry) => entry.isIntersecting && waiting.has(entry.target))
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top ||
            a.boundingClientRect.left - b.boundingClientRect.left,
        );
      arriving.forEach((entry, i) => {
        const el = entry.target;
        observer.unobserve(el);
        waiting.delete(el);
        const delay = Math.min(i, MAX_STEPS) * STEP_MS;
        if (delay) el.style.setProperty("--kd-reveal-delay", `${delay}ms`);
        el.setAttribute("data-reveal", "in");
        moving.add(el);
        setTimeout(() => settle(el), delay + SETTLE_MS);
      });
    },
    /* A block starts once it is a little way up from the bottom edge,
       so the fade is seen rather than finished off screen. */
    { rootMargin: "0px 0px -8% 0px" },
  );

  for (const el of waiting) {
    el.setAttribute("data-reveal", "");
    observer.observe(el);
  }

  /* The editor switched on: everything shows, now, and stays shown. */
  new MutationObserver(() => {
    if (!root.hasAttribute("data-nt-mode")) return;
    observer.disconnect();
    for (const el of moving) {
      for (const fade of el.getAnimations()) fade.finish();
      settle(el);
    }
    for (const el of waiting) settle(el);
    waiting.clear();
  }).observe(root, { attributes: true, attributeFilter: ["data-nt-mode"] });
}

start();
