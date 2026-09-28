/* ============================================================
   Raw media manifest — make new client photos visible to git
   ------------------------------------------------------------
   The client's original photographs live in git-ignored folders at the
   project root (Matunga Images/, Vindhane Plant/, …) — ~3.5 GB, far
   over GitHub's limits. Git therefore cannot say when new ones arrive.
   This script writes raw-media.manifest.txt — one line per original,
   `path <TAB> size in bytes`, sorted — and that file IS committed. After
   dropping new photos in, run:

       npm run media:scan
       git diff raw-media.manifest.txt

   and every `+` line is a new (or changed) original.

   A raw folder is any top-level directory git ignores, except the
   build/tooling ones below — so a new client folder only needs adding
   to .gitignore to be picked up here.
   ============================================================ */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "raw-media.manifest.txt");
const TOOLING = new Set(["node_modules", "dist", ".astro", ".git"]);

function isIgnored(name) {
  try {
    execFileSync("git", ["check-ignore", "-q", `${name}/`], { cwd: ROOT });
    return true;
  } catch {
    return false;
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name !== "desktop.ini" && entry.name !== "Thumbs.db") yield full;
  }
}

const folders = readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !TOOLING.has(e.name) && isIgnored(e.name))
  .map((e) => e.name);

const lines = [];
for (const folder of folders) {
  for (const file of walk(join(ROOT, folder))) {
    lines.push(`${relative(ROOT, file).split("\\").join("/")}\t${statSync(file).size}`);
  }
}
lines.sort((a, b) => a.localeCompare(b));

writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`  wrote ${lines.length} files from ${folders.length} folders to raw-media.manifest.txt`);
