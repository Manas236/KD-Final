/* ============================================================
   Launch mode for a signed-in editor: what they see instead of the public
   ------------------------------------------------------------
   src/middleware.ts asks this for every page request. The answer is
   undefined, and the request is an ordinary visitor's, unless it carries
   a valid `kd_edit` session (the signed cookie, never the kd_edit_ui hint):

     "all"      the whole site, launch mode or not, so a placeholder can
                still be filled. The page also gets /launch-badges.js,
                which marks what launch mode would take off, and carries
                the two buttons below.
     "preview"  the public's view with launch mode ON, whatever the switch
                says: the same code path a visitor gets with the switch on.
     "removed"  the "all" page, with what launch mode would take off marked
                in yellow instead of badged.
     "peek"     the "preview" page with nothing added, for one request:
                /launch-badges.js asks for it to see what would go.

   "preview" and "removed" are this editor's own, set by the kd_launch_view
   cookie (off, preview or removed), which POST /api/launch writes for an
   editor only; without a session it means nothing and changes nothing. Both
   change what one browser is sent and nothing else: no setting, no row.

   So nothing here can reach a visitor. A request with no `kd_edit` cookie
   returns before edit-auth is even loaded, on purpose: that module throws
   at import when EDIT_SECRET is missing (see its note), and a missing
   secret must keep taking down the editor, not every public page.

   Everything added to an editor's page is spliced into the rendered
   string here, not drawn by a component or a bundled script, because the
   public's HTML must stay byte for byte what it is.
   ============================================================ */
export type LaunchView = "all" | "preview" | "removed" | "peek";
export type ViewFlag = "off" | "preview" | "removed";

export const VIEW_COOKIE = "kd_launch_view";
const PEEK_HEADER = "x-kd-launch-peek";

export const isViewFlag = (value: unknown): value is ViewFlag =>
  value === "off" || value === "preview" || value === "removed";

/** HttpOnly, and with no Max-Age it ends with the browser. */
export function viewCookieLine(flag: ViewFlag, request: Request): string {
  const secure = request.headers.get("x-forwarded-proto") === "https" ? "; Secure" : "";
  return `${VIEW_COOKIE}=${flag}; Path=/; SameSite=Lax; HttpOnly${secure}`;
}

export async function editorView(request: Request): Promise<LaunchView | undefined> {
  if (!request.headers.get("cookie")?.includes("kd_edit=")) return undefined;
  try {
    const { isAuthed, readCookie } = await import("./edit-auth");
    if (!isAuthed(request)) return undefined;
    if (request.headers.get(PEEK_HEADER) === "1") return "peek";
    const flag = readCookie(request, VIEW_COOKIE);
    return flag === "preview" || flag === "removed" ? flag : "all";
  } catch {
    return undefined;
  }
}

/* The ordinary signed-in page's tag, which never changes. */
const BADGES = `<script src="/launch-badges.js" defer></script>`;

/* Run before the head script, which would otherwise put the page back in
   edit mode. public/editor-ui.css hangs these two views' rules on the
   attribute, which a visitor's page never has. */
const lockedHead = (view: LaunchView) =>
  `<script>try{sessionStorage.removeItem("kd-edit-mode")}catch(e){}document.documentElement.setAttribute("data-nt-launch-view","${view}")</script>`;

function insertBefore(page: string, tag: string, text: string): string {
  const at = page.lastIndexOf(tag);
  return at < 0 ? page + text : page.slice(0, at) + text + page.slice(at);
}

/** The bar's totals: the very count /studio/launch shows. Never a 500. */
async function removedTotals(): Promise<string> {
  try {
    const { launchSummary } = await import("./launch-summary");
    const { hidden, pages } = await launchSummary();
    return `${hidden} ${hidden === 1 ? "item" : "items"} on ${pages} ${pages === 1 ? "page" : "pages"}`;
  } catch (err) {
    console.error("launch-editor: no totals for the bar", err);
    return "";
  }
}

/** The response as this editor gets it: never stored by anything on the
    way, since it is not what the public is sent. */
export async function forEditor(response: Response, view: LaunchView): Promise<Response> {
  const headers = new Headers(response.headers);
  const flagged = view === "preview" || view === "removed";
  headers.set("Cache-Control", flagged ? "private, no-store" : "no-store");
  const html = (headers.get("content-type") ?? "").includes("text/html");
  const tooled = view !== "peek" && (flagged || response.status === 200 || response.status === 404);
  if (!html || !tooled) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  let page = await response.text();
  if (flagged) {
    const head = page.indexOf("<head>");
    if (head >= 0) page = page.slice(0, head + 6) + lockedHead(view) + page.slice(head + 6);
  }
  const totals = view === "removed" ? ` data-totals="${await removedTotals()}"` : "";
  page = insertBefore(
    page,
    "</body>",
    view === "all" && response.status === 200
      ? BADGES
      : `<script src="/launch-badges.js" data-view="${view}" data-status="${response.status}"${totals} defer></script>`
  );
  headers.delete("content-length");
  return new Response(page, { status: response.status, statusText: response.statusText, headers });
}
