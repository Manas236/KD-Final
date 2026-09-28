/** Turns a project title into a URL segment. The single source for that
    conversion — used both to build `/projects` card links and to resolve
    `/projects/[slug]` — so the two can never drift apart. Lossy (accents,
    punctuation and the "&" all collapse), which is fine for the short,
    plain-English titles this project actually has. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
