## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## The KD server is production: work there goes through its own Claude Code session

The site is live at https://kdconstructions.net since 11 Nov 2026. It runs on the KD Lightsail box (public IP 3.109.53.216, hostname `ip-172-26-8-71`, site at `/srv/kd-site`), which was the test server until launch and is now **production**. There is no separate test server: staging is the development PC, plus a manual Lightsail snapshot of the box before every deploy (PRE-LAUNCH.md, "Deploy and migration order").

A Claude Code session runs on that box. The user relays between that session and the one on the development PC. Which half of this applies to you depends on where you are running; check `hostname` if unsure.

**If you are NOT on `ip-172-26-8-71`** (the development PC):

- Never give the user shell commands to run on the server. For anything that has to run there — a database check, a deploy, reading a log — write a **prompt for the server's Claude Code session** instead. The user pastes it there and pastes the report back to you.
- The prompt opens with a box check: run `hostname`; if it is not exactly `ip-172-26-8-71`, stop, say which machine it is, and do nothing else.
- The prompt is self-contained. The server session has none of your conversation, so say what to do and why, where (`/srv/kd-site`), what must not change (state "read-only" when it is a check), and exactly what to report back.
- Do not treat a check as done until the report comes back. Record what it says, not what you expected.

**If you ARE on `ip-172-26-8-71`:** prompts relayed by the user from the development-PC session are how work reaches you. Run the box check they open with, stay inside what the prompt allows, and report back in the form it asks for.

**The server only pulls; it never commits.** Code reaches it through GitHub. On launch day it made one local commit, `83b9c5e` (the allowed hosts in astro.config.mjs); the same change is on GitHub as `dc5f1ee`, and the next deploy drops the local commit (PRE-LAUNCH.md, the 2026-11-11 launch follow-up note).

## Production (live since 11 Nov 2026)

- **nginx** terminates TLS and passes Host, X-Forwarded-Host and X-Forwarded-Proto to the app. It answers 301, path and query kept, from `www.kdconstructions.net` to the bare domain, from http to https, and from the bare IP to the domain.
- **Certificates:** Let's Encrypt, one for `kdconstructions.net` and `www` (90 days) and a short-lived one for the IP address (about 6 days), so that `https://3.109.53.216` redirects without a warning. Both renew through snap certbot's timer on the box; nothing in this repo renews them.
- **Allowed hosts:** `security.allowedDomains` in astro.config.mjs lists `kdconstructions.net` and `www.kdconstructions.net`, https only. Astro believes nginx's forwarded headers only for a host listed there; for any other it takes the request for `http://localhost`, and its origin check answers 403 to every POST sent as a form (multipart, urlencoded or text/plain, such as the studio's photo upload) that came through nginx. A new host name for the site goes in that list.
- **Indexed:** `SITE_NOINDEX` is off: no `X-Robots-Tag`, and `/robots.txt` names the sitemap. The switch (src/lib/staging.ts) is only for a test copy.
- **Launch mode is on** (`/studio/launch`), so every placeholder still in the code is off the public site.
- **Careers email goes through Resend** since 2026-11-11 (the section below), replacing the SMTP plan that never went live. Until production has `RESEND_API_KEY` in its `.env` (PRE-LAUNCH.md G7, and the 2026-11-11 careers email deploy note), an application on `/careers` is saved and listed in `/studio/applications`, marked "Not sent, email is not set up", and nobody is emailed.
- **Enquiry form on `/contact`** since 2026-11-12, not deployed yet (the section below, PRE-LAUNCH.md G9 and the 2026-11-12 deploy note). It needs, **in this order**: the production `.env` lines `ENQUIRY_MAIL_FROM` (and `ENQUIRY_RATE_PER_HOUR` if 5 is not wanted) with `ENQUIRY_MAIL_TO` left out for the first restart, then `db/migrate.sql` run as an administrator (new table `enquiries`) and its three new grant lines (`SELECT, INSERT` and `UPDATE (mail_status)` on `enquiries`) plus `FLUSH PRIVILEGES`, **both before the restart**; then, once `check:db-flows` has passed, `ENQUIRY_MAIL_TO` and a second restart. It reuses `RESEND_API_KEY`.
- **Checks against production run on the live origin:** `npm run check:db-flows -- https://kdconstructions.net`, so the write flows (ten since 2026-11-12) go through nginx as a visitor's do.

## The database schema comes from db/migrate.sql, never from the app

The site's database user (`kd_app` on a server) has SELECT and INSERT on every table, plus DELETE on `job_applications`, and UPDATE of the one column `mail_status` on `job_applications` (a column grant, asked for and approved on 2026-11-11 for the careers email) and on `enquiries` (the same, asked for by the user in the 2026-11-12 enquiry-form task), and nothing else. No DELETE on `enquiries`. App code must never run CREATE, ALTER, DROP or any other schema statement — MySQL refuses even `CREATE TABLE IF NOT EXISTS` on an existing table to a user without CREATE.

- A new table or column goes into `db/migrate.sql`: idempotent, a table created only if missing, a column added only after an `information_schema` check.
- A new table also gets its grant line at the foot of that file.
- A new kind of write needs nothing beyond SELECT and INSERT (DELETE only on `job_applications`, the `mail_status` UPDATE only on `job_applications` and `enquiries`). If it does, stop and ask the user — do not widen `kd_app`'s grants. A table or column grant needs its table and column first: the migration, then the GRANT, then `FLUSH PRIVILEGES`.
- PRE-LAUNCH.md, "Deploy and migration order", runs the migration as a database administrator before the app restarts; `npm run check:db-flows` then proves the write flows (ten since 2026-11-12) work with `kd_app`'s rights (on production, against `https://kdconstructions.net`).

## Careers email: saved first, then sent through Resend (11 Nov 2026)

Each application from `/careers` is emailed to HR through Resend's HTTP API with the global fetch: no SDK, no SMTP, no npm dependency (`nodemailer` is still in package.json, imported by nothing). `src/lib/mailer.ts` is the Resend call (`sendThroughResend()`, shared with the enquiry email since 2026-11-12: the site's one mail path), `src/lib/application-mail.ts` the email and its record, `POST /api/apply` the order.

- **Saved first.** The resume file and the `job_applications` row are written exactly as before, and a failure there is the applicant's error. Only then is HR emailed. The email never changes the applicant's answer: `sendToCareers()` gives up after 10 s and never throws, and success is success whether the email went, failed or was skipped.
- **The email:** to `CAREERS_MAIL_TO`, from `CAREERS_MAIL_FROM` (an address on `updates.kdconstructions.net`, the domain verified in Resend), `reply_to` the applicant, subject `New application: <name> for <role>`, HTML and text with every field the applicant filled, the time in IST and a link to `/studio/applications#application-<id>` on `PUBLIC_SITE_URL`. The resume goes under the applicant's own file name, with the extension and content type of what the file really is; over 10 MB (`MAX_ATTACH_BYTES`) it is left off and the body says it is in the studio. The form takes 5 MB, so today every resume is attached. No em dash in any of it.
- **The record:** `job_applications.mail_status` is `sent: <Resend id>`, `failed: <reason>`, `skipped` (no key) or `skipped: dry run`; NULL is "not recorded" (before 2026-11-11, or the UPDATE was refused). `/studio/applications` shows it in the Email column, and `check:db-flows` step 2 fails on a "not recorded" test application, which is how a missing grant shows.
- **The log:** one line per application, `careers-mail: application <id> <sent|failed|skipped> (<Resend id or reason>)`, plus `; mail_status not saved: <MySQL's message>` when the UPDATE fails. Never the key, never the applicant's details; a reason has anything shaped like a key or an address taken out. `CAREERS_MAIL_DRY_RUN=1` prints the whole request instead of sending it (the resume as its size): development only, since that line does hold the applicant's details.
- **Settings** are read at send time (`.env.example`): a key change needs a restart, not a rebuild. With `RESEND_API_KEY` set, `check:db-flows` skips its application steps unless given `--allow-email`.
- `/privacy` names Resend as the email's processor ("Who can see it"); a change of provider changes that sentence too (the fact list at the top of `src/data/legal.ts`).

## Enquiry form on /contact: saved first, then sent through Resend (12 Nov 2026)

The enquiry band on `/contact` (ink, between the cards and the map) posts to `POST /api/enquiry`, which works the careers way: `src/lib/enquiries.ts` is the order, `src/lib/enquiry-mail.ts` the email and its record, `src/lib/enquiry-rules.ts` the field rules (shared by the browser and the server), `src/scripts/enquiry-form.js` the page's script, `/studio/enquiries` the list. OPEN-QUESTIONS.md #78.

- **The order:** spam (honeypot `website`; the signed time token `t` missing, forged or under 3 s old) gets the success answer and nothing is saved or sent; then the rate limit (`ENQUIRY_RATE_PER_HOUR` per address, 5 unset, invalid posts counted; 200 a day in all); then the fields (name, phone, email, message 20 to 2,000 characters; company optional); then the row in `enquiries`; only then the email, which never changes the answer (10 s, never throws).
- **Works without JavaScript:** a plain form post is answered 303 to `/contact?enquiry=sent|invalid|limited|error#enquiry` (and `&fields=` after invalid), which the page draws. No personal detail goes into that address, so a field the server refuses comes back empty. Astro's origin check stays on; the form post passes it through nginx because of `security.allowedDomains`.
- **The email:** to `ENQUIRY_MAIL_TO` (comma-separated, **no default**), from `ENQUIRY_MAIL_FROM` (on `updates.kdconstructions.net`), `reply_to` the sender, subject `New enquiry: <name>` or `New enquiry: <name> from <company>`, every field, the time in IST, a link to `/studio/enquiries#enquiry-<id>`. Same `RESEND_API_KEY` as careers. `ENQUIRY_MAIL_DRY_RUN=1` prints it instead (development only).
- **The record:** `enquiries.mail_status` is `sent: <Resend id>`, `failed: <reason>`, `skipped` (no key), `skipped: no recipients` (key set, `ENQUIRY_MAIL_TO` empty) or `skipped: dry run`; NULL is "not recorded" (the column grant is missing). One log line per enquiry, `enquiry-mail: enquiry <id> <result> (...)`, and one per refused post, `enquiry: not saved, it looked automated (<why>)` or `enquiry: refused, over the rate limit`. Never the key, never the sender's details outside the dry run.
- **Privacy:** the address is stored only as `ip_hash`, an HMAC-SHA256 under a key drawn from `EDIT_SECRET` (so is the time token's); changing `EDIT_SECRET` makes old hashes incomparable with new ones and turns a form left open across the change into "looks automated". `/privacy` says what is collected, why, that Resend delivers it, and that it is kept until K.D. deletes it (`privacy.enquiries.*`, a named section drawn after "When you apply for a job", so no numbered section's key moved). There is no retention rule and the app cannot delete one: `kd_app` has no DELETE on `enquiries`; an administrator removes rows.
- **Keys:** every string is a `contact.enquiry.*` slot, the error lines, "Sending…" and the thank-you card included; the page draws them hidden and shows each when it applies. In edit mode the page's script shows them all so each can be edited (Tailwind's base layer hides `[hidden]` with `!important`, which editor-ui.css cannot undo).
- **`/contact`'s HTML differs on every request** in one value, the form's `name="t" value="..."`. A before/after comparison of served HTML (launch mode, a deploy) masks it first: `sed -E 's/name="t" value="[^"]*"/name="t" value="MASK"/'`.
- **Checks:** `check:db-flows` steps 7–10 (enquiry, form post, spam, rate limit). The two test enquiries stay in the table (named `Deploy check <timestamp> ...`, from `deploy-check@example.com`); the report prints the administrator's DELETE. Steps 7–9 skip when this `.env` has both `RESEND_API_KEY` and `ENQUIRY_MAIL_TO` unless given `--allow-email`; step 10 runs only on a local origin unless given `--rate-limit`, because it uses up the address's hour (a rerun within the hour then fails step 7 with 429: restart the site or wait).

## No em dashes in anything a visitor or a search engine can see

The client's rule, 14 Oct 2026: em dashes (—) read as AI-written. It overrides the "client-approved wording, do not touch the punctuation" notes at the top of the copy modules.

- **In scope:** every `<title>`, meta description, og/twitter tag, JSON-LD, page copy, director bio, card text, caption, alt text, button label, form and error message, the 404, /privacy and /terms, the studio screens, email subjects. Everything in `src/data/*.ts` and any copy written into `.astro` or `.js` files.
- **Out of scope:** code comments, commit messages, `docs/*.md`. But a comment inside an `is:inline` script, and an HTML comment in a template, ship in the page's HTML, so keep em dashes out of those too.
- **Rewrite, don't swap.** Use a comma, a colon, a full stop or "and", whichever makes that sentence read naturally. Never a spaced hyphen (" - "), which is the same tell. Do not change any meaning, fact or figure.
- **Titles:** inner pages are `<Page> | K.D. Constructions`. The homepage tab title is exactly `K.D. Constructions` (its og:title keeps the longer line, `home.meta.ogTitle`).
- **Keep** en dashes (–) in number and date ranges (711–852 sq ft, 14:53–15:00, FY2025–26) and in route names (Panvel–Karjat), and the middle dot (·) in kickers and meta lines ("Director · Inducted 2017").
- Meta descriptions stay at 155 characters or less.
- Composed strings join with ". " (GalleryGrid alt text, sitemap image titles), so a caption that has a colon never produces two.
- Alt text names K.D. Constructions only where the picture shows K.D.'s own work: not on icons, client logos, renderings or images captioned "Representative image". A gallery photograph in a project's group that is not K.D.'s work goes in `NOT_KD_WORK` (src/lib/gallery-alt.ts), and every `galleryAlt()` call for a gallery photograph passes its file.
- **Check:** every page renders on request, so `dist/` holds the server bundle and never a page. Run the built site and `npm run check:served-html -- <origin>` (scripts/check-served-html.mjs): it reads every sitemap URL and the 404 as served and fails on any em dash, except inside Sir's saved text, which the server writes into the page (see below) and which is his to keep. sitemap.xml is checked too. `grep -rn "—" dist/` still shows comments and one Astro framework string only, but that says nothing about the pages.
- A copy string that changes may have a saved override in the server's `content_edits` table that still holds the old text, and gallery captions and job postings are database rows too (`gallery_events`, `job_posting_events`). List the changed edit keys in the report so the server can be checked at the next deploy.

## Saved edits are written into the page on the server

Since 27 Oct 2026 a saved edit (`content_edits`) is in the HTML the server sends, not only painted by the browser afterwards, so link previews, a search engine's first read and visitors without JavaScript see Sir's text. Do not break any of this:

- **Where:** `src/middleware.ts` hands every editable page (a path `normalizePath()` in src/lib/editable.ts accepts) that renders 200 as HTML to `withSavedEdits()` in `src/lib/server-edits.ts`. That reads the latest row per key (`SELECT_LATEST`, the same query GET /api/content runs, imported there) and writes each edit with `ntApplyCore()` from `src/lib/edit-apply.js`, over the page parsed with parse5.
- **One apply function, two runtimes.** `edit-apply.js` is the browser's own apply code: BaseLayout writes its source into the page (`window.__ntApplyCore`) and the head script builds `applyOne()` from it. Change the rules there and nowhere else, keep it self-contained ES5 (it is sent as source text), and keep the rule: first `[data-edit]` in `<body>`, text leaves only, so a retired key writes nothing on either side.
- **Only the slot changes.** The server splices the slot's text and its `data-nt-*` attributes into the rendered string by parse5's source offsets; every other byte is as rendered. Never re-serialise the whole document.
- **No double write:** a slot the server wrote carries `data-nt-server`. The head script's read path (`applyAll`, cache pass and server pass) skips those and still writes every edit the server did not. The editor needs nothing: a server-written slot has the attributes `place()` sets (`data-nt-original`, `-key`, `-applied`, `-edited`).
- **Meta:** a page whose `<title>`, og:title, meta description or og:description is drawn from an edit slot says which on the tag (`data-nt-from`, BaseLayout's `editSources`: the project pages' titles, and a project page whose description is its first paragraph). The server rewrites that tag when it writes the slot. A new page that draws meta from a slot must pass `editSources` too; meta that is its own copy is never touched.
- **Cache:** per page, edits only (never HTML: /careers, /gallery and the project pages render database rows of their own). Dropped by `forgetEdits()` in POST /api/content and /api/content/revert, so a save shows on the next load; any other write shows within 60 s. One Node process; if the site ever runs several, saves still show within 60 s.
- **No database, or no answer in 1 s:** the page goes out with its built-in text, one log line (`server-edits: <path>: ...`), never a 500, and the browser's read path applies what it can fetch. `SERVER_EDITS=0` in `.env` switches the whole thing off, read at request time.
- **Checks:** `npm run check:served-edits -- <origin>` (scripts/check-served-edits.mjs, read-only) reads every page without JavaScript and says, per saved edit, written or retired, with the meta and the anchoring count a deploy compares before and after. A changed default under a key that has a saved edit does not show (the saved text wins): list every key whose default text changes in the report, as before.

## Motion moves things; it never changes where they rest

Light motion was added on 14 Oct 2026 at the client's request: nav menu items one by one, scroll reveal, hover, the homepage hero's entrance. All of it is `src/styles/motion.css` plus `src/scripts/reveal.js`; DESIGN-SYSTEM.md §11 has the summary.

- **Timing lives in motion.css §0 and nowhere else.** Every duration, stagger, travel distance, curve and the reveal's trigger is a `--kd-motion-*` custom property there; rules only use `var()`, and reveal.js holds no numbers (it reads the trigger from §0 and waits on the browser's own transitions). `--kd-motion-pace` scales every duration at once. Never hard-code a timing in a rule or a script.
- **Opacity and transform only.** Never animate width, height, margin, top/left or anything else that moves layout. The one other property is the nav menu panel's `clip-path` unroll (motion.css §1), which moves nothing and ends clipping nothing; a panel that should grow is clipped open, never resized. A finished animation must leave the page exactly as it was without one; prove that with the element-by-element comparison (box and computed style of every element, every route, at 1280) against the commit before.
- **Visible by default.** Nothing may be hidden by CSS alone. Hide-before-reveal (`data-reveal`) is set only by reveal.js, only on blocks below the fold, and only under `html.kd-motion`, which the inline head script in BaseLayout adds.
- **Every rule keeps the gates:** `:root.kd-motion:not([data-nt-mode])`, inside `@media screen and (prefers-reduced-motion: no-preference)`; hover rules also inside `(hover: hover)`. Edit mode (`data-nt-mode`), reduced motion, /studio and no-script all mean no motion.
- **New bands, cards and grids need nothing.** reveal.js walks every `main section > .max-w-kd` and takes `.grid` children as items. A block that rests with its own opacity or transform is skipped, so a block given one of those utilities will no longer reveal. A new card gets the hover rule with `data-card="light"` or `"dark"` (add `framed` if it has a 1px border all round). A new button gets a hover too: an arrow (Arrow.astro nudges on its own), or `data-button="rule"` on a mint button without one, or `hover:` and `focus-visible:` `text-kd-mint border-kd-mint` on a ghost button (DESIGN-SYSTEM §6).
- **Do not fade the homepage hero's copy from zero.** The headline (the sub-paragraph on phones) is the page's LCP element, not the photograph, and text at opacity 0 does not count as painted. The fade starts at 35% so LCP stays at first paint.

## Headers, links, icons and images (28 Oct 2026)

- **Security headers live in `src/middleware.ts`** (`SECURITY_HEADERS`): nosniff, Referrer-Policy, X-Frame-Options SAMEORIGIN, a Permissions-Policy that switches off camera, microphone and location. **No HSTS and no CSP**, by decision; do not add either without asking. Files under `public/` and `/_astro/` are served before the middleware and carry none of them (PRE-LAUNCH.md, the 2026-10-28 deploy note).
- **A link that opens a new tab** carries `rel="noopener noreferrer"`.
- **Icons:** `npm run favicon:build` writes favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png and site.webmanifest from `kd_logo.jpg` and `--kd-ink` in tokens.css. Re-run it rather than editing any of them by hand.
- **Images:** the hero is `loading="eager"` with `fetchpriority="high"`; everything below the fold is `loading="lazy"` and `decoding="async"` (Astro's `<Image>` adds the decoding itself); every `<img>` with a picture has a width and height.
- **Breadcrumbs:** a page below the top level passes `breadcrumbs` to BaseLayout. The middle crumb is the nav's own label at a real page (`/projects`, `/about`), never a `#section` of one.

## Share cards, accessibility and print (29 Oct 2026)

- **Share cards:** every og:image is at least 1200 × 630 (`npm run check:served-html` fails one that is not). Astro never enlarges, so a page photograph smaller than that needs an enlarged copy in `src/assets/share/` (`npm run share-images:build`, src/lib/share-image.ts); without one the page gets the designed card. Canonical, og:url and og:image follow `PUBLIC_SITE_URL`. Titles and meta descriptions are unique per page.
- **Accessibility scan:** `npm run check:a11y -- <origin>` (scripts/check-a11y.mjs, axe-core) on every sitemap page at 1280 and 390 must PASS. Colour contrast is listed, never failed and never fixed here: the colours are the client's.
- **A `<dl>` holds only `<dt>`, `<dd>` and `<div>` groups of them.** A pending tile's "To be added" chip sits inside its `<dt class="contents">` with the title in a span, so the tile looks as it did.
- **Focus:** never remove the focus ring (`outline-none`, `focus:outline-none`) on anything a visitor can tab to. A stretched link or button over an `overflow-hidden` card takes `focus-visible:-outline-offset-4`, or its ring is clipped away. A control with no visible text has an `aria-label`.
- **Nav menus:** the script in Nav.astro keeps each drop-down link's `aria-expanded` true while its menu shows (hover or focus, in CSS) and shuts it on Escape with the `hidden` attribute; Escape also shuts the phone drawer. In edit mode Escape is the editor's.
- **Print:** src/styles/print.css, every rule inside `@media print`. A page opts in with `data-print` on `<main>` (the project and plant pages); anything else to leave off the paper gets `data-no-print`. Black and white there are keywords, not tokens.

## Launch mode: placeholders off the public site (31 Oct 2026, a live switch since 4 Nov 2026)

The launch rule (PRE-LAUNCH.md): anything Sir has not answered by launch is removed. Launch mode does it without deleting data; `src/lib/launch.ts` has the rules. OPEN-QUESTIONS.md #73.

- **A live switch:** `/studio/launch`, signed-in editors only, 404 to anyone else, with no rebuild, restart or deploy (`src/lib/launch-switch.ts`). Every page renders on request, so the renderers ask per request; it shows on the next load in the process that took the flip, within 5 s in any other. Every flip is logged in `site_settings_events` and listed on the page.
- **Fails to off:** no table, no row, no grant, no database or no answer in 1 s means off, with one log line and never a 500. The site is then what it was before the switch existed.
- **`site_settings` is append-only**, like `content_edits`, because `kd_app` has no UPDATE: a flip is a new row and the highest id per key is current. Do not change it to an upsert; that needs a grant the app must not have.
- **`HIDE_PENDING=1` at build time stays as the override** (astro.config.mjs, a Vite define): it forces launch mode on for every visitor, the API refuses to flip, and only a rebuild without it turns it off. `check-placeholders` and `build:release` still read it.
- **A signed-in editor sees everything**, launch mode or not, in or out of edit mode, because the server cannot tell edit mode (`src/lib/launch-editor.ts`). `/launch-badges.js` marks what launch mode would take off by asking for the same page as launch mode leaves it, so it knows no rules. A valid `kd_edit` session is what decides all of this, never `kd_edit_ui`.
- **Two views of an editor's own** (OPEN-QUESTIONS.md #74): the `kd_launch_view` cookie, `off`, `preview` or `removed`, set by two buttons in the floating bar beside "Edit text"; /studio/launch's Preview sets the same cookie. "Launch preview" is the page a visitor gets with the switch on, by the same code path (`hiding()` in src/lib/launch.ts), so a new hide rule needs nothing here. "This is what was removed" is the ordinary page with what would go marked in yellow by outline and box-shadow, so nothing moves; `/launch-badges.js` finds it the way it finds the badges. In both, edit mode is off, "Edit text" is disabled and the response is `Cache-Control: private, no-store`. Neither writes a setting or a log row. The buttons and the yellow live in `public/launch-badges.js` and `public/editor-ui.css`, so a signed-in page in the ordinary view keeps its bytes; only a 404 gains the script's tag, for the buttons.
- **Filling a hidden placeholder publishes it:** a saved edit counts as answered, so with the switch on that card comes back to the public on the next load.
- **Off, the public's HTML stays byte-identical**, so compare the served HTML of every sitemap page with the commit before (on `/contact`, mask the form's time token first: the enquiry form section above). Editor tooling therefore never goes in a bundled script or a component: a change to `inline-edit.js` or anything BaseLayout imports changes a hashed file name in every page. It goes in `public/` or is spliced in by `launch-editor.ts`. Tailwind scans all of `src/`, comments included, so a new word that is also a utility class (`invisible`, say) changes the stylesheet's hash too.
- **Hide by skipping, never by renumbering.** A renderer filters a pending item out and keeps every other item on its own array index, as with `retired`.
- **Never strand a saved edit.** A unit (card, tile, row, section, gallery block, project) goes only while no `content_edits` key lands inside it (`launch.hides(prefix)`); otherwise it is drawn exactly as in review. An unconfirmed project kept that way is drawn as review whole, its question included.
- **A new renderer of a `pending` item** asks `launchFor()` and gets a line in `launchKind()` (src/lib/launch-report.ts), or `check:placeholders` (launch mode) and `report:pending` fail on it.
- **Checks:** `npm run report:pending` (what goes, page by page, against PRE-LAUNCH.md's count; the rules are `src/lib/launch-report.ts`, which the switch's confirm dialog reads too); with launch mode on, `node scripts/pending-report.mjs <origin> --served` must PASS.

## Photo credit in the files (4 Nov 2026)

K.D.'s own photographs carry "K.D. Constructions" inside the file, and keep it when served: EXIF Artist and Copyright, IPTC By-line, Credit and Copyright Notice, XMP creator, credit and rights (copyright lines read "© K.D. Constructions"). OPEN-QUESTIONS.md #72.

- **Which files:** `scripts/photo-classes.mjs` sorts every image under src/assets and public into REAL, AI, GRAPHIC or UNSURE, and only REAL is credited. A new file in a photograph folder counts as REAL; a work that is not plainly K.D.'s gets a line there with its reason.
- **One writer:** `src/lib/photo-credit.ts` splices the credit into a JPEG's or WebP's container, after encoding, and writes nothing read from a file. No picture data is touched, so it can never be a re-encode. Do not use sharp's `keepMetadata()` anywhere: it would bring back a phone's GPS.
- **After `build-gallery`, `build-share-images` or `build-hero-video --poster`** run `npm run photos:credit`: they write fresh files with no metadata. `npm run check:photo-credit` fails until then.
- **Served files:** `/_image` runs Astro's sharp service, then `src/lib/image-service.ts` hands the source's credit on to the rendition, the same compressed bytes plus the credit. A source without it comes out as before. Files under public/ and /_astro are served as they are.
- **URLs did not move:** `scripts/keep-photo-urls.mjs` keeps each credited photograph's old hash in its file name (`scripts/photo-asset-names.json`), so the credit did not change a byte of any page. A later change to a photograph stops matching and gets a new name by itself.
- **Studio uploads:** `store()` in src/lib/gallery-media.ts credits all three renditions as it writes them, and cannot tell K.D.'s photograph from anyone else's. Uploads made before this date have no credit and are not rewritten by a deploy.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
