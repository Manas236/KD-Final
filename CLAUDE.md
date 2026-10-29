## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## The KD test server: work there goes through its own Claude Code session

A Claude Code session runs on the KD test server (hostname `ip-172-26-8-71`, site at `/srv/kd-site`). The user relays between that session and the one on the development PC. Which half of this applies to you depends on where you are running — check `hostname` if unsure.

**If you are NOT on `ip-172-26-8-71`** (the development PC):

- Never give the user shell commands to run on the server. For anything that has to run there — a database check, a deploy, reading a log — write a **prompt for the server's Claude Code session** instead. The user pastes it there and pastes the report back to you.
- The prompt opens with a box check: run `hostname`; if it is not exactly `ip-172-26-8-71`, stop, say which machine it is, and do nothing else.
- The prompt is self-contained. The server session has none of your conversation, so say what to do and why, where (`/srv/kd-site`), what must not change (state "read-only" when it is a check), and exactly what to report back.
- Do not treat a check as done until the report comes back. Record what it says, not what you expected.

**If you ARE on `ip-172-26-8-71`:** prompts relayed by the user from the development-PC session are how work reaches you. Run the box check they open with, stay inside what the prompt allows, and report back in the form it asks for.

## The database schema comes from db/migrate.sql, never from the app

The site's database user (`kd_app` on a server) has SELECT and INSERT on every table, plus DELETE on `job_applications`, and nothing else. App code must never run CREATE, ALTER, DROP or any other schema statement — MySQL refuses even `CREATE TABLE IF NOT EXISTS` on an existing table to a user without CREATE.

- A new table or column goes into `db/migrate.sql`: idempotent, a table created only if missing, a column added only after an `information_schema` check.
- A new table also gets its grant line at the foot of that file.
- A new kind of write needs nothing beyond SELECT and INSERT (DELETE only on `job_applications`). If it does, stop and ask the user — do not widen `kd_app`'s grants.
- PRE-LAUNCH.md, "Deploy and migration order", runs the migration as a database administrator before the app restarts; `npm run check:db-flows` then proves the five write flows work with `kd_app`'s rights.

## No em dashes in anything a visitor or a search engine can see

The client's rule, 14 Oct 2026: em dashes (—) read as AI-written. It overrides the "client-approved wording, do not touch the punctuation" notes at the top of the copy modules.

- **In scope:** every `<title>`, meta description, og/twitter tag, JSON-LD, page copy, director bio, card text, caption, alt text, button label, form and error message, the 404, /privacy and /terms, the studio screens, email subjects. Everything in `src/data/*.ts` and any copy written into `.astro` or `.js` files.
- **Out of scope:** code comments, commit messages, `docs/*.md`. But a comment inside an `is:inline` script, and an HTML comment in a template, ship in the page's HTML, so keep em dashes out of those too.
- **Rewrite, don't swap.** Use a comma, a colon, a full stop or "and", whichever makes that sentence read naturally. Never a spaced hyphen (" - "), which is the same tell. Do not change any meaning, fact or figure.
- **Titles:** inner pages are `<Page> | K.D. Constructions`. The homepage tab title is exactly `K.D. Constructions` (its og:title keeps the longer line, `home.meta.ogTitle`).
- **Keep** en dashes (–) in number and date ranges (711–852 sq ft, 14:53–15:00, FY2025–26) and in route names (Panvel–Karjat), and the middle dot (·) in kickers and meta lines ("Director · Inducted 2017").
- Meta descriptions stay at 155 characters or less.
- Composed strings join with ". " (GalleryGrid alt text, sitemap image titles), so a caption that has a colon never produces two.
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

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
