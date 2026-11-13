/* ============================================================
   POST /api/enquiry: an enquiry from the form on /contact (12 Nov 2026)
   ------------------------------------------------------------
   PUBLIC, like /api/apply: anyone can post here. Two ways in, one
   handling (receiveEnquiry() in src/lib/enquiries.ts: spam, rate limit,
   fields, saved first, then emailed):

     JSON, from the form's script (src/scripts/enquiry-form.js):
       { name, company, phone, email, message, website, t }
       answered with JSON:
         200 { ok: true }                         saved (or looked automated)
         400 { ok: false, code: "invalid", fields: [...], error }
         429 { ok: false, code: "limited", error }
         500 { ok: false, code: "server", error }

     A plain form post (urlencoded or multipart), the same fields, from a
     browser without JavaScript: answered 303 See Other to
     /contact?enquiry=<sent|invalid|limited|error>#enquiry, plus
     &fields=<names> after "invalid", which /contact renders as the
     result. No personal detail goes into that address, so a field that
     fails on the server comes back empty; the browser's own checks
     (required, type=email, minlength, maxlength, pattern) stop nearly
     every such post before it is sent.

   A post that looks automated (the honeypot `website`, or the time token
   `t` missing, forged or under 3 s old) gets exactly the success answer,
   and nothing is saved or sent.

   Astro's origin check stays on. It reads only posts sent as a form, so
   the plain form post from /contact must carry the site's own Origin;
   behind nginx that works because of security.allowedDomains in
   astro.config.mjs (CLAUDE.md, "Production"). JSON is not a "simple"
   cross-site request, so a browser never sends it from another site
   without a preflight this route does not answer.
   ============================================================ */
import type { APIRoute } from "astro";
import { userAgentFrom } from "../../lib/editable";
import { clientIp } from "../../lib/client-ip";
import { receiveEnquiry, type Outcome } from "../../lib/enquiries";
import { ENQUIRY_FIELDS } from "../../lib/enquiry-rules";

export const prerender = false;

/** 2,000 characters of message, four bytes each at worst, and the rest. */
const MAX_BODY = 16 * 1024;

const MESSAGES = {
  invalid: "Please check the fields marked below.",
  limited: "We have received several enquiries from you already. Please try again later.",
  server: "Something went wrong on our side. Please try again.",
} as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function asJson(o: Outcome): Response {
  switch (o.kind) {
    case "saved":
    case "dropped":
      return json({ ok: true });
    case "invalid":
      return json({ ok: false, code: "invalid", fields: o.fields, error: MESSAGES.invalid }, 400);
    case "limited":
      return json({ ok: false, code: "limited", error: MESSAGES.limited }, 429);
    default:
      return json({ ok: false, code: "server", error: MESSAGES.server }, 500);
  }
}

/** The answer to a plain form post: back to /contact, to the result. */
function backToContact(state: "sent" | "invalid" | "limited" | "error", fields: readonly string[] = []): Response {
  const query = new URLSearchParams({ enquiry: state });
  if (fields.length) query.set("fields", fields.join(","));
  return new Response(null, {
    status: 303,
    headers: { Location: `/contact?${query}#enquiry`, "Cache-Control": "no-store" },
  });
}

function asRedirect(o: Outcome): Response {
  switch (o.kind) {
    case "saved":
    case "dropped":
      return backToContact("sent");
    case "invalid":
      return backToContact("invalid", o.fields);
    case "limited":
      return backToContact("limited");
    default:
      return backToContact("error");
  }
}

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const ip = clientIp(context);
  const ua = userAgentFrom(request);

  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  const isJson = type.includes("application/json");
  const tooBig = () =>
    isJson ? json({ ok: false, code: "invalid", fields: [], error: MESSAGES.invalid }, 413) : backToContact("invalid");

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return tooBig();

  let input: Record<string, unknown> = {};
  try {
    if (type.includes("multipart/form-data")) {
      const form = await request.formData();
      for (const name of [...ENQUIRY_FIELDS, "website", "t"]) {
        const v = form.get(name);
        if (typeof v === "string") input[name] = v;
      }
    } else {
      const raw = await request.text();
      if (raw.length > MAX_BODY) return tooBig();
      if (isJson) {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
        input = parsed as Record<string, unknown>;
      } else {
        input = Object.fromEntries(new URLSearchParams(raw));
      }
    }
  } catch {
    return isJson ? json({ ok: false, code: "invalid", fields: [], error: MESSAGES.invalid }, 400) : backToContact("invalid");
  }

  const outcome = await receiveEnquiry(input, ip, ua);
  return isJson ? asJson(outcome) : asRedirect(outcome);
};
