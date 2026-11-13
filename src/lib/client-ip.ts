/* ------------------------------------------------------------
   The visitor's address, and when to believe nginx about it
   (13 Nov 2026)
   ------------------------------------------------------------
   Every write route files the request under one address: the rate
   limits (careers applications, enquiries, studio uploads), the
   enquiry's ip_hash and the audit column of every editor write
   (content_edits and the other event tables). This module is the only
   place that address is worked out. Nothing else reads
   X-Forwarded-For, X-Real-IP or context.clientAddress for it.

   WHO MAY NAME THE VISITOR. On production nginx is the only thing that
   connects to the app, over loopback, and it tells the app who the
   visitor was in a header. Anyone else who reaches the app directly
   could send the same header with any address in it. So the headers
   are believed only when the connection itself comes from loopback
   (127.0.0.0/8 or ::1, which is nginx, or a check script run on the
   box); from any other address they are ignored and that address is
   the answer.

   WHICH HEADER, WHICH HOP. This expects nginx to send the conventional
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   (the 12 Nov 2026 fix on the server; its own record of the lines is
   /srv/kd-backups/deploy-2026-11-12.md there, and CLAUDE.md, under
   Production, is where they belong in this repo). That keeps whatever
   X-Forwarded-For the visitor sent and appends the address nginx itself
   saw. Only that last entry was written by nginx; everything before it
   is the visitor's own text. So the answer is the LAST entry, never the
   first (the first is what this site used until 13 Nov 2026, which let
   anyone pick their own address, and their own rate limit, by sending
   the header). X-Real-IP (nginx's $remote_addr, if it sends one) is
   read only when X-Forwarded-For is absent. If nginx sends X-Real-IP
   and not X-Forwarded-For, that order is wrong (a visitor's own
   X-Forwarded-For would win) and must flip; this is the code that
   changes with nginx's lines.

   THE CONNECTION'S OWN ADDRESS. Astro's context.clientAddress is not
   it: for a request whose host is in security.allowedDomains (every
   request through nginx) Astro hands back the FIRST X-Forwarded-For
   entry, falling back to the connection only when there is none. The
   connection is read here instead from Node's own
   "http.server.request.start" diagnostics channel, which Node publishes
   for each request, with its socket, just before the app sees it. The
   address goes into an AsyncLocalStorage that follows the request
   through every await. No Node internals are patched and the start
   command does not change.

   The channel can only report requests that arrive after this module
   is loaded. src/middleware.ts imports it, so that is from the first
   request after a restart: that one request, if it is a write, cannot
   tell nginx from a stranger and is filed under no address at all
   (null), never a guessed one.

   Server-only (node:*). validIp() stays in editable.ts, which the
   browser bundle shares.
   ------------------------------------------------------------ */
import { AsyncLocalStorage } from "node:async_hooks";
import { subscribe } from "node:diagnostics_channel";
import { validIp } from "./editable.ts";

const CHANNEL = "http.server.request.start";

/* One store and one subscription per process, also when a bundler or
   the dev server evaluates this module more than once. */
const STORE = Symbol.for("kd.client-ip.peer");
type PeerStore = AsyncLocalStorage<string | undefined>;
const shared = globalThis as typeof globalThis & { [STORE]?: PeerStore };

function peerStore(): PeerStore {
  const existing = shared[STORE];
  if (existing) return existing;
  const store: PeerStore = new AsyncLocalStorage();
  subscribe(CHANNEL, (message) => {
    const socket = (message as { socket?: { remoteAddress?: string } } | null)?.socket;
    // enterWith, not run(): Node calls this synchronously just before it
    // hands the request to the app, so the store set here is the one the
    // whole request runs in. A connection has one remote address, so a
    // kept-alive connection's next request sets the same value again.
    store.enterWith(socket?.remoteAddress);
  });
  shared[STORE] = store;
  return store;
}

const peers = peerStore();

/** True for 127.0.0.0/8 and ::1, as validIp() prints them. */
export function isLoopback(ip: string): boolean {
  return ip.startsWith("127.") || ip === "::1";
}

/**
 * The address to file a request under, given the address of the
 * connection it came in on (`peer`).
 *
 * - Peer unknown: null.
 * - Peer not loopback: the peer itself. Forwarding headers are ignored.
 * - Peer loopback, X-Forwarded-For present: its last entry, the one
 *   nginx appended; null if that does not parse.
 * - Peer loopback, only X-Real-IP present: that; null if it does not parse.
 * - Peer loopback, neither header: the peer (a script run on the box).
 */
export function clientIpFor(headers: Headers, peer: unknown): string | null {
  const direct = validIp(peer);
  if (!direct) return null;
  if (!isLoopback(direct)) return direct;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded !== null) {
    const hops = forwarded.split(",");
    const last = validIp(hops[hops.length - 1]);
    if (last) return last;
  }
  const real = headers.get("x-real-ip");
  if (real !== null) {
    const ip = validIp(real);
    if (ip) return ip;
  }
  // A header was sent but nothing in it parses: the visitor is unknown,
  // and nginx's own 127.0.0.1 would be a wrong answer, not an unknown one.
  if (forwarded !== null || real !== null) return null;
  return direct;
}

/**
 * The address of the connection this request came in on, or null.
 * Before the channel has reported (see above), Astro's clientAddress is
 * used only when the request has no X-Forwarded-For, because only then
 * is it the connection's own address.
 */
export function peerAddress(context: { request: Request; readonly clientAddress: string }): string | null {
  const seen = peers.getStore();
  if (seen) return validIp(seen);
  if (context.request.headers.has("x-forwarded-for")) return null;
  try {
    // Astro throws here rather than returning undefined when the adapter
    // cannot report it, and a write must not 500 over an audit column.
    return validIp(context.clientAddress);
  } catch {
    return null;
  }
}

/** The visitor's address for this request, or null. Every write route uses this. */
export function clientIp(context: { request: Request; readonly clientAddress: string }): string | null {
  return clientIpFor(context.request.headers, peerAddress(context));
}
