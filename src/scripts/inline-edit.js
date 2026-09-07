/* ============================================================
   PORTED FROM NESTING TREE — src/scripts/inline-edit.js
   ------------------------------------------------------------
   FROZEN except where noted. Do not refactor, rename or tidy.

   Changed on the way across:
     · UI_COOKIE  nt_edit_ui   -> kd_edit_ui
     · MODE_KEY   nt-edit-mode -> kd-edit-mode
     · markElements() now reads declared `data-edit` slots instead of
       sweeping the document for text leaves. See the note there.

   Everything else — the gesture model, the optimistic save, the
   version menu, endSession, the toast — is the original, including the
   comments, which explain decisions this repo has not had to make yet.

   The `nt` prefix on the internal attributes, classes and the
   window.__ntEdit namespace is left alone on purpose: renaming it would
   be exactly the tidy-up the port is supposed to avoid, and it touches
   every one of the files that must not drift apart.
   ============================================================ */
/* ============================================================
   In-page text editing — the editor
   ------------------------------------------------------------
   Part 2 of 2. The early-boot half lives inline in the head of
   BaseLayout.astro and hangs window.__ntEdit: the page path, the
   edit_key walk, text normalisation, and the localStorage cache. This
   file calls back into those rather than reimplementing them, because
   a key generated on the way in must match a key generated on the way
   out, exactly, forever.

   The rules about WHAT may be edited come from src/lib/editable.ts —
   the same module the API routes import, so the browser never offers an
   edit the server is going to refuse.

   Shape of the thing:

     · every leaf that holds one run of words becomes editable, and a
       run that shares its parent with a <br>, an icon or a <strong> is
       given a leaf of its own so that it can be one too
     · nothing is locked by what it says — the figure denylist was
       removed on 13 Aug 2026 at the owner's request. The only copy the
       editor still leaves alone is what an author opted out by hand
       with data-no-edit.
     · none of this exists for a visitor. BaseLayout only imports this
       file when the `nt_edit_ui` hint cookie is set, and the check is
       repeated at the top of this file for the case the import happens
       anyway — a cached bundle, a hand-typed import. It is a hint, not
       authorisation: the token cookie the write routes check is what
       actually decides anything (src/lib/edit-auth.ts).
     · none of it is live until "Edit text" is pressed; with the mode on,
       one click enters an element and no link navigates
     · one element is editable at a time, and only while it has focus
     · saving is optimistic: the text changes, then the POST goes; a
       rejection puts the old text back and says why
     · nothing is ever destroyed — a revert writes a new row

   No framework, no build-time dependency beyond the shared rules.
   ============================================================ */
import { MAX_TEXT } from "../lib/editable";

const NT = window.__ntEdit;

/** How long a press has to last to count as deliberate. */
const HOLD_MS = 500;
/** Move further than this and it was a scroll, not a press. */
const MOVE_CANCEL_PX = 10;
/** Versions offered in the per-element menu. */
const MENU_VERSIONS = 5;
const TOAST_MS = 4200;

/** Where the mode is remembered. sessionStorage, not localStorage: this
    is a static multi-page site, so edit mode has to survive a navigation
    or you would switch it back on for every page — but it should not
    outlive the tab. */
const MODE_KEY = "kd-edit-mode";

/** The sign-in hint BaseLayout gates the import on. See the note above. */
const UI_COOKIE = "kd_edit_ui";

function hasUiCookie() {
  return document.cookie.split("; ").some((c) => c === `${UI_COOKIE}=1`);
}

const state = {
  /** key -> { text, original, id } for this page. */
  edits: {},
  /** The one element currently open for editing. */
  active: null,
  /** Its text when we entered, for the failure path. */
  before: "",
  menu: null,
  /** Editing is off until someone asks for it. See the note on gestures. */
  editing: false,
  /** The toolbar and the mode button, so they can be relabelled and removed. */
  bar: null,
  toggle: null,
  holdTimer: 0,
  holdFrom: null,
};

/* ============================================================
   Boot
   ============================================================ */
/* The cookie check is a second lock on the same door BaseLayout already
   shut, and it is here for the case where this module is evaluated
   anyway: a bundle still in the browser cache from before signing out,
   or somebody importing the chunk by hand. Cheap, and it means signing
   out takes the toolbar off the page on the next navigation rather than
   leaving furniture that no longer works. */
if (NT && hasUiCookie()) boot();

async function boot() {
  // NT.applied, not NT.ready: the head script applies the server's answer
  // for every visitor, so by the time this resolves the page already says
  // what the database says. The editor only needs the same map to edit
  // against. Awaiting `ready` here and applying it a second time is how
  // this used to work, and it made the editor the only thing that ever
  // painted an edit — see the note in BaseLayout.astro.
  const data = await NT.applied;

  // Copy that shares its parent with a <br>, an icon or a <strong> gets
  // a wrapper of its own first, so that everything below — applying,
  // marking, keying — sees one settled shape of the document. The head
  // script has normally done this already; this is the offline path,
  // where nothing else would have asked.
  NT.ensureWrapped();

  // Offline, or the database is down: keep whatever the cache pass put on
  // screen rather than editing against an empty map.
  state.edits = data && data.edits ? data.edits : NT.readCache();

  markElements();
  installGestures();
  buildToolbar();
}

/* ============================================================
   Deciding what may be edited
   ------------------------------------------------------------
   One pass over the document. Elements are marked with attributes and
   every gesture is delegated off document, so nothing here scales with
   how long the page is.
   ============================================================ */
function markElements() {
  /* DECLARED SLOTS. Nesting Tree swept every element in the document and
     decided for itself which ones held copy; here the author has already
     said, node by node, by writing a data-edit key. So this is a lookup,
     not an inference, and a run of text without a key is not editable
     BY DESIGN rather than by accident — which is what makes "every text
     node has a key" a thing the build can check.

     The two guards that survive the change:

       optOut  — the editor's own furniture and anything opted out by
                 hand, so the toolbar cannot be typed into.
       isTextLeaf — a key on an element holding anything other than one
                 run of text is an authoring error, and marking it would
                 delete that element's children the moment textContent
                 was assigned. Refusing to mark it is the safe half; the
                 build gate in scripts/check-edit-keys.mjs is the half
                 that says so out loud. */
  const all = document.body.querySelectorAll("[data-edit]");

  for (const el of all) {
    if (el.closest(NT.optOut)) continue;
    if (!NT.isTextLeaf(el)) continue;

    const text = NT.textOf(el);
    if (!text) continue;

    el.setAttribute("data-nt-editable", "");
  }
}

/** The stored key wins: an edit that was re-homed by the fallback scan
    keeps talking to its own row rather than opening a second one. */
function keyOf(el) {
  return el.dataset.ntKey || NT.keyFor(el);
}

/** The text the page shipped with — the anchor every row is filed under. */
function anchorOf(el, fallback) {
  return el.dataset.ntOriginal || fallback;
}

function editableFrom(target) {
  if (!target || !target.closest) return null;
  const el = target.closest("[data-nt-editable]");
  return el && !el.closest("[data-nt-ui]") ? el : null;
}

/* ============================================================
   Gestures
   ------------------------------------------------------------
   Everything here is off until someone presses "Edit text".

   That switch is the whole design. Before it existed, the editor had to
   infer intent from the gesture alone, and the only gestures available
   were the two the browser had already spoken for: double-click, which
   is how you select a word, and long-press, which is how you select
   text on a phone. So a reader could fall into editing, and — worse —
   copy inside a link could not reliably be reached at all. The first
   click of a double-click follows the href before the second one
   arrives, and holding an anchor starts the browser's own link drag,
   which cancels the hold. Every CTA on this site is an anchor.

   With an explicit mode, intent is stated once and the gestures stop
   competing:

     off   nothing is bound. Reading is reading; links are links.
     on    one click enters an element. A capture-phase handler calls
           preventDefault on every click first, so an anchor stays put
           instead of navigating.
     both  a right-click (desktop) or a ~500 ms hold (touch) on an
           element that has been edited opens its version list.

   The click rule is narrower than "swallow everything", and the
   difference matters. A click is only intercepted when it lands on
   something editable; anything else is left completely alone. So while
   the mode is on you can still work the page — open the mobile menu,
   drive a carousel, open a lightbox — and reach the copy you actually
   want to change, while the copy itself stops behaving like a control.

   That distinction is what makes the site's own click handlers safe.
   Several of them would otherwise fight the editor:

     · every .mobile-link closes the mobile menu (SiteHeader), so
       clicking a nav link to edit it would shut the panel first
     · "View all N photos" opens the lightbox (gallery.astro)
     · the project rails and dots move the carousel

   All three hang off text that is itself editable, and all three are
   suppressed by stopPropagation here — while the menu toggle, the
   gallery tiles and the arrows, none of which are editable, keep
   working normally.
   ============================================================ */
function installGestures() {
  // Capture phase: this has to beat both the browser's own click
  // handling and every listener the page has of its own.
  document.addEventListener(
    "click",
    (e) => {
      if (!state.editing) return;
      if (e.target.closest && e.target.closest("[data-nt-ui]")) return;

      const el = editableFrom(e.target);
      // Not editable: leave it entirely alone, so the page still works.
      // A click out here also commits whatever was open, which the
      // focusout handler below has normally done already.
      if (!el) return;

      // No href is followed, no menu closes, no lightbox opens. Caret
      // placement is unaffected: that happens on pointerdown, not click.
      e.preventDefault();
      e.stopPropagation();
      enter(el);
    },
    true
  );

  /* The version list. Touch has no right-click, so it keeps the hold —
     but only ever to open history, never to enter an element, so it no
     longer races anything. */
  document.addEventListener(
    "pointerdown",
    (e) => {
      clearHold();
      if (!state.editing || e.button > 0) return;
      const el = editableFrom(e.target);
      if (!el || !el.hasAttribute("data-nt-edited")) return;

      state.holdFrom = { x: e.clientX, y: e.clientY };
      state.holdTimer = window.setTimeout(() => {
        state.holdTimer = 0;
        openVersions(el);
      }, HOLD_MS);
    },
    { passive: true }
  );

  document.addEventListener(
    "pointermove",
    (e) => {
      if (!state.holdTimer || !state.holdFrom) return;
      if (
        Math.abs(e.clientX - state.holdFrom.x) > MOVE_CANCEL_PX ||
        Math.abs(e.clientY - state.holdFrom.y) > MOVE_CANCEL_PX
      ) {
        clearHold(); // that was a scroll
      }
    },
    { passive: true }
  );

  for (const type of ["pointerup", "pointercancel", "wheel", "scroll"]) {
    document.addEventListener(type, clearHold, { passive: true, capture: true });
  }

  document.addEventListener("contextmenu", (e) => {
    if (!state.editing) return; // leave the browser menu alone
    const el = editableFrom(e.target);
    if (!el || !el.hasAttribute("data-nt-edited")) return;
    e.preventDefault();
    openVersions(el);
  });

  document.addEventListener("focusout", (e) => {
    if (state.active && e.target === state.active) exit(true);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.menu) {
      closeMenu();
      return;
    }
    // Escape with nothing open is the way out of the mode itself.
    if (e.key === "Escape" && !state.active && state.editing) {
      setMode(false);
      return;
    }
    if (!state.active) return;
    if (e.key === "Enter") {
      e.preventDefault(); // one run of text, so Enter means "done"
      exit(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      exit(false);
    }
  });

  // Paste arrives as plain text or not at all.
  document.addEventListener("paste", (e) => {
    const el = state.active;
    if (!el || !(el === e.target || el.contains(e.target))) return;
    e.preventDefault();
    const raw = (e.clipboardData || window.clipboardData).getData("text/plain");
    insertPlain(NT.normalize(raw));
  });

  document.addEventListener("scroll", closeMenu, { passive: true });
}

function clearHold() {
  if (state.holdTimer) clearTimeout(state.holdTimer);
  state.holdTimer = 0;
  state.holdFrom = null;
}

function insertPlain(text) {
  if (!text) return;
  // execCommand is deprecated but is still the only insertion that
  // lands on the browser's own undo stack.
  if (document.execCommand && document.execCommand("insertText", false, text))
    return;

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

/* ============================================================
   Entering and leaving an element
   ============================================================ */
function enter(el) {
  if (state.active === el) return;
  exit(true); // only ever one at a time
  closeMenu();

  state.active = el;
  state.before = NT.textOf(el);
  // First edit of an untouched element: what it says now is the anchor.
  if (!el.dataset.ntOriginal) el.dataset.ntOriginal = state.before;

  // plaintext-only also blocks Ctrl+B and rich drops; not every engine
  // takes it, and an unsupported value throws rather than falling back.
  try {
    el.contentEditable = "plaintext-only";
  } catch (err) {
    el.contentEditable = "true";
  }
  if (!el.isContentEditable) el.contentEditable = "true";

  el.spellcheck = false;
  el.setAttribute("data-nt-editing", "");
  el.focus({ preventScroll: true });
}

function exit(commit) {
  const el = state.active;
  if (!el) return;

  state.active = null;
  el.contentEditable = "false";
  el.removeAttribute("data-nt-editing");
  if (document.activeElement === el) el.blur();

  const before = state.before;
  const after = NT.normalize(el.textContent);

  // Cancelled, emptied, or untouched: put it back the way it was. This
  // also collapses anything contentEditable did to the whitespace.
  if (!commit || !after || after === before) {
    NT.setText(el, before);
    return;
  }
  saveEdit(el, before, after);
}

/* ============================================================
   Saving — optimistic, then reconciled
   ============================================================ */
function saveEdit(el, before, after) {
  const key = keyOf(el);
  if (!key) return;
  const anchor = anchorOf(el, before);

  // The same rule the server is about to apply, so an obvious refusal
  // costs no round trip.
  if (after.length > MAX_TEXT) {
    NT.setText(el, before);
    toast(`Keep it under ${MAX_TEXT} characters.`);
    return;
  }

  const previous = state.edits[key];

  NT.setText(el, after);
  el.dataset.ntKey = key;
  el.dataset.ntApplied = after; // keeps the boot's "did we write this?" test honest
  el.setAttribute("data-nt-edited", "");
  state.edits[key] = { text: after, original: anchor, id: previous ? previous.id : 0 };
  NT.writeCache(state.edits);

  send("/api/content", {
    path: NT.path,
    key,
    original: anchor,
    text: after,
  }).then((res) => {
    if (res.ok) {
      state.edits[key] = { text: res.data.text, original: anchor, id: res.data.id };
      NT.writeCache(state.edits);
      return;
    }
    // Rejected. Put the page back exactly as it was and say why.
    NT.setText(el, before);
    el.dataset.ntApplied = before;
    if (previous) {
      state.edits[key] = previous;
    } else {
      delete state.edits[key];
      el.removeAttribute("data-nt-edited");
    }
    NT.writeCache(state.edits);

    /* The optimistic write above is what makes 401 the one rejection
       that must not be a passing toast. The text on screen was changed
       before the POST went, so a save that fails silently leaves the
       page showing an edit that no longer exists anywhere. The revert
       just above is what stops that; endSession is what stops the next
       twenty edits going the same way unnoticed. */
    if (res.status === 401) {
      endSession();
      return;
    }
    toast(res.error);
  });
}

/* ============================================================
   The session ran out
   ------------------------------------------------------------
   Seven days passed, or the passphrase was rotated on the server. Every
   further save would be refused, so the honest thing is to stop looking
   editable: drop the hint cookie, take the furniture off the page, and
   leave a message that stays up rather than a toast that fades while
   somebody is still typing.

   The message does not name the sign-in URL. Whoever is editing knows
   it already, and this text is exactly the sort of thing that ends up
   in a screenshot pasted into a chat.
   ============================================================ */
function endSession() {
  document.cookie = `${UI_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;

  /* Out of the mode WITHOUT going through setMode(false), which commits
     whatever is open — and what is open is the edit that was just
     refused. Let go of the element instead. */
  const el = state.active;
  state.active = null;
  if (el) {
    el.contentEditable = "false";
    el.removeAttribute("data-nt-editing");
    if (document.activeElement === el) el.blur();
  }

  state.editing = false;
  closeMenu();
  clearHold();
  document.documentElement.removeAttribute("data-nt-mode");
  try {
    sessionStorage.removeItem(MODE_KEY);
  } catch (err) {
    /* storage disabled: nothing was remembered to forget */
  }

  if (state.bar) state.bar.remove();
  state.bar = null;
  state.toggle = null;

  // Nothing is marked editable any more, so a click is a click again.
  for (const marked of document.querySelectorAll("[data-nt-editable]")) {
    marked.removeAttribute("data-nt-editable");
  }

  toast("Your editing session has ended. Sign in again to keep editing.", true);
}

/* ============================================================
   Undo
   ============================================================ */
function undoLast() {
  const keys = Object.keys(state.edits);
  if (!keys.length) {
    toast("Nothing has been changed on this page yet.");
    return;
  }
  // The most recent change on the page is the highest row id.
  let newest = keys[0];
  for (const k of keys) {
    if ((state.edits[k].id || 0) > (state.edits[newest].id || 0)) newest = k;
  }
  revert(newest, null);
}

function revert(key, toId) {
  // The element actually carrying this key wins over the one the key
  // resolves to: if the fallback scan re-homed this edit, those are
  // two different elements and only the first one is showing it.
  const el = findByKey(key) || NT.elFor(key);

  send("/api/content/revert", { path: NT.path, key, toId }).then((res) => {
    if (!res.ok) {
      if (res.status === 401) endSession();
      else toast(res.error);
      return;
    }
    const entry = state.edits[key];
    if (el) {
      NT.setText(el, res.data.text);
      el.dataset.ntApplied = res.data.text;
    }
    state.edits[key] = {
      text: res.data.text,
      original: entry ? entry.original : el ? anchorOf(el, res.data.text) : res.data.text,
      id: res.data.id,
    };
    NT.writeCache(state.edits);
    toast("Change undone.");
  });
}

/** An edit the fallback scan re-homed lives on some other element. */
function findByKey(key) {
  return document.querySelector(`[data-nt-key="${CSS.escape(key)}"]`);
}

/* ============================================================
   Version menu
   ============================================================ */
async function openVersions(el) {
  closeMenu();
  const key = keyOf(el);
  if (!key) return;

  const res = await request(
    `/api/content/history?path=${encodeURIComponent(NT.path)}&key=${encodeURIComponent(key)}`
  );
  if (!res.ok) {
    if (res.status === 401) endSession();
    else toast(res.error);
    return;
  }
  const rows = (res.data.history || []).slice(0, MENU_VERSIONS);
  if (!rows.length) {
    toast("This text has not been changed yet.");
    return;
  }

  const menu = document.createElement("div");
  menu.className = "nt-menu";
  menu.setAttribute("data-nt-ui", "");
  menu.setAttribute("role", "menu");

  const head = document.createElement("p");
  head.className = "nt-menu-head";
  head.textContent = "Earlier versions";
  menu.appendChild(head);

  rows.forEach((row, i) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "nt-menu-item";

    const line = document.createElement("span");
    line.className = "nt-menu-text";
    line.textContent = row.text;
    item.appendChild(line);

    const meta = document.createElement("span");
    meta.className = "nt-menu-meta";
    // The newest row is what the page already says, so it is a label,
    // not an offer.
    meta.textContent = i === 0 ? "on the page now" : whenever(row.created_at);
    item.appendChild(meta);

    if (i === 0) {
      item.disabled = true;
    } else {
      item.addEventListener("click", () => {
        closeMenu();
        revert(key, row.id);
      });
    }
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  positionMenu(menu, el);
  state.menu = menu;

  // Any click that is not in the menu closes it.
  setTimeout(() => {
    document.addEventListener("pointerdown", onOutside, true);
  }, 0);
}

function onOutside(e) {
  if (state.menu && !state.menu.contains(e.target)) closeMenu();
}

function closeMenu() {
  if (!state.menu) return;
  document.removeEventListener("pointerdown", onOutside, true);
  state.menu.remove();
  state.menu = null;
}

function positionMenu(menu, el) {
  const r = el.getBoundingClientRect();
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  const pad = 8;

  let left = r.left + window.scrollX;
  let top = r.bottom + window.scrollY + 6;

  left = Math.min(left, window.scrollX + window.innerWidth - w - pad);
  left = Math.max(left, window.scrollX + pad);
  // Flip above if it would hang off the bottom.
  if (r.bottom + h + 6 > window.innerHeight) {
    top = Math.max(window.scrollY + pad, r.top + window.scrollY - h - 6);
  }
  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;
}

function whenever(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/* ============================================================
   Toolbar and toast
   ============================================================ */
/* Both buttons live in one bar, and that bar is APPENDED to <body> —
   never inserted. An edit_key is a path of tag:nth-of-type() segments
   from <body>, so anything placed ahead of existing content renumbers
   those paths and quietly detaches every edit already in the database
   from the element it was made on. Append only. */
function buildToolbar() {
  const bar = document.createElement("div");
  bar.className = "nt-bar";
  bar.setAttribute("data-nt-ui", "");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "nt-pill nt-pill-mode";
  toggle.addEventListener("click", () => setMode(!state.editing));

  const undo = document.createElement("button");
  undo.type = "button";
  undo.className = "nt-pill";
  undo.textContent = "Undo last change";
  undo.addEventListener("click", undoLast);

  bar.appendChild(toggle);
  bar.appendChild(undo);
  document.body.appendChild(bar);

  state.bar = bar;
  state.toggle = toggle;
  // Restore the mode this tab was left in, so it survives a navigation.
  setMode(readMode(), true);
}

function readMode() {
  try {
    return sessionStorage.getItem(MODE_KEY) === "1";
  } catch (err) {
    return false; // storage disabled — start off, as we would anyway
  }
}

/**
 * Turn editing on or off. `quiet` suppresses the toast, so restoring the
 * mode after a navigation does not announce itself on every page.
 */
function setMode(on, quiet) {
  state.editing = !!on;

  if (!state.editing) {
    exit(true); // commit whatever was open, then let go of the page
    closeMenu();
    clearHold();
  }

  document.documentElement.toggleAttribute("data-nt-mode", state.editing);
  if (state.toggle) {
    state.toggle.textContent = state.editing ? "Done editing" : "Edit text";
    state.toggle.setAttribute("aria-pressed", String(state.editing));
  }

  try {
    if (state.editing) sessionStorage.setItem(MODE_KEY, "1");
    else sessionStorage.removeItem(MODE_KEY);
  } catch (err) {
    /* storage disabled: the mode just will not survive the next page */
  }

  if (quiet) return;
  toast(
    state.editing
      ? "Editing on — click any text to change it."
      : "Editing off."
  );
}

let toastTimer = 0;
/** `stay` holds it on screen indefinitely — for the one message that is
    not "here is what happened" but "nothing more will work". */
function toast(message, stay) {
  if (!message) return;
  let node = document.querySelector(".nt-toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "nt-toast";
    node.setAttribute("data-nt-ui", "");
    node.setAttribute("role", "status");
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add("is-up");

  clearTimeout(toastTimer);
  if (stay) return;
  toastTimer = window.setTimeout(() => node.classList.remove("is-up"), TOAST_MS);
}

/* ============================================================
   Transport
   ============================================================ */
async function send(url, body) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "same-origin",
      // Survives a navigation started by the click that saved.
      keepalive: true,
    });
    const data = await res.json().catch(() => ({}));
    // The status is carried out with the error because 401 is not a
    // failure to report — it is the end of the session (see endSession).
    if (!res.ok)
      return { ok: false, status: res.status, error: data.error || "Could not save." };
    return { ok: true, data };
  } catch (err) {
    return { ok: false, status: 0, error: "No connection — the change was not saved." };
  }
}

async function request(url) {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return { ok: false, status: res.status, error: data.error || "Could not load." };
    return { ok: true, data };
  } catch (err) {
    return { ok: false, status: 0, error: "No connection." };
  }
}
