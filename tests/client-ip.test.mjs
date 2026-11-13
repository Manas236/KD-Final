/* src/lib/client-ip.ts: when nginx's forwarding headers are believed.
   Run with `npm test` (node's own test runner; no dependency). */
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { networkInterfaces } from "node:os";
import { clientIp, clientIpFor, isLoopback } from "../src/lib/client-ip.ts";

const h = (init) => new Headers(init);

/* ---------- the rule, given the connection's address ---------- */

test("a header from loopback is used", () => {
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7" }), "127.0.0.1"), "203.0.113.7");
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7" }), "::1"), "203.0.113.7");
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7" }), "::ffff:127.0.0.1"), "203.0.113.7");
  assert.equal(clientIpFor(h({ "x-forwarded-for": "2001:db8::7" }), "127.0.0.1"), "2001:db8::7");
  assert.equal(clientIpFor(h({ "x-real-ip": "203.0.113.8" }), "127.0.0.1"), "203.0.113.8");
});

test("a header from a non-loopback peer is ignored", () => {
  const spoof = h({ "x-forwarded-for": "203.0.113.7", "x-real-ip": "203.0.113.8" });
  assert.equal(clientIpFor(spoof, "198.51.100.20"), "198.51.100.20");
  assert.equal(clientIpFor(spoof, "::ffff:198.51.100.20"), "198.51.100.20");
  assert.equal(clientIpFor(spoof, "2001:db8::20"), "2001:db8::20");
  // "Looks local" in a header is not the same as being local.
  assert.equal(clientIpFor(h({ "x-forwarded-for": "127.0.0.1" }), "198.51.100.20"), "198.51.100.20");
});

test("a spoofed multi-hop X-Forwarded-For yields the hop nginx appended", () => {
  // nginx's $proxy_add_x_forwarded_for: the visitor's own header, then ", $remote_addr".
  assert.equal(clientIpFor(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.7" }), "127.0.0.1"), "203.0.113.7");
  assert.equal(clientIpFor(h({ "x-forwarded-for": "127.0.0.1, 10.0.0.1, 6.6.6.6,203.0.113.7" }), "127.0.0.1"), "203.0.113.7");
  assert.equal(clientIpFor(h({ "x-forwarded-for": "not-an-ip, 203.0.113.7 " }), "::1"), "203.0.113.7");
  // X-Forwarded-For is nginx's header, so a visitor's X-Real-IP beside it changes nothing.
  assert.equal(clientIpFor(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.7", "x-real-ip": "6.6.6.6" }), "127.0.0.1"), "203.0.113.7");
});

test("unknown is null, never nginx's own address or a guess", () => {
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7, garbage" }), "127.0.0.1"), null);
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7," }), "127.0.0.1"), null);
  assert.equal(clientIpFor(h({ "x-real-ip": "nope" }), "127.0.0.1"), null);
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7" }), null), null);
  assert.equal(clientIpFor(h({ "x-forwarded-for": "203.0.113.7" }), "garbage"), null);
  // A bad X-Forwarded-For falls through to X-Real-IP if that parses.
  assert.equal(clientIpFor(h({ "x-forwarded-for": "garbage", "x-real-ip": "203.0.113.8" }), "127.0.0.1"), "203.0.113.8");
});

test("loopback with no forwarding header is the box itself", () => {
  assert.equal(clientIpFor(h({}), "127.0.0.1"), "127.0.0.1");
  assert.equal(clientIpFor(h({}), "::1"), "::1");
});

test("isLoopback", () => {
  for (const ip of ["127.0.0.1", "127.1.2.3", "::1"]) assert.equal(isLoopback(ip), true, ip);
  for (const ip of ["10.0.0.1", "128.0.0.1", "::2", "2001:db8::1", "0.0.0.0", "::"]) assert.equal(isLoopback(ip), false, ip);
});

/* ---------- the connection's address, end to end ----------
   A real Node server, so the address comes from Node's own
   http.server.request.start channel, as on production. The handler is
   given the clientAddress Astro would give it (the FIRST
   X-Forwarded-For entry when there is one), to prove that value is not
   what decides. */

function astroLikeContext(req) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  const first = (req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  return { request: new Request("http://localhost/api/x", { headers }), clientAddress: first || req.socket.remoteAddress };
}

function serve(host) {
  const server = http.createServer(async (req, res) => {
    await new Promise((r) => setTimeout(r, 5)); // the answer must survive awaits
    await Promise.resolve();
    res.end(JSON.stringify({ ip: clientIp(astroLikeContext(req)) }));
  });
  return new Promise((resolve) => server.listen(0, host, () => resolve(server)));
}

function ask(server, connectTo, headers, agent) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const r = http.request({ host: connectTo, port, method: "POST", headers, agent }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve(JSON.parse(body).ip));
    });
    r.on("error", reject);
    r.end();
  });
}

test("end to end: through loopback the appended hop wins, per request, over keep-alive", async () => {
  const server = await serve("127.0.0.1");
  const agent = new http.Agent({ keepAlive: true, maxSockets: 2 });
  try {
    const answers = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        ask(server, "127.0.0.1", { "x-forwarded-for": `6.6.6.6, 203.0.113.${i + 1}` }, agent)
      )
    );
    assert.deepEqual(answers, Array.from({ length: 12 }, (_, i) => `203.0.113.${i + 1}`));
    assert.equal(await ask(server, "127.0.0.1", {}, agent), "127.0.0.1");
  } finally {
    agent.destroy();
    server.close();
  }
});

const lan = Object.values(networkInterfaces())
  .flat()
  .find((a) => a && a.family === "IPv4" && !a.internal);

test("end to end: from a non-loopback address the headers are ignored", { skip: lan ? false : "no non-loopback IPv4 address on this machine" }, async () => {
  const server = await serve("0.0.0.0");
  try {
    const ip = await ask(server, lan.address, { "x-forwarded-for": "203.0.113.7", "x-real-ip": "203.0.113.8" });
    assert.equal(ip, lan.address);
  } finally {
    server.close();
  }
});

test("outside a request (no connection seen): null when X-Forwarded-For is present", () => {
  const ctx = (headers, clientAddress) => ({ request: new Request("http://localhost/", { headers }), clientAddress });
  assert.equal(clientIp(ctx({ "x-forwarded-for": "127.0.0.1, 203.0.113.7" }, "127.0.0.1")), null);
  // With no X-Forwarded-For, Astro's clientAddress is the connection's own.
  assert.equal(clientIp(ctx({ "x-real-ip": "203.0.113.8" }, "127.0.0.1")), "203.0.113.8");
  assert.equal(clientIp(ctx({ "x-real-ip": "203.0.113.8" }, "198.51.100.20")), "198.51.100.20");
  // A clientAddress getter that throws (prerendered route) is no address.
  const throwing = { request: new Request("http://localhost/"), get clientAddress() { throw new Error("no"); } };
  assert.equal(clientIp(throwing), null);
});
