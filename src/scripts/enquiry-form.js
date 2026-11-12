/* ============================================================
   The enquiry form on /contact: the visitor's half (12 Nov 2026)
   ------------------------------------------------------------
   Without this script the form still works: the browser checks the
   fields it can, posts them to /api/enquiry, and /contact draws the
   result (src/pages/contact.astro). With it:

     - each field is checked as the visitor leaves it, and again as they
       correct it, by the server's own rules (src/lib/enquiry-rules.ts);
       its message under it, aria-invalid on the field;
     - Send checks them all, then posts JSON and stays on the page: the
       form gives way to the thank-you card, or one line above the fields
       says what went wrong.

   Every word shown is already in the page, in its own edit slot, and is
   only shown or hidden here, so Sir's saved wording is what a visitor
   reads. The honeypot (`website`) and the time token (`t`) go as they
   are; the server judges them.

   For a signed-in editor (the kd_edit_ui hint cookie, as careers-editor.js
   is loaded) it also adds a link to /studio/enquiries, shown only while
   "Edit text" is on (public/editor-ui.css), and while that mode is on it
   shows the messages a visitor sees only when they apply (the error
   lines, "Sending...", the thank-you card), so each can be edited like
   any other text; they are hidden again when the mode goes off. Done
   here and not in editor-ui.css: Tailwind's base layer hides [hidden]
   with !important, which no rule outside that layer can undo.
   ============================================================ */
import { ENQUIRY_FIELDS, checkEnquiry } from "../lib/enquiry-rules";

const form = document.querySelector("[data-enquiry-form]");
const done = document.querySelector("[data-enquiry-done]");

if (form && done) {
  form.noValidate = true;
  const alerts = form.querySelectorAll("[data-enquiry-alert]");
  const button = form.querySelector("button[type=submit]");
  const idle = button.querySelector("[data-enquiry-idle]");
  const busy = button.querySelector("[data-enquiry-busy]");
  const left = new Set();

  const field = (name) => form.elements.namedItem(name);
  const values = () => Object.fromEntries(ENQUIRY_FIELDS.map((name) => [name, field(name)?.value ?? ""]));

  const showAlert = (code) => {
    for (const p of alerts) p.hidden = p.dataset.enquiryAlert !== code;
  };

  const mark = (name, wrong) => {
    const el = field(name);
    const note = form.querySelector(`#enquiry-${name}-error`);
    if (!el || !note) return;
    if (wrong) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
    note.hidden = !wrong;
  };

  /** Checks the named fields (all of them by default); the wrong ones. */
  const check = (names = ENQUIRY_FIELDS) => {
    const { invalid } = checkEnquiry(values());
    for (const name of names) mark(name, invalid.includes(name));
    return invalid;
  };

  form.addEventListener("focusout", (e) => {
    const name = e.target?.name;
    if (!ENQUIRY_FIELDS.includes(name) || (!e.target.value && !left.has(name))) return;
    left.add(name);
    check([name]);
  });

  form.addEventListener("input", (e) => {
    const name = e.target?.name;
    if (left.has(name)) check([name]);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showAlert(null);
    for (const name of ENQUIRY_FIELDS) left.add(name);
    const invalid = check();
    if (invalid.length) {
      showAlert("invalid");
      field(invalid[0])?.focus();
      return;
    }

    button.disabled = true;
    idle.hidden = true;
    busy.hidden = false;
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values(), website: field("website")?.value ?? "", t: field("t")?.value ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        form.hidden = true;
        done.hidden = false;
        done.focus();
        return;
      }
      if (data.code === "invalid" && Array.isArray(data.fields) && data.fields.length) {
        for (const name of ENQUIRY_FIELDS) mark(name, data.fields.includes(name));
        field(data.fields[0])?.focus();
      }
      showAlert(data.code === "invalid" || data.code === "limited" ? data.code : "server");
    } catch {
      showAlert("offline");
    } finally {
      button.disabled = false;
      idle.hidden = false;
      busy.hidden = true;
    }
  });
}

if (document.cookie.split("; ").some((c) => c === "kd_edit_ui=1")) {
  const link = document.createElement("a");
  link.href = "/studio/enquiries";
  link.className = "nt-enquiries-link";
  link.setAttribute("data-nt-ui", "");
  link.textContent = "See enquiries";
  document.body.appendChild(link);

  const root = document.documentElement;
  const revealForEditing = () => {
    const on = root.hasAttribute("data-nt-mode");
    for (const el of document.querySelectorAll("[data-enquiry-form] [data-edit], [data-enquiry-done]")) {
      if (on && el.hidden) {
        el.hidden = false;
        el.dataset.enquiryRevealed = "";
      } else if (!on && "enquiryRevealed" in el.dataset) {
        el.hidden = true;
        delete el.dataset.enquiryRevealed;
      }
    }
  };
  revealForEditing();
  new MutationObserver(revealForEditing).observe(root, { attributes: true, attributeFilter: ["data-nt-mode"] });
}
