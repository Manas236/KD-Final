-- ============================================================
-- K.D. Constructions — database migration
-- ------------------------------------------------------------
-- The ONE place the shape of the database is defined. It creates the
-- database and every table the site uses, and brings an older install
-- up to date.
--
-- THE SITE NEVER CHANGES THE SCHEMA ITSELF. Its database user, kd_app,
-- may only SELECT and INSERT (plus DELETE on job_applications — see the
-- grants at the foot of this file). So this script is run by a database
-- ADMINISTRATOR, and it is run BEFORE the app is (re)started, on every
-- deploy:
--
--   sudo mysql < db/migrate.sql            Ubuntu server: MySQL's root
--                                          user over the local socket
--   mysql -u <admin> -p < db/migrate.sql   an administrator with a
--                                          password
--
-- Never as kd_app: the first statement below stops the script if it is.
--
-- SAFE TO RUN ANY NUMBER OF TIMES. Tables are created only if they are
-- missing. A column is added or widened only after information_schema
-- says it is needed. Nothing is ever dropped, renamed or deleted, and no
-- row is touched. Each run ends by printing what it did, table by table.
--
-- The database name below must match DB_NAME in .env. It is
-- kd_construction on every install so far; if one ever differs, change
-- the CREATE DATABASE and USE lines together.
--
-- PRE-LAUNCH.md ("Deploy and migration order") has where this sits in a
-- deploy.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Not as the site's own user.
--
-- Written as a statement that cannot be prepared, so the mysql client
-- stops at it with the reason in the error ("Unknown column 'STOP …'")
-- before anything else runs. For any other user without the rights the
-- first CREATE below is refused the same way, also before any change.
-- ------------------------------------------------------------
SET @kd_step := IF(SUBSTRING_INDEX(CURRENT_USER(), '@', 1) = 'kd_app',
  'SELECT `STOP - run db/migrate.sql as an admin, not as kd_app` FROM DUAL',
  'DO 0');
PREPARE kd_step FROM @kd_step;
EXECUTE kd_step;
DEALLOCATE PREPARE kd_step;

CREATE DATABASE IF NOT EXISTS kd_construction
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kd_construction;

-- Which tables were here before this run, for the report at the end.
SET @kd_had := (
  SELECT IFNULL(GROUP_CONCAT(table_name), '')
    FROM information_schema.tables
   WHERE table_schema = DATABASE()
);

-- ------------------------------------------------------------
-- 1. The tables, each as it stands today.
-- ------------------------------------------------------------

-- content_edits — in-page text edits made through the site itself.
--
-- Schema is Nesting Tree's, unchanged. What is stored in `edit_key` is
-- NOT.
--
-- Nesting Tree put a positional DOM path in that column —
-- `section:nth-of-type(2)>div:nth-of-type(1)>p:nth-of-type(3)` — which
-- is why it needs 512 characters. Any markup change renumbered those
-- paths and any copy rewrite orphaned the row's anchor; 86 of its keys
-- ended up inert, discovered after 350 rows had accumulated.
--
-- This table stores a DECLARED NAMED SLOT instead: the literal string
-- an author wrote into a `data-edit` attribute, mirroring the copy
-- object's path — `home.hero.headline`, `home.capabilities.cards.0.title`.
-- It survives the section around it being rewritten, re-wrapped or
-- re-worded, because nothing computes it. See src/lib/editable.ts.
--
-- The column is left at VARCHAR(512) even though a named key will
-- realistically use 40 of them: matching Nesting Tree's DDL exactly
-- means a dump from either side can be read by the other, and there is
-- no cost to the headroom.
--
-- APPEND-ONLY. Nothing is ever UPDATEd or DELETEd: every save is a new
-- row, so the table is the full history of a piece of copy.
--
--   current value for a key = the row with the highest id
--   revert                  = INSERT a new row carrying an older new_text
--
-- MySQL caps a utf8mb4 index key at 767 bytes, so the composite index
-- takes a 191-character prefix of edit_key — plenty to narrow a lookup
-- to a handful of rows.
--
-- client_ip / user_agent are audit columns: who made this change. Writes
-- are behind a single SHARED passphrase, so the session says an editor was
-- signed in but never which person — these two are the only record of where
-- an edit came from. They are NEVER returned to the browser: every SELECT
-- the API serves names its columns explicitly and leaves these two out.
-- VARCHAR(45) is the longest an IPv6 address can print. Both are NULL when
-- the address cannot be trusted; a placeholder would be worse than an
-- absence.
CREATE TABLE IF NOT EXISTS content_edits (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  page_path     VARCHAR(255)  NOT NULL,
  edit_key      VARCHAR(512)  NOT NULL,
  original_text TEXT          NOT NULL,
  new_text      TEXT          NOT NULL,
  client_ip     VARCHAR(45)   NULL,
  user_agent    VARCHAR(255)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_page (page_path),
  INDEX idx_page_key (page_path, edit_key(191))
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- job_posting_events — the job cards on /careers, added and removed
-- from the page itself in edit mode (src/pages/api/careers.ts).
--
-- APPEND-ONLY, like content_edits, so the app needs nothing but SELECT
-- and INSERT:
--
--   add     a row with action = 'add'; its own id IS the posting id
--   remove  a row with action = 'remove' and posting_id = that id
--
--   open postings = the 'add' rows with no 'remove' row pointing at them
--
-- Wording changes after a card is added go through content_edits like
-- any other text, under the keys careers.jobs.<id>.title / .body.
--
-- open_days (added 2026-10-08): how long an 'add' row's card is listed,
-- 1-30 days from created_at; NULL counts as 30. Section 2 adds it to a
-- table created before then.
CREATE TABLE IF NOT EXISTS job_posting_events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  action        ENUM('add', 'remove') NOT NULL,
  posting_id    INT           NULL,
  title         VARCHAR(160)  NULL,
  details       VARCHAR(300)  NULL,
  linkedin_url  VARCHAR(500)  NULL,
  indeed_url    VARCHAR(500)  NULL,
  open_days     TINYINT UNSIGNED NULL,
  client_ip     VARCHAR(45)   NULL,
  user_agent    VARCHAR(255)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_posting (action, posting_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- gallery_events — changes made in the studio gallery manager
-- (/studio/gallery): which photographs show, in which project group,
-- in what order, under what caption.
--
-- src/data/gallery.ts is the BASELINE and src/data/gallery-library.ts
-- the photographs not on the site. The live gallery is the baseline
-- with these events replayed over it in id order (src/lib/gallery-live.ts).
-- If this table cannot be read, the site shows the baseline.
--
-- APPEND-ONLY, like the two tables above:
--   hide     file            take a photograph off the site
--   show     file            put a hidden or library photograph back
--   move     file, target_group, position   move it (or reorder it
--                            within its own group); position NULL = end
--   caption  file, caption   new caption, shown everywhere the photo is
--   undo     ref_id          cancel event ref_id; undoing an undo puts
--                            the change back
--   add      file, target_group, caption   a photograph uploaded in the
--                            studio (gallery_uploads holds its details)
-- An undo never deletes anything, so the table is the whole history.
--
-- 'add' arrived with uploads (3 Oct 2026); section 2 widens the action
-- column of a table created before then.
CREATE TABLE IF NOT EXISTS gallery_events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  action        ENUM('hide', 'show', 'move', 'caption', 'undo', 'add') NOT NULL,
  file          VARCHAR(120)  NULL,
  target_group  VARCHAR(160)  NULL,
  position      INT           NULL,
  caption       VARCHAR(300)  NULL,
  ref_id        INT           NULL,
  client_ip     VARCHAR(45)   NULL,
  user_agent    VARCHAR(255)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ref (ref_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- gallery_uploads — photographs uploaded through the studio
--
-- One row per upload. The files themselves are on disk under MEDIA_DIR
-- (src/lib/gallery-media.ts), NOT in the repo and NOT in dist/, so a
-- deploy never touches them — and so they need their own backup.
-- `file` is the name every other table and page uses
-- (up-YYYYMMDD-<8 hex>.jpg); `hash` is its dHash (src/lib/dhash.ts).
-- original_name is what the editor's computer called it, for the
-- audit trail only. APPEND-ONLY: an upload is taken off the site with
-- a `hide` event, never by deleting this row or its files.
CREATE TABLE IF NOT EXISTS gallery_uploads (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  file           VARCHAR(120)  NOT NULL,
  width          INT           NOT NULL,
  height         INT           NOT NULL,
  bytes          INT           NOT NULL,
  hash           CHAR(16)      NOT NULL,
  original_name  VARCHAR(255)  NULL,
  client_ip      VARCHAR(45)   NULL,
  user_agent     VARCHAR(255)  NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_file (file)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- project_text_events — headings and paragraphs added to a
-- /projects/<slug> page in edit mode (src/lib/project-blocks.ts).
--
-- APPEND-ONLY:
--   add     page_slug, kind, text; its own id IS the block id
--   remove  block_id
--   move    block_id, position = its new index on the page
-- A block's later wording edits are ordinary content_edits rows under
-- the key projects.blocks.<id>.
CREATE TABLE IF NOT EXISTS project_text_events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  action        ENUM('add', 'remove', 'move') NOT NULL,
  page_slug     VARCHAR(160)  NOT NULL,
  block_id      INT           NULL,
  kind          ENUM('heading', 'paragraph') NULL,
  text          TEXT          NULL,
  position      INT           NULL,
  client_ip     VARCHAR(45)   NULL,
  user_agent    VARCHAR(255)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (page_slug)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- job_applications — the "Apply here" form on /careers
-- (src/pages/api/apply.ts, src/lib/applications.ts). One row per
-- application; the resume itself is on disk under
-- MEDIA_DIR/applications/ (not served by /media — editors download it
-- from /studio/applications). `emailed` records whether the copy to HR
-- was accepted by the mail server. NOT append-only, unlike the tables
-- above: the privacy policy (/privacy) promises deletion on request and
-- after 24 months, so the app DELETEs rows (src/lib/applications.ts).
CREATE TABLE IF NOT EXISTS job_applications (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120)  NOT NULL,
  email          VARCHAR(254)  NOT NULL,
  phone          VARCHAR(30)   NOT NULL,
  role           VARCHAR(160)  NOT NULL,
  message        TEXT          NULL,
  resume_file    VARCHAR(80)   NOT NULL,
  original_name  VARCHAR(255)  NULL,
  bytes          INT           NOT NULL,
  emailed        TINYINT(1)    NOT NULL DEFAULT 0,
  client_ip      VARCHAR(45)   NULL,
  user_agent     VARCHAR(255)  NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Columns that tables created before a given date lack.
--
-- Each is a look in information_schema, then the ALTER only if it is
-- needed — prepared, because plain SQL has no IF outside a routine.
-- A table created by section 1 already has the column, so on a fresh
-- install both report "already right".
-- ------------------------------------------------------------

-- job_posting_events.open_days (2026-10-08). The app used to add this
-- itself on first use; it no longer may.
SET @kd_open_days := (
  SELECT COUNT(*) = 0
    FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'job_posting_events'
     AND column_name = 'open_days'
);
SET @kd_step := IF(@kd_open_days,
  'ALTER TABLE job_posting_events ADD COLUMN open_days TINYINT UNSIGNED NULL AFTER indeed_url',
  'DO 0');
PREPARE kd_step FROM @kd_step;
EXECUTE kd_step;
DEALLOCATE PREPARE kd_step;

-- gallery_events.action gains 'add' (3 Oct 2026). Widening an ENUM at
-- its end keeps every existing value as it is.
SET @kd_gallery_add := (
  SELECT COUNT(*) = 0
    FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'gallery_events'
     AND column_name = 'action'
     AND column_type LIKE '%''add''%'
);
SET @kd_step := IF(@kd_gallery_add,
  'ALTER TABLE gallery_events MODIFY action ENUM(''hide'', ''show'', ''move'', ''caption'', ''undo'', ''add'') NOT NULL',
  'DO 0');
PREPARE kd_step FROM @kd_step;
EXECUTE kd_step;
DEALLOCATE PREPARE kd_step;

-- ------------------------------------------------------------
-- 3. What this run did.
-- ------------------------------------------------------------
SELECT name AS `table`,
       IF(FIND_IN_SET(name, @kd_had), 'already there', 'created') AS result
  FROM (
    SELECT 'content_edits' AS name
    UNION ALL SELECT 'job_posting_events'
    UNION ALL SELECT 'gallery_events'
    UNION ALL SELECT 'gallery_uploads'
    UNION ALL SELECT 'project_text_events'
    UNION ALL SELECT 'job_applications'
  ) AS wanted;

SELECT 'job_posting_events.open_days' AS `column`,
       IF(@kd_open_days, 'added', 'already right') AS result
UNION ALL
SELECT 'gallery_events.action (with ''add'')',
       IF(@kd_gallery_add, 'widened', 'already right');

SELECT CONCAT('Migration complete on ', DATABASE(), ' as ', CURRENT_USER(), '.') AS done;

-- ============================================================
-- The site's own user — NOT run by this script.
--
-- kd_app is created once per server, by an administrator, and needs
-- exactly these rights and no others. SELECT and INSERT are all the app
-- uses on the first five tables, which are append-only (a revert or an
-- undo INSERTs a new row); job_applications also needs DELETE, for the
-- deletion /privacy promises. No CREATE and no ALTER: schema changes
-- come from this file, run by an administrator.
--
--   GRANT SELECT, INSERT ON kd_construction.content_edits TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.job_posting_events TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.gallery_events TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.gallery_uploads TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.project_text_events TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT, DELETE ON kd_construction.job_applications TO 'kd_app'@'localhost';
--
-- A table added to this file later needs its own GRANT line here, and
-- run on every server, or the app cannot read it.
-- ============================================================
