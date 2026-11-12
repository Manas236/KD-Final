/* ============================================================
   Check — every flow that writes to the database, end to end
   ------------------------------------------------------------
   Drives the running site over HTTP the way an applicant and an editor
   do, and says PASS or FAIL for each of ten flows (six until 12 Nov 2026):

     1. apply      an application with a resume, through /api/apply
     2. list       it appears on /studio/applications, with its email's
                   result recorded (mail_status, the one column kd_app
                   may UPDATE: "Not recorded" there means that grant is
                   missing)
     3. delete     the Delete button's request removes it again
     4. text block a paragraph added to a project page shows on that
                   page, and is removed again
     5. job post   a posting added in edit mode shows on /careers, and
                   is removed again
     6. launch     the launch mode switch is saved at the value it already
                   has, and that is in the log. The public site never
                   changes: it proves the rights without flipping anything
     7. enquiry    an enquiry through /api/enquiry as the form's script
                   sends it (JSON), listed on /studio/enquiries with its
                   email's result recorded (enquiries.mail_status: "Not
                   recorded" there means the column grant is missing)
     8. form post  the same as a browser without JavaScript sends it, a
                   plain form post with the site's Origin: 303 back to
                   /contact?enquiry=sent, which shows the thank-you card,
                   and the row listed. Through nginx this also proves
                   Astro's origin check lets the site's own form through
     9. spam       three that look automated (the honeypot filled, sent
                   under 3 s after the page, no time token) each get the
                   success answer, and none is listed
    10. rate limit invalid enquiries from this address until /api/enquiry
                   answers 429, within ENQUIRY_RATE_PER_HOUR (5 unset).
                   Only on a local origin unless given --rate-limit: it
                   uses up this address's hour, so a second run of steps
                   7 and 8 within the hour would be refused (restart the
                   site, or wait)

   Written for a deploy (PRE-LAUNCH.md, "Deploy and migration order"):
   it is the proof that the app works with its database user's own
   rights — SELECT and INSERT, plus DELETE on job_applications and UPDATE
   of mail_status on job_applications and enquiries — now that
   the schema comes from db/migrate.sql and never from the app. Most of
   these flows fail quietly when the database refuses them (a page shows
   no blocks, /careers shows no openings), so each one is checked by
   looking for what it wrote, not by a status code alone.

   IT CLEANS UP AFTER ITSELF. Everything it adds carries the marker
   "Deploy check <timestamp>" and is taken away again, also when a
   later step fails. The two append-only tables keep an 'add' and a
   'remove' row each, as every editor action does; nothing stays on any
   page. While it runs — a few seconds — the test posting is on
   /careers and the test paragraph is on one project page.

   EXCEPT THE ENQUIRIES (steps 7 and 8). kd_app may not delete an
   enquiry, so the two test enquiries stay in the table and on
   /studio/enquiries, named "Deploy check <timestamp> ..." and from
   deploy-check@example.com. The report lists their ids and the
   statement an administrator can remove them with. The spam and rate
   limit steps save nothing.

   EMAIL. If the server can send mail (RESEND_API_KEY is set), step 1
   would email the test application to HR. So steps 1-3 are skipped
   unless `--allow-email` is given. Without a key the application is
   saved and its email recorded as skipped, which still proves the
   mail_status grant. Steps 7-9 are skipped the same way when this .env
   has both RESEND_API_KEY and ENQUIRY_MAIL_TO (and no
   ENQUIRY_MAIL_DRY_RUN): with no recipients an enquiry is recorded as
   "skipped: no recipients", which proves its grant without emailing.

   Signs in with EDIT_PASSPHRASE from the project's .env, which it never
   prints. Prints no personal data: the only application and enquiries
   it reads back are its own.

   Usage:  node scripts/check-db-flows.mjs [origin] [--allow-email] [--rate-limit]
           origin defaults to http://localhost:<PORT from .env>
   ============================================================ */
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
dotenv.config({ path: ROOT + ".env", quiet: true });

const args = process.argv.slice(2);
const ALLOW_EMAIL = args.includes("--allow-email");
const ORIGIN = (args.find((a) => !a.startsWith("--")) || `http://localhost:${process.env.PORT || 4322}`).replace(
  /\/+$/,
  ""
);
const LOCAL = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(ORIGIN);
const RATE_TEST = LOCAL || args.includes("--rate-limit");
/* Any project page will do; this one is first on /projects. */
const SLUG = "panvel-karjat-railway-line";

/* To the millisecond plus a random tail: two runs a second apart must
   not be able to find each other's rows. */
const STAMP = new Date().toISOString().replace(/\D/g, "").slice(0, 17);
const MARK = `Deploy check ${STAMP}-${Math.random().toString(16).slice(2, 6)}`;
/* How the studio list prints a name. Astro adds a scoped attribute to
   the <strong>, so match its end, not the whole tag. */
const LISTED = `>${MARK}</strong>`;

/* ---------- HTTP, with the session cookie carried along ---------- */
const jar = new Map();

async function call(method, path, body) {
  const headers = { origin: ORIGIN };
  if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  if (body !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(ORIGIN + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  for (const line of res.headers.getSetCookie()) {
    const pair = line.split(";")[0];
    const at = pair.indexOf("=");
    const name = pair.slice(0, at).trim();
    const value = pair.slice(at + 1).trim();
    if (value) jar.set(name, value);
    else jar.delete(name);
  }
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, text, json };
}

/* A plain form post, as a browser without JavaScript sends one: Origin
   set, the answer's redirect not followed. */
async function postForm(path, fields) {
  const res = await fetch(ORIGIN + path, {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
    redirect: "manual",
  });
  await res.text();
  return { status: res.status, location: res.headers.get("location") ?? "" };
}

const said = (r) => (r.json?.error ? `HTTP ${r.status}: ${r.json.error}` : `HTTP ${r.status}`);

/* ---------- Results ---------- */
const results = [];

function record(step, outcome, detail = "") {
  results.push({ step, outcome });
  console.log(`${outcome.padEnd(4)}  ${step}${detail ? `  (${detail})` : ""}`);
}

/* What is still on the site, for the cleanup in `finally`. */
const left = { application: null, block: null, posting: null };
/* Set once /api/apply accepts the test application, cleared once it is
   deleted: an application that was saved but never found in the list
   cannot be deleted by id, so it is named in the report instead. */
let applicationUnaccounted = false;

/* ---------- The flows ---------- */
async function applicationFlows() {
  if (process.env.RESEND_API_KEY?.trim() && !ALLOW_EMAIL) {
    const why = "this server emails applications to HR; rerun with --allow-email to include it";
    record("1 apply", "SKIP", why);
    record("2 list", "SKIP", why);
    record("3 delete", "SKIP", why);
    return;
  }

  // 1. A real application: a PDF, and long enough after "opening the form"
  //    that /api/apply does not take it for a script.
  const pdf = Buffer.from("%PDF-1.4\n1 0 obj <<>> endobj\ntrailer <<>>\n%%EOF\n");
  const sent = await call("POST", "/api/apply", {
    name: MARK,
    email: "deploy-check@example.com",
    phone: "+91 90000 00000",
    role: "Automated deploy check",
    message: "Automated deploy check. The same script deletes this.",
    website: "",
    elapsed: 5000,
    resume: { name: "deploy-check.pdf", data: pdf.toString("base64") },
  });
  if (!(sent.status === 200 && sent.json?.ok)) {
    record("1 apply", "FAIL", said(sent));
    record("2 list", "SKIP", "nothing to list");
    record("3 delete", "SKIP", "nothing to delete");
    return;
  }
  applicationUnaccounted = true;
  record("1 apply", "PASS");

  // 2. It is on the studio list. The page shows a banner, not an error
  //    status, when the table cannot be read — so look for the row itself.
  const list = await call("GET", "/studio/applications");
  const row = list.text.indexOf(LISTED);
  const id = row < 0 ? null : Number(list.text.slice(row).match(/data-delete="(\d+)"/)?.[1]);
  /* /api/apply answers only after the email's result is written, so it
     is on the list already: sent, failed or skipped. "none" is a
     refused UPDATE. */
  const mail = row < 0 ? null : list.text.slice(row).match(/data-mail="(\w+)"/)?.[1];
  if (id) left.application = id;
  if (list.status !== 200) {
    record("2 list", "FAIL", `HTTP ${list.status}`);
  } else if (list.text.includes("Could not read the applications")) {
    record("2 list", "FAIL", "the page says it could not read the applications");
  } else if (!id) {
    record("2 list", "FAIL", "the test application is not in the list");
  } else if (!mail || mail === "none") {
    record(
      "2 list",
      "FAIL",
      `application #${id} is listed, but its email result was not recorded: is GRANT UPDATE (mail_status) missing?`
    );
  } else {
    record("2 list", "PASS", `application #${id}, email ${mail}`);
  }
  if (!id) {
    record("3 delete", "SKIP", "no row to delete");
    return;
  }

  // 3. Delete it the way the button does, then check the list again.
  const del = await call("POST", "/api/applications/delete", { id });
  const after = await call("GET", "/studio/applications");
  if (!(del.status === 200 && del.json?.ok)) {
    record("3 delete", "FAIL", said(del));
  } else if (after.text.includes(LISTED)) {
    record("3 delete", "FAIL", "the request said ok, but the row is still listed");
  } else {
    left.application = null;
    applicationUnaccounted = false;
    record("3 delete", "PASS");
  }
}

async function textBlockFlow() {
  const add = await call("POST", "/api/project-blocks", {
    action: "add",
    slug: SLUG,
    kind: "paragraph",
    text: `${MARK}: an automated test paragraph, removed by the same script.`,
  });
  if (!(add.status === 200 && add.json?.id)) return record("4 text block", "FAIL", `add: ${said(add)}`);
  left.block = add.json.id;

  const shown = await call("GET", `/projects/${SLUG}`);
  const isShown = shown.text.includes(`data-block="${left.block}"`);
  const rm = await call("POST", "/api/project-blocks", { action: "remove", slug: SLUG, id: left.block });
  const gone = await call("GET", `/projects/${SLUG}`);
  const isGone = !gone.text.includes(`data-block="${left.block}"`);
  if (rm.status === 200 && rm.json?.ok) left.block = null;

  if (!isShown) record("4 text block", "FAIL", `saved, but /projects/${SLUG} does not show it`);
  else if (!(rm.status === 200 && rm.json?.ok)) record("4 text block", "FAIL", `remove: ${said(rm)}`);
  else if (!isGone) record("4 text block", "FAIL", "removed, but the page still shows it");
  else record("4 text block", "PASS", `block #${add.json.id} on /projects/${SLUG}, added and removed`);
}

async function jobPostingFlow() {
  const add = await call("POST", "/api/careers", {
    action: "add",
    title: MARK,
    details: "Automated test posting, removed by the same script.",
    linkedin: "https://www.linkedin.com/company/k-d-constructions/jobs/",
    days: 1,
  });
  if (!(add.status === 200 && add.json?.id)) return record("5 job post", "FAIL", `add: ${said(add)}`);
  left.posting = add.json.id;

  const shown = await call("GET", "/careers");
  const isShown = shown.text.includes(`data-posting="${left.posting}"`);
  const rm = await call("POST", "/api/careers", { action: "remove", id: left.posting });
  const gone = await call("GET", "/careers");
  const isGone = !gone.text.includes(`data-posting="${left.posting}"`);
  if (rm.status === 200 && rm.json?.ok) left.posting = null;

  if (!isShown) record("5 job post", "FAIL", "saved, but /careers does not show it");
  else if (!(rm.status === 200 && rm.json?.ok)) record("5 job post", "FAIL", `remove: ${said(rm)}`);
  else if (!isGone) record("5 job post", "FAIL", "removed, but /careers still shows it");
  else record("5 job post", "PASS", `posting #${add.json.id}, added and removed`);
}

async function launchSwitchFlow() {
  const before = await call("GET", "/api/launch");
  if (before.status !== 200) return record("6 launch", "FAIL", `read: ${said(before)}`);
  if (before.json.forced) return record("6 launch", "SKIP", "HIDE_PENDING=1 forces launch mode on in this build");
  const saved = await call("POST", "/api/launch", { action: "set", on: before.json.on });
  if (!(saved.status === 200 && saved.json?.ok)) return record("6 launch", "FAIL", `save: ${said(saved)}`);
  const after = await call("GET", "/api/launch");
  if (after.json?.on !== before.json.on) record("6 launch", "FAIL", "the switch changed");
  else if (!after.json?.lastEvent || after.json.lastEvent === before.json.lastEvent) record("6 launch", "FAIL", "saved, but the log has no new row");
  else record("6 launch", "PASS", `still ${before.json.on ? "on" : "off"}, log row #${after.json.lastEvent}`);
}

/* ---------- The enquiry form on /contact (12 Nov 2026) ---------- */
const MIN_FILL_MS = 3000; // src/lib/enquiries.ts
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/* Enquiries this run saved: kd_app cannot delete them (see the top). */
const enquiriesLeft = [];

/** The signed time token /contact writes into the form. */
async function formToken() {
  const page = await call("GET", "/contact");
  return page.text.match(/name="t" value="(\d{13}\.[A-Za-z0-9_-]{22})"/)?.[1] ?? null;
}

function enquiry(name, t, extra = {}) {
  return {
    name,
    company: "Automated deploy check",
    phone: "+91 90000 00000",
    email: "deploy-check@example.com",
    message: "Automated deploy check of the enquiry form. kd_app cannot delete it; an administrator can.",
    website: "",
    t,
    ...extra,
  };
}

/** Where /studio/enquiries lists a name: the row's id and its email's result. */
function findEnquiry(listText, name) {
  const at = listText.indexOf(`>${name}</strong>`);
  if (at < 0) return null;
  const start = listText.lastIndexOf("<tr ", at);
  const end = listText.indexOf("</tr>", at);
  const row = listText.slice(start, end);
  return {
    id: Number(row.match(/id="enquiry-(\d+)"/)?.[1]) || null,
    mail: row.match(/data-mail="(\w+)"/)?.[1] ?? null,
    note: row.match(/class="[^"]*eq-note[^"]*"[^>]*>([^<]*)</)?.[1]?.trim() ?? "",
  };
}

const rateHint = (r) =>
  r.status === 429 ? "; this address has used its hour of enquiries, by an earlier run? Restart the site or wait" : "";

async function enquiryFlows() {
  const live = process.env.RESEND_API_KEY?.trim() && process.env.ENQUIRY_MAIL_TO?.trim();
  const dry = /^(1|true|yes)$/i.test((process.env.ENQUIRY_MAIL_DRY_RUN ?? "").trim());
  if (live && !dry && !ALLOW_EMAIL) {
    const why = "this server emails enquiries to ENQUIRY_MAIL_TO; rerun with --allow-email to include it";
    for (const step of ["7 enquiry", "8 form post", "9 spam"]) record(step, "SKIP", why);
  } else {
    const t = await formToken();
    if (!t) {
      for (const step of ["7 enquiry", "8 form post", "9 spam"]) record(step, "FAIL", "/contact has no time token in its form");
    } else {
      await wait(MIN_FILL_MS + 300);

      // 7. As the form's script sends it.
      const name7 = `${MARK} enquiry`;
      const sent = await call("POST", "/api/enquiry", enquiry(name7, t));
      if (!(sent.status === 200 && sent.json?.ok)) {
        record("7 enquiry", "FAIL", said(sent) + rateHint(sent));
      } else {
        const list = await call("GET", "/studio/enquiries");
        const row = findEnquiry(list.text, name7);
        if (row?.id) enquiriesLeft.push(row.id);
        if (list.status !== 200) record("7 enquiry", "FAIL", `/studio/enquiries: HTTP ${list.status}`);
        else if (list.text.includes("Could not read the enquiries")) record("7 enquiry", "FAIL", "the studio page could not read the enquiries");
        else if (!row) record("7 enquiry", "FAIL", "saved, but not listed on /studio/enquiries");
        else if (!row.mail || row.mail === "none")
          record("7 enquiry", "FAIL", `enquiry #${row.id} is listed, but its email result was not recorded: is GRANT UPDATE (mail_status) ON enquiries missing?`);
        else record("7 enquiry", "PASS", `enquiry #${row.id}, email ${row.mail}${row.note ? `: ${row.note}` : ""}`);
      }

      // 8. As a browser without JavaScript sends it.
      const name8 = `${MARK} form post`;
      const posted = await postForm("/api/enquiry", enquiry(name8, t));
      if (posted.status !== 303 || !posted.location.startsWith("/contact?enquiry=sent")) {
        record("8 form post", "FAIL", `HTTP ${posted.status}${posted.location ? ` to ${posted.location}` : ""}${rateHint(posted)}`);
      } else {
        const result = await call("GET", posted.location.split("#")[0]);
        const doneShown = /<div data-enquiry-done(?![^>]*\bhidden\b)[^>]*>/.test(result.text);
        const formHidden = /<form data-enquiry-form[^>]*\bhidden\b/.test(result.text);
        const list = await call("GET", "/studio/enquiries");
        const row = findEnquiry(list.text, name8);
        if (row?.id) enquiriesLeft.push(row.id);
        if (!doneShown || !formHidden) record("8 form post", "FAIL", `${posted.location} does not show the thank-you card in place of the form`);
        else if (!row) record("8 form post", "FAIL", "303 to the thank-you card, but the enquiry is not listed");
        else if (!row.mail || row.mail === "none") record("8 form post", "FAIL", `enquiry #${row.id}: its email result was not recorded`);
        else record("8 form post", "PASS", `303 to ${posted.location}, enquiry #${row.id}, email ${row.mail}`);
      }

      // 9. Three that look automated: each answered as a success, none kept.
      const spam = [
        [`${MARK} honeypot`, () => call("POST", "/api/enquiry", enquiry(`${MARK} honeypot`, t, { website: "https://spam.example" }))],
        [`${MARK} too fast`, async () => call("POST", "/api/enquiry", enquiry(`${MARK} too fast`, await formToken()))],
        [`${MARK} no token`, () => call("POST", "/api/enquiry", enquiry(`${MARK} no token`, ""))],
      ];
      const answers = [];
      for (const [, send] of spam) answers.push(await send());
      const list = await call("GET", "/studio/enquiries");
      const kept = spam.map(([name]) => name).filter((name) => findEnquiry(list.text, name));
      const refused = answers.filter((r) => !(r.status === 200 && r.json?.ok));
      if (refused.length) record("9 spam", "FAIL", `answered ${refused.map(said).join(", ")}, not as a success`);
      else if (kept.length) record("9 spam", "FAIL", `saved anyway: ${kept.join(", ")}`);
      else record("9 spam", "PASS", "honeypot, too fast and no token: each answered ok, none saved");
    }
  }

  // 10. The rate limit: invalid enquiries (never saved) until a 429.
  if (!RATE_TEST) {
    record("10 rate limit", "SKIP", "not a local origin: it would use up this address's hour; rerun with --rate-limit to include it");
    return;
  }
  const limit = Number.parseInt(process.env.ENQUIRY_RATE_PER_HOUR ?? "", 10) || 5;
  const t = await formToken();
  await wait(MIN_FILL_MS + 300);
  let tripped = 0;
  const seen = [];
  for (let i = 1; i <= limit + 1; i++) {
    const r = await call("POST", "/api/enquiry", enquiry(`${MARK} rate ${i}`, t, { message: "too short" }));
    seen.push(r.status);
    if (r.status === 429) {
      tripped = i;
      break;
    }
    if (r.status !== 400) break;
  }
  if (tripped) record("10 rate limit", "PASS", `429 on post ${tripped} of this run's invalid ones (${seen.join(" ")}), limit ${limit} an hour`);
  else record("10 rate limit", "FAIL", `no 429 after ${seen.length} posts (${seen.join(" ")}), limit ${limit} an hour`);
}

/* ---------- Run ---------- */
console.log(`Database flows on ${ORIGIN}, marker "${MARK}"\n`);

if (!process.env.EDIT_PASSPHRASE) {
  console.log(`FAIL  sign in  (no EDIT_PASSPHRASE in ${ROOT}.env, or the file could not be read)`);
  process.exit(1);
}

let signedIn = false;
try {
  const login = await call("POST", "/api/edit-session", { passphrase: process.env.EDIT_PASSPHRASE });
  if (!(login.status === 200 && login.json?.ok && jar.has("kd_edit"))) {
    record("sign in", "FAIL", said(login));
  } else {
    signedIn = true;
    await applicationFlows();
    await textBlockFlow();
    await jobPostingFlow();
    await launchSwitchFlow();
    await enquiryFlows();
  }
} catch (err) {
  record("run", "FAIL", `could not reach ${ORIGIN}: ${err.cause?.code || err.message}`);
} finally {
  // Whatever an earlier failure left behind.
  try {
    if (left.application) await call("POST", "/api/applications/delete", { id: left.application });
    if (left.block) await call("POST", "/api/project-blocks", { action: "remove", slug: SLUG, id: left.block });
    if (left.posting) await call("POST", "/api/careers", { action: "remove", id: left.posting });
    if (signedIn) await call("DELETE", "/api/edit-session");
  } catch {
    /* reported below */
  }
  const leftOver = Object.entries(left).filter(([, v]) => v);
  if (applicationUnaccounted && !left.application)
    console.log(
      `
LEFT ON THE SITE — an application named "${MARK}" was saved but not found in the list; delete it on /studio/applications.`
    );
  if (leftOver.length)
    console.log(`\nLEFT ON THE SITE — remove by hand: ${leftOver.map(([k, v]) => `${k} #${v}`).join(", ")}`);
  if (enquiriesLeft.length)
    console.log(
      `\nNOTE  the test enquiries #${enquiriesLeft.join(", #")} stay on /studio/enquiries: kd_app may not delete ` +
        `an enquiry. An administrator can remove them:\n      DELETE FROM enquiries WHERE email = 'deploy-check@example.com' AND name LIKE 'Deploy check %';`
    );
}

const failed = results.filter((r) => r.outcome === "FAIL").length;
const skipped = results.filter((r) => r.outcome === "SKIP").length;
console.log(
  `\n${failed ? `${failed} FAILED` : "All run flows passed"}` +
    `${skipped ? `, ${skipped} skipped` : ""} — ${results.filter((r) => r.outcome === "PASS").length} passed.`
);
process.exit(failed ? 1 : 0);
