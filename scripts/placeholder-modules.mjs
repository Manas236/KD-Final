/* ============================================================
   The copy exports that can carry a placeholder, and where they render
   ------------------------------------------------------------
   Shared by scripts/check-placeholders.mjs (the go-live gate) and
   scripts/pending-report.mjs (what launch mode takes off), so the two
   always read the same pages. The list and the rules live in
   src/lib/launch-report.ts since 4 Nov 2026, because /studio/launch reads
   them too; loading a row's copy module is the part only a script does.
   ============================================================ */
export { MODULES, launchKind, pendingItems } from "../src/lib/launch-report.ts";

/** Every page a row stands for: its route, the copy it renders, and
    the base of check-placeholders.mjs' printed key. */
export async function pagesOf({ file, exportName, route, each }) {
  const mod = await import(file);
  return each
    ? Object.entries(mod[exportName]).map(([k, v]) => ({ route: `${route}/${k}`, base: [exportName, k], copy: v }))
    : [{ route, base: [exportName], copy: mod[exportName] }];
}
