/* ============================================================
   The studio gallery manager — browser half
   ------------------------------------------------------------
   Draws every gallery group from GET /api/gallery and sends each change
   to POST /api/gallery, which answers with the fresh state; the page
   repaints from that answer, never from its own guess. See
   src/pages/studio/gallery.astro and src/lib/gallery-live.ts.

   Positions: the server orders a group by its FULL list, hidden photos
   included, so every "put it here" below is turned into an index in
   that full list before it is sent.
   ============================================================ */

const boot = JSON.parse(document.getElementById("gm-boot").textContent);
const $ = (id) => document.getElementById(id);

const groupsEl = $("gm-groups");
const statsEl = $("gm-stats");
const jumpEl = $("gm-jump");
const bannerEl = $("gm-banner");
const toastEl = $("gm-toast");
const historyEl = $("gm-history");
const historyList = $("gm-history-list");

const SECTION_ORDER = ["railway", "social", "plant", "hse"];
const openHidden = new Set();
let data = null;
let busy = false;
let dragging = null;

/* ---------------- transport ---------------- */
async function call(method, body) {
  try {
    const res = await fetch("/api/gallery", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      showBanner("Your editing session has ended. Sign in again through the studio link, then reload this page.");
      return null;
    }
    if (!res.ok) {
      toast(json.error || "Something went wrong. Nothing was changed.");
      return null;
    }
    return json;
  } catch {
    toast("No connection. Nothing was changed.");
    return null;
  }
}

async function change(body, done) {
  if (busy) return;
  busy = true;
  document.body.classList.add("gm-busy");
  const next = await call("POST", body);
  busy = false;
  document.body.classList.remove("gm-busy");
  if (!next) return;
  data = next;
  render();
  const latest = data.history.find((h) => !h.undone);
  toast(done || "Saved. It is live on the site now.", body.action !== "undo" && latest ? latest.id : null);
}

/* ---------------- helpers ---------------- */
function groupOf(file) {
  return data.groups.find((g) => g.photos.some((p) => p.file === file));
}

/** Index in `group`'s full list, with `file` taken out, where it lands
    if put directly after `afterFile` (null = first). */
function positionAfter(group, file, afterFile) {
  const list = group.photos.map((p) => p.file).filter((f) => f !== file);
  return afterFile ? list.indexOf(afterFile) + 1 : 0;
}

function positionBefore(group, file, beforeFile) {
  const list = group.photos.map((p) => p.file).filter((f) => f !== file);
  const i = list.indexOf(beforeFile);
  return i < 0 ? list.length : i;
}

function orientation(file) {
  const t = boot.thumbs[file];
  if (!t) return "";
  return t.w > t.h ? "Landscape" : t.w === t.h ? "Square" : "Portrait";
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

function sectionLabel(section) {
  return boot.sections[section] || section;
}

/* ---------------- render ---------------- */
function render() {
  const visible = data.groups.reduce((n, g) => n + g.photos.filter((p) => !p.hidden).length, 0);
  const hidden = data.groups.reduce((n, g) => n + g.photos.filter((p) => p.hidden).length, 0);
  const projects = data.groups.filter((g) => g.photos.some((p) => !p.hidden)).length;
  statsEl.replaceChildren(
    stat(visible, "on the site"),
    stat(hidden, "hidden"),
    stat(projects, "projects with photos")
  );

  const shown = data.groups.filter((g) => g.photos.length);
  jumpEl.replaceChildren(
    el("option", { value: "", text: "Choose a project" }),
    ...shown.map((g) => el("option", { value: anchorOf(g.project), text: g.project }))
  );

  const frag = document.createDocumentFragment();
  for (const section of SECTION_ORDER) {
    const groups = shown.filter((g) => g.section === section);
    if (!groups.length) continue;
    frag.append(el("h2", { class: "gm-section", text: sectionLabel(section) }));
    for (const g of groups) frag.append(renderGroup(g));
  }
  groupsEl.replaceChildren(frag);
  renderHistory();
}

function stat(n, label) {
  return el("span", { class: "gm-stat" }, [el("strong", { text: String(n) }), " " + label]);
}

function anchorOf(project) {
  return "g-" + project.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderGroup(group) {
  const visible = group.photos.filter((p) => !p.hidden);
  const hidden = group.photos.filter((p) => p.hidden);

  const grid = el("div", { class: "gm-grid" });
  visible.forEach((p, i) => grid.append(tile(group, p, visible, i)));
  grid.append(endZone(group));

  const box = el("section", { class: "gm-group", id: anchorOf(group.project) }, [
    el("header", { class: "gm-group-head" }, [
      el("h3", { text: group.project }),
      el("span", {
        class: "gm-count",
        text: `${visible.length} on the site${hidden.length ? ` · ${hidden.length} hidden` : ""}`,
      }),
    ]),
    visible.length ? grid : el("p", { class: "gm-empty", text: "No photos on the site for this project." }),
  ]);

  if (hidden.length) {
    const details = el("details", { class: "gm-hidden" }, [
      el("summary", { text: `Hidden (${hidden.length})` }),
      el("p", {
        class: "gm-note",
        text: "Not on the site. “Show on site” puts a photo back where it was; “Move to” sends it to another project.",
      }),
      el("div", { class: "gm-grid" }, hidden.map((p) => tile(group, p, null, -1))),
    ]);
    details.open = openHidden.has(group.project);
    details.addEventListener("toggle", () => {
      if (details.open) openHidden.add(group.project);
      else openHidden.delete(group.project);
    });
    box.append(details);
  }
  return box;
}

function tile(group, photo, visible, i) {
  const t = boot.thumbs[photo.file] || {};
  const card = el("article", {
    class: "gm-tile" + (photo.hidden ? " is-hidden" : ""),
    "data-file": photo.file,
    draggable: photo.hidden ? null : "true",
  });

  const thumb = el(
    "button",
    {
      type: "button",
      class: "gm-thumb",
      "aria-label": `Enlarge ${photo.file}`,
      onclick: () => preview(photo),
    },
    [el("img", { src: t.thumb || "", alt: photo.caption, loading: "lazy" })]
  );

  const caption = captionBlock(photo);
  const fileLine = el("p", { class: "gm-file" }, [
    photo.file,
    el("span", { text: ` · ${orientation(photo.file)}` }),
    photo.library ? el("span", { class: "gm-tag", text: "Taken off in the October sort" }) : null,
  ]);

  const controls = el("div", { class: "gm-ctrls" });
  if (!photo.hidden) {
    const prev = visible[i - 1];
    const next = visible[i + 1];
    controls.append(
      el("button", {
        type: "button",
        class: "gm-icon",
        title: "Move earlier",
        "aria-label": `Move ${photo.file} earlier`,
        disabled: !prev,
        text: "←",
        onclick: () =>
          change({ action: "move", file: photo.file, group: group.project, position: positionBefore(group, photo.file, prev.file) }),
      }),
      el("button", {
        type: "button",
        class: "gm-icon",
        title: "Move later",
        "aria-label": `Move ${photo.file} later`,
        disabled: !next,
        text: "→",
        onclick: () =>
          change({ action: "move", file: photo.file, group: group.project, position: positionAfter(group, photo.file, next.file) }),
      })
    );
  }
  controls.append(moveSelect(group, photo));
  controls.append(photo.hidden ? showButton(photo) : hideButton(photo));

  card.append(thumb, el("div", { class: "gm-meta" }, [caption, fileLine, controls]));

  if (!photo.hidden) {
    card.addEventListener("dragstart", (e) => {
      dragging = photo.file;
      card.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", photo.file);
    });
    card.addEventListener("dragend", () => {
      dragging = null;
      card.classList.remove("is-dragging");
      document.querySelectorAll(".is-over-before, .is-over-after").forEach((n) => n.classList.remove("is-over-before", "is-over-after"));
    });
    card.addEventListener("dragover", (e) => {
      if (!dragging || dragging === photo.file) return;
      e.preventDefault();
      const after = isAfter(card, e);
      card.classList.toggle("is-over-after", after);
      card.classList.toggle("is-over-before", !after);
    });
    card.addEventListener("dragleave", () => card.classList.remove("is-over-before", "is-over-after"));
    card.addEventListener("drop", (e) => {
      if (!dragging || dragging === photo.file) return;
      e.preventDefault();
      const file = dragging;
      const position = isAfter(card, e)
        ? positionAfter(group, file, photo.file)
        : positionBefore(group, file, photo.file);
      change({ action: "move", file, group: group.project, position });
    });
  }
  return card;
}

function isAfter(card, e) {
  const r = card.getBoundingClientRect();
  return e.clientX > r.left + r.width / 2;
}

/** The dashed box at the end of a group: drop here to put a photo
    last, including one dragged in from another project. */
function endZone(group) {
  const zone = el("div", { class: "gm-end", text: "Drop here to put it last" });
  zone.addEventListener("dragover", (e) => {
    if (!dragging) return;
    e.preventDefault();
    zone.classList.add("is-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
  zone.addEventListener("drop", (e) => {
    if (!dragging) return;
    e.preventDefault();
    zone.classList.remove("is-over");
    change({ action: "move", file: dragging, group: group.project });
  });
  return zone;
}

function captionBlock(photo) {
  const wrap = el("div", { class: "gm-cap-wrap" });
  const show = () => {
    const text = el("p", {
      class: "gm-cap",
      tabindex: "0",
      role: "button",
      title: "Click to edit the caption",
      text: photo.caption,
    });
    const open = () => edit();
    text.addEventListener("click", open);
    text.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    wrap.replaceChildren(text);
    if (photo.caption !== photo.baseCaption) {
      wrap.append(
        el("button", {
          type: "button",
          class: "gm-link",
          text: "Restore original caption",
          title: photo.baseCaption,
          onclick: () => change({ action: "caption", file: photo.file, caption: photo.baseCaption }, "Original caption restored."),
        })
      );
    }
  };
  const edit = () => {
    const area = el("textarea", { class: "gm-cap-input", maxlength: "200", rows: "3", "aria-label": `Caption for ${photo.file}` });
    area.value = photo.caption;
    const save = () => {
      const value = area.value.replace(/\s+/g, " ").trim();
      if (!value) return toast("A caption cannot be empty.");
      if (value === photo.caption) return show();
      change({ action: "caption", file: photo.file, caption: value }, "Caption saved. It is live on the site now.");
    };
    area.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        save();
      }
      if (e.key === "Escape") show();
    });
    wrap.replaceChildren(
      area,
      el("div", { class: "gm-cap-actions" }, [
        el("button", { type: "button", class: "gm-btn gm-btn-primary", text: "Save caption", onclick: save }),
        el("button", { type: "button", class: "gm-btn", text: "Cancel", onclick: show }),
      ])
    );
    area.focus();
    area.select();
  };
  show();
  return wrap;
}

function moveSelect(group, photo) {
  const select = el("select", { class: "gm-move", "aria-label": `Move ${photo.file} to another project` });
  select.append(el("option", { value: "", text: "Move to…" }));
  for (const section of SECTION_ORDER) {
    const og = el("optgroup", { label: sectionLabel(section) });
    for (const g of data.groups.filter((x) => x.section === section && x.project !== group.project)) {
      og.append(el("option", { value: g.project, text: g.project }));
    }
    if (og.children.length) select.append(og);
  }
  select.addEventListener("change", () => {
    const target = select.value;
    if (!target) return;
    change({ action: "move", file: photo.file, group: target }, `Moved to ${target}. It is live on the site now.`);
  });
  return select;
}

/* Hiding asks twice: the client team uses this screen too, and a photo
   vanishing from the site on one stray click is the mistake to stop. */
function hideButton(photo) {
  const button = el("button", { type: "button", class: "gm-btn gm-btn-quiet", text: "Hide" });
  let armed = false;
  let timer = 0;
  button.addEventListener("click", () => {
    if (!armed) {
      armed = true;
      button.textContent = "Click again to hide";
      button.classList.add("is-armed");
      timer = window.setTimeout(() => {
        armed = false;
        button.textContent = "Hide";
        button.classList.remove("is-armed");
      }, 4000);
      return;
    }
    clearTimeout(timer);
    change({ action: "hide", file: photo.file }, "Hidden. It is off the site now.");
  });
  return button;
}

function showButton(photo) {
  return el("button", {
    type: "button",
    class: "gm-btn gm-btn-primary",
    text: "Show on site",
    onclick: () => change({ action: "show", file: photo.file }, "Back on the site."),
  });
}

/* ---------------- history ---------------- */
function describe(h) {
  switch (h.action) {
    case "hide":
      return `Hid ${h.file}`;
    case "show":
      return `Put ${h.file} back on the site`;
    case "move":
      return h.position == null ? `Moved ${h.file} to ${h.group}` : `Moved ${h.file} to ${h.group}, position ${h.position + 1}`;
    case "caption":
      return `Changed the caption of ${h.file} to “${h.caption}”`;
    default:
      return `${h.action} ${h.file || ""}`;
  }
}

function when(at) {
  const d = new Date(at.includes("T") ? at : at.replace(" ", "T") + "Z");
  return isNaN(d) ? "" : d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function renderHistory() {
  if (!data.history.length) {
    historyList.replaceChildren(el("li", { class: "gm-note", text: "No changes yet." }));
    return;
  }
  historyList.replaceChildren(
    ...data.history.map((h) =>
      el("li", { class: h.undone ? "is-undone" : "" }, [
        el("img", { src: (boot.thumbs[h.file] || {}).thumb || "", alt: "", loading: "lazy" }),
        el("div", {}, [
          el("p", { text: describe(h) }),
          el("span", { class: "gm-note", text: `${when(h.at)}${h.undone ? " · undone" : ""}` }),
        ]),
        h.undone
          ? h.undoneBy
            ? el("button", { type: "button", class: "gm-btn", text: "Redo", onclick: () => change({ action: "undo", ref: h.undoneBy }, "Redone.") })
            : null
          : el("button", { type: "button", class: "gm-btn", text: "Undo", onclick: () => change({ action: "undo", ref: h.id }, "Undone.") }),
      ])
    )
  );
}

$("gm-history-open").addEventListener("click", () => {
  historyEl.hidden = false;
  $("gm-history-close").focus();
});
$("gm-history-close").addEventListener("click", () => {
  historyEl.hidden = true;
  $("gm-history-open").focus();
});

/* ---------------- preview, jump, banner, toast ---------------- */
function preview(photo) {
  const dialog = $("gm-preview");
  const t = boot.thumbs[photo.file] || {};
  $("gm-preview-img").src = t.large || t.thumb || "";
  $("gm-preview-img").alt = photo.caption;
  $("gm-preview-cap").textContent = `${photo.caption} · ${photo.file}`;
  if (typeof dialog.showModal === "function") dialog.showModal();
}

jumpEl.addEventListener("change", () => {
  const target = jumpEl.value && document.getElementById(jumpEl.value);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  jumpEl.value = "";
});

function showBanner(message) {
  bannerEl.textContent = message;
  bannerEl.hidden = false;
}

let toastTimer = 0;
function toast(message, undoId) {
  toastEl.replaceChildren(el("span", { text: message }));
  if (undoId) {
    toastEl.append(
      el("button", {
        type: "button",
        class: "gm-link",
        text: "Undo",
        onclick: () => change({ action: "undo", ref: undoId }, "Undone."),
      })
    );
  }
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toastEl.hidden = true), 6000);
}

/* ---------------- start ---------------- */
(async () => {
  const first = await call("GET");
  if (!first) {
    groupsEl.replaceChildren(el("p", { class: "gm-empty", text: "The gallery could not be loaded. Reload the page to try again." }));
    return;
  }
  data = first;
  render();
})();
