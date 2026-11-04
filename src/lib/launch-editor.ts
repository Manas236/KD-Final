/* ============================================================
   Launch mode for a signed-in editor: what they see instead of the public
   ------------------------------------------------------------
   src/middleware.ts asks this for every page request. The answer is
   undefined, and the request is an ordinary visitor's, unless it carries
   a valid `kd_edit` session (the signed cookie, never the kd_edit_ui hint):

     "all"      the whole site, launch mode or not, so a placeholder can
                still be filled. The page also gets /launch-badges.js,
                which marks what launch mode would take off.
     "preview"  the public's view with launch mode ON, whatever the switch
                says, and a bar saying so. Set by the kd_launch_preview
                cookie, which POST /api/launch writes for an editor only;
                without a session it means nothing and changes nothing.
     "peek"     the same view with nothing added, for one request:
                /launch-badges.js asks for it to see what would go.

   So nothing here can reach a visitor. A request with no `kd_edit` cookie
   returns before edit-auth is even loaded, on purpose: that module throws
   at import when EDIT_SECRET is missing (see its note), and a missing
   secret must keep taking down the editor, not every public page.

   Everything added to an editor's page is spliced into the rendered
   string here, not drawn by a component or a bundled script, because the
   public's HTML must stay byte for byte what it is.
   ============================================================ */
export type LaunchView = "all" | "preview" | "peek";

export const PREVIEW_COOKIE = "kd_launch_preview";
const PEEK_HEADER = "x-kd-launch-peek";

export async function editorView(request: Request): Promise<LaunchView | undefined> {
  if (!request.headers.get("cookie")?.includes("kd_edit=")) return undefined;
  try {
    const { isAuthed, readCookie } = await import("./edit-auth");
    if (!isAuthed(request)) return undefined;
    if (request.headers.get(PEEK_HEADER) === "1") return "peek";
    return readCookie(request, PREVIEW_COOKIE) === "1" ? "preview" : "all";
  } catch {
    return undefined;
  }
}

/* Run before the head script, which would otherwise put the page back in
   edit mode, and keep the editor's bar off the page: a preview is what a
   visitor gets. */
const PREVIEW_HEAD = `<script>try{sessionStorage.removeItem("kd-edit-mode")}catch(e){}</script><style>[data-nt-ui]{display:none!important}</style>`;

const PREVIEW_BAR = `<div data-launch-preview style="position:fixed;left:0;right:0;bottom:0;z-index:70;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:center;padding:10px 16px;background:var(--kd-ink-deep);border-top:1px solid var(--kd-mint);color:var(--kd-mint);font-size:13px;font-weight:600;line-height:1.4"><span>Preview: the site as the public sees it with launch mode ON. Only you can see this.</span><button type="button" style="font:inherit;color:inherit;background:none;border:1px solid currentColor;padding:6px 12px;cursor:pointer">Exit preview</button></div><script>document.querySelector("[data-launch-preview] button").addEventListener("click",function(){fetch("/api/launch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"preview",on:false})}).then(function(){location.reload()})})</script>`;

const BADGES = `<script src="/launch-badges.js" defer></script>`;

function insertBefore(page: string, tag: string, text: string): string {
  const at = page.lastIndexOf(tag);
  return at < 0 ? page + text : page.slice(0, at) + text + page.slice(at);
}

/** The response as this editor gets it: never stored by anything on the
    way, since it is not what the public is sent. */
export async function forEditor(response: Response, view: LaunchView): Promise<Response> {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  const html = (headers.get("content-type") ?? "").includes("text/html");
  if (!html || view === "peek" || (view === "all" && response.status !== 200)) {
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  let page = await response.text();
  if (view === "all") {
    page = insertBefore(page, "</body>", BADGES);
  } else {
    const head = page.indexOf("<head>");
    if (head >= 0) page = page.slice(0, head + 6) + PREVIEW_HEAD + page.slice(head + 6);
    page = insertBefore(page, "</body>", PREVIEW_BAR);
  }
  headers.delete("content-length");
  return new Response(page, { status: response.status, statusText: response.statusText, headers });
}
