-- ============================================================
-- 2026-10-21 · /about merge: copy saved text edits onto /about
-- ------------------------------------------------------------
-- On 21 Oct 2026 /company, /capabilities, /resources, /clients and /csr
-- became sections of /about, and their addresses answer 301 there
-- (OPEN-QUESTIONS.md #58). Every piece of text in those sections kept
-- its edit key: `clients.sections.1.items.0.title` on /about is the key
-- it was on /clients. But content_edits is keyed on (page_path,
-- edit_key), and /about only reads rows filed under '/about', so a text
-- edit saved on one of the five pages stops showing until its row is on
-- /about too. This script puts it there.
--
-- IT ONLY COPIES. Nothing is updated, moved or deleted: every row on the
-- five old pages stays exactly as it is, and each copy is a new row on
-- '/about' with the same key, the same texts, the same audit columns and
-- the same created_at. Rows are copied in id order, so the newest copy of
-- a key is the copy of its newest row and /about shows what the old page
-- showed. A key's whole history is copied, so "Undo" on /about walks
-- back through it as it did on the old page.
--
-- NO KEY IS RENAMED. The five pages' keys have five different first
-- segments (company., capabilities., resources., clients., csr.), so no
-- two of them, and none of /about's own (about.), can collide.
--
-- A KEY /about ALREADY HAS IS SKIPPED, all of its rows, and listed: an
-- edit made on /about wins over the old page's. That is also what makes
-- the script safe to run twice: the second run finds every key already
-- on /about and copies nothing.
--
-- Some keys are copied but never drawn on /about: an old page's own nav,
-- footer and closing CTA keys (`company.nav.*`, `clients.cta.*`). /about
-- has its own nav and footer (`about.*`) and the five CTAs are retired.
-- They are copied all the same, every row as asked, and the listing
-- marks them "not drawn on /about".
--
-- No other table holds a page path: gallery_events and gallery_uploads
-- name project groups, project_text_events a /projects/<slug> page, and
-- job_posting_events and job_applications are /careers' own. So this is
-- the whole migration.
--
-- HOW TO RUN, as a database administrator, AFTER a database backup
-- (PRE-LAUNCH.md, "Deploy and migration order"):
--
--   dry run (the default: lists what it would copy, changes nothing)
--     sudo mysql < db/migrations/2026-10-21-about-merge.sql
--
--   the real run (copies)
--     sudo mysql -e "SET @kd_apply = 1; SOURCE db/migrations/2026-10-21-about-merge.sql"
--
-- Each run prints: every key on the five pages with its rows and what
-- this run does with it, then a one-line summary.
-- ============================================================

USE kd_construction;

-- Dry run unless the caller set @kd_apply = 1 first.
SET @kd_apply := IF(@kd_apply = 1, 1, 0);

-- 1. Every key on the five old pages, and what this run does with it.
--    Worked out before anything is copied, so the real run lists the
--    same thing its dry run did.
SELECT s.page_path                         AS from_page,
       s.edit_key                          AS edit_key,
       COUNT(*)                            AS rows_on_old_page,
       MAX(s.id)                           AS newest_id,
       IF(a.edit_key IS NOT NULL,
          'SKIPPED: /about already has this key',
          IF(@kd_apply = 1, 'copied', 'would copy'))
                                           AS this_run,
       IF(s.edit_key REGEXP '^[a-z]+[.](nav|footer|cta)[.]',
          'not drawn on /about', 'drawn on /about')
                                           AS on_about
  FROM content_edits s
  LEFT JOIN (SELECT DISTINCT edit_key FROM content_edits WHERE page_path = '/about') a
         ON a.edit_key = s.edit_key
 WHERE s.page_path IN ('/company', '/capabilities', '/resources', '/clients', '/csr')
 GROUP BY s.page_path, s.edit_key, a.edit_key
 ORDER BY s.page_path, s.edit_key;

-- 2. The copy, on the real run only. The keys /about already has are
--    read into a derived table first, so the rows this statement adds
--    cannot change what it skips.
INSERT INTO content_edits
       (page_path, edit_key, original_text, new_text, client_ip, user_agent, created_at)
SELECT '/about', s.edit_key, s.original_text, s.new_text, s.client_ip, s.user_agent, s.created_at
  FROM content_edits s
  LEFT JOIN (SELECT DISTINCT edit_key FROM content_edits WHERE page_path = '/about') a
         ON a.edit_key = s.edit_key
 WHERE @kd_apply = 1
   AND s.page_path IN ('/company', '/capabilities', '/resources', '/clients', '/csr')
   AND a.edit_key IS NULL
 ORDER BY s.id;
SET @kd_copied := ROW_COUNT();

-- 3. What this run did.
SELECT IF(@kd_apply = 1, 'REAL RUN', 'DRY RUN, nothing changed') AS mode,
       (SELECT COUNT(*) FROM content_edits
         WHERE page_path IN ('/company', '/capabilities', '/resources', '/clients', '/csr'))
                                                      AS rows_on_old_pages,
       IF(@kd_apply = 1, @kd_copied, 0)               AS rows_copied_now,
       (SELECT COUNT(*) FROM content_edits WHERE page_path = '/about')
                                                      AS rows_on_about_now;
