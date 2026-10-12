/* ============================================================
   Check — every flow that writes to the database, end to end
   ------------------------------------------------------------
   Drives the running site over HTTP the way an applicant and an editor
   do, and says PASS or FAIL for each of five flows:

     1. apply      an application with a resume, through /api/apply
     2. list       it appears on /studio/applications
     3. delete     the Delete button's request removes it again
     4. text block a paragraph added to a project page shows on that
                   page, and is removed again
     5. job post   a posting added in edit mode shows on /careers, and
                   is removed again

   Written for a deploy (PRE-LAUNCH.md, "Deploy and migration order"):
   it is the proof that the app works with its database user's own
   rights — SELECT and INSERT, plus DELETE on job_applications — now that
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

   EMAIL. If the server can send mail (SMTP_USER and SMTP_PASS are set),
   step 1 would email the test application to HR. So steps 1-3 are
   skipped unless `--allow-email` is given.

   Signs in with EDIT_PASSPHRASE from the project's .env, which it never
   prints. Prints no personal data: the only application it reads back
   is its own.

   Usage:  node scripts/check-db-flows.mjs [origin] [--allow-email]
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
  if (process.env.SMTP_USER && process.env.SMTP_PASS && !ALLOW_EMAIL) {
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
  if (list.status !== 200) {
    record("2 list", "FAIL", `HTTP ${list.status}`);
  } else if (list.text.includes("Could not read the applications")) {
    record("2 list", "FAIL", "the page says it could not read the applications");
  } else if (!id) {
    record("2 list", "FAIL", "the test application is not in the list");
  } else {
    left.application = id;
    record("2 list", "PASS", `application #${id}`);
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
    indeed: "",
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
}

const failed = results.filter((r) => r.outcome === "FAIL").length;
const skipped = results.filter((r) => r.outcome === "SKIP").length;
console.log(
  `\n${failed ? `${failed} FAILED` : "All run flows passed"}` +
    `${skipped ? `, ${skipped} skipped` : ""} — ${results.filter((r) => r.outcome === "PASS").length} passed.`
);
process.exit(failed ? 1 : 0);
