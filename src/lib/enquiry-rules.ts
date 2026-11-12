/* ============================================================
   The /contact enquiry form's rules, for both sides (12 Nov 2026)
   ------------------------------------------------------------
   One file, read by the browser (src/scripts/enquiry-form.js, the
   inline checks) and by the server (src/lib/enquiries.ts, which checks
   everything again), so the two never disagree about what a valid
   phone number is. No imports and nothing server-only: it is bundled
   into the page's script.

     name      required, up to 100 characters
     company   optional, up to 160
     phone     required: an Indian mobile or landline in any usual
               writing (98765 43210, +91 98765 43210, 098765 43210,
               022 2781 5380, (022) 2781-5380, +91 22 2781 5380,
               1800 123 4567), or a number with another country's
               code after a "+"
     email     required, a plausible address, up to 254
     message   required, 20 to 2,000 characters once trimmed, line
               breaks kept

   The labels and the words of each error are copy (contact.enquiry in
   src/data/pages.ts); this file only says which fields are wrong.
   ============================================================ */

export const ENQUIRY_FIELDS = ["name", "company", "phone", "email", "message"] as const;
export type EnquiryField = (typeof ENQUIRY_FIELDS)[number];

export const ENQUIRY_LIMITS = {
  name: 100,
  company: 160,
  phone: 25,
  email: 254,
  messageMin: 20,
  messageMax: 2000,
} as const;

export interface EnquiryValues {
  readonly name: string;
  readonly company: string;
  readonly phone: string;
  readonly email: string;
  readonly message: string;
}

/* Built from strings, as src/lib/editable.ts does, so the bundler keeps
   the escapes and never writes the invisible characters themselves into
   the page's inline script. */
const RE_CONTROL = new RegExp("[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]", "g");
const RE_INVISIBLE = new RegExp("[\\u200b-\\u200d\\ufeff]", "g");
const RE_TAB_NBSP = new RegExp("[\\t\\u00a0]", "g");

/** A one-line field: invisible and control characters out, runs of
    space (line breaks included) folded to one, trimmed. */
export function oneLine(raw: unknown): string {
  return String(raw ?? "")
    .replace(RE_INVISIBLE, "")
    .replace(RE_CONTROL, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The message: line breaks kept (one form, "\n"), at most one blank
    line in a row, spaces at line ends dropped, trimmed. */
export function messageText(raw: unknown): string {
  return String(raw ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(RE_INVISIBLE, "")
    .replace(RE_CONTROL, "")
    .replace(RE_TAB_NBSP, " ")
    .replace(/[ ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The phone field's `pattern`, for a browser without the script: the
    characters a number is written with, 8 to 25 of them. The server
    counts the digits. Browsers compile `pattern` with the `v` flag, in
    which ( ) . - must be escaped inside a class, so they are. */
export const PHONE_PATTERN = "\\+?[0-9 \\(\\)\\.\\-]{8,25}";

const RE_PHONE_CHARS = /^\+?[\d\s().-]+$/;
/* The digits of an Indian number, without the "+": a national number of
   ten digits (a mobile, or a landline's area code and number), with an
   optional trunk 0, an optional 91 or 0091 before it, or a 1800 / 1860
   toll-free number. */
const RE_INDIAN = /^(?:0?[1-9]\d{9}|(?:00)?910?[1-9]\d{9}|18[06]0\d{6,7})$/;

export function phoneOk(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > ENQUIRY_LIMITS.phone || !RE_PHONE_CHARS.test(s)) return false;
  const digits = s.replace(/\D/g, "");
  if (s.startsWith("+")) {
    if (digits.startsWith("91")) return /^910?[1-9]\d{9}$/.test(digits);
    return digits.length >= 8 && digits.length <= 15;
  }
  return RE_INDIAN.test(digits);
}

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailOk(raw: string): boolean {
  return raw.length <= ENQUIRY_LIMITS.email && RE_EMAIL.test(raw);
}

/** Every field cleaned, and the names of those that are not right. */
export function checkEnquiry(input: Record<string, unknown>): {
  values: EnquiryValues;
  invalid: EnquiryField[];
} {
  const values: EnquiryValues = {
    name: oneLine(input.name),
    company: oneLine(input.company),
    phone: oneLine(input.phone),
    email: oneLine(input.email).toLowerCase(),
    message: messageText(input.message),
  };
  const invalid: EnquiryField[] = [];
  if (!values.name || values.name.length > ENQUIRY_LIMITS.name) invalid.push("name");
  if (values.company.length > ENQUIRY_LIMITS.company) invalid.push("company");
  if (!phoneOk(values.phone)) invalid.push("phone");
  if (!emailOk(values.email)) invalid.push("email");
  if (values.message.length < ENQUIRY_LIMITS.messageMin || values.message.length > ENQUIRY_LIMITS.messageMax)
    invalid.push("message");
  return { values, invalid };
}
