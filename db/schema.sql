-- ============================================================
-- K.D. Constructions — database schema
-- ------------------------------------------------------------
-- One table. Run once against your MySQL server:
--
--   mysql -u root -p < db/schema.sql
--
-- The database name here must match DB_NAME in your .env file.
-- ============================================================

CREATE DATABASE IF NOT EXISTS kd_construction
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kd_construction;

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
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- job_posting_events — the job cards on /careers, added and removed
-- from the page itself in edit mode (src/pages/api/careers.ts).
--
-- APPEND-ONLY, like content_edits, so the app still needs nothing but
-- SELECT and INSERT:
--
--   add     a row with action = 'add'; its own id IS the posting id
--   remove  a row with action = 'remove' and posting_id = that id
--
--   open postings = the 'add' rows with no 'remove' row pointing at them
--
-- Wording changes after a card is added go through content_edits like
-- any other text, under the keys careers.jobs.<id>.title / .body.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_posting_events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  action        ENUM('add', 'remove') NOT NULL,
  posting_id    INT           NULL,
  title         VARCHAR(160)  NULL,
  details       VARCHAR(300)  NULL,
  linkedin_url  VARCHAR(500)  NULL,
  indeed_url    VARCHAR(500)  NULL,
  client_ip     VARCHAR(45)   NULL,
  user_agent    VARCHAR(255)  NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_posting (action, posting_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------
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
-- ------------------------------------------------------------
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

-- Installs created before uploads (3 Oct 2026) need the new action:
--   ALTER TABLE gallery_events
--     MODIFY action ENUM('hide', 'show', 'move', 'caption', 'undo', 'add') NOT NULL;

-- ------------------------------------------------------------
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
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- project_text_events — headings and paragraphs added to a
-- /projects/<slug> page in edit mode (src/lib/project-blocks.ts).
-- The app also creates this table on first use if it is missing.
--
-- APPEND-ONLY:
--   add     page_slug, kind, text; its own id IS the block id
--   remove  block_id
--   move    block_id, position = its new index on the page
-- A block's later wording edits are ordinary content_edits rows under
-- the key projects.blocks.<id>.
-- ------------------------------------------------------------
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

-- ============================================================
-- After running this, confirm:
--
--   USE kd_construction; SHOW TABLES;      -- expect content_edits, gallery_events, gallery_uploads, job_posting_events
--
-- SELECT and INSERT are all the app ever uses — the table is
-- append-only, and a revert INSERTs a new row carrying the older text:
--
--   GRANT SELECT, INSERT ON kd_construction.content_edits TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.job_posting_events TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.gallery_events TO 'kd_app'@'localhost';
--   GRANT SELECT, INSERT ON kd_construction.gallery_uploads TO 'kd_app'@'localhost';
-- ============================================================
