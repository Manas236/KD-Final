/* ============================================================
   /privacy and /terms — the site's two legal pages
   ------------------------------------------------------------
   Added 2026-10-09. Neither page was in the brief or the design; they
   became necessary when /careers started collecting applicants' names,
   contact details and resumes (2026-10-08). Indian law expects a
   published privacy notice from anyone collecting personal data that
   way — the IT (Reasonable Security Practices…) Rules 2011, rule 4,
   and the Digital Personal Data Protection Act 2023.

   A FIRST DRAFT, NOT LEGAL ADVICE. The wording describes what this site
   actually does — every fact in the privacy policy is checked against
   the code named beside it — but K.D. or its lawyer must review both
   pages before launch: PRE-LAUNCH.md sign-off S9.

   FACTS THE POLICY STATES, and where each one lives in the code. If
   the code changes, change the sentence:
     · fields collected   src/pages/careers.astro, src/lib/applications.ts
     · IP + browser kept  src/pages/api/apply.ts (client_ip, user_agent)
     · emailed to HR      src/lib/mailer.ts (Google Workspace SMTP)
     · 24-month limit     RETENTION_MONTHS in src/lib/applications.ts
     · delete on request  /studio/applications → /api/applications/delete
     · cookies            kd_edit / kd_edit_ui, editors only (src/lib/edit-auth.ts)
     · browser storage    the page-text cache in src/layouts/BaseLayout.astro
     · Google Maps        the embedded map on /contact
     · no analytics       there is no analytics or advertising script

   In-page editable like every other page (keys `privacy.*`, `terms.*`),
   so K.D. can apply the reviewed wording without a developer. Each
   paragraph and list item is its own slot. `updated` is plain copy —
   change it whenever the wording changes.
   ============================================================ */
import { home } from "./home.ts";

export interface LegalSection {
  readonly heading: string;
  /** Paragraphs before the list. */
  readonly body: readonly string[];
  /** An optional bulleted list, after the paragraphs. */
  readonly items?: readonly string[];
  /** Optional paragraphs after the list. */
  readonly after?: readonly string[];
}

export interface LegalPageCopy {
  readonly meta: { readonly title: string; readonly description: string };
  readonly nav: typeof home.nav;
  readonly footer: typeof home.footer;
  readonly hero: { readonly kicker: string; readonly title: string; readonly sub: string };
  readonly updated: string;
  readonly sections: readonly LegalSection[];
}

const chrome = { nav: home.nav, footer: home.footer };

export const privacy: LegalPageCopy = {
  meta: {
    title: "Privacy Policy — K.D. Constructions",
    description:
      "What personal information the K.D. Constructions website collects, why, who sees it, how " +
      "long it is kept, and how to have it deleted.",
  },
  ...chrome,
  hero: {
    kicker: "Legal",
    title: "Privacy Policy",
    sub:
      "This website collects very little about you. This page explains exactly what, why, and how " +
      "to have it removed.",
  },
  updated: "Last updated: 9 October 2026",
  sections: [
    {
      heading: "Who we are",
      body: [
        "This website, kdconstructions.net, is run by Kailashchandra Dilipkumar Constructions " +
          "Private Limited (\"K.D. Constructions\", \"we\", \"us\"), Office No. 1313/1314, Real Tech " +
          "Park, Sector 30A, Vashi, Navi Mumbai – 400703, Maharashtra, India. We are responsible for " +
          "the personal information described on this page.",
      ],
    },
    {
      heading: "Browsing the site",
      body: [
        "You can read every page of this website without telling us who you are. We do not use " +
          "analytics, advertising or tracking tools, and we do not build profiles of visitors.",
        "Like any website, our server records technical details of each request — such as the IP " +
          "address, the page asked for and the browser used — to keep the site running and secure. " +
          "These records are not used to identify you.",
      ],
    },
    {
      heading: "When you apply for a job",
      body: [
        "If you use the application form on our Careers page, we collect:",
      ],
      items: [
        "your name, email address and phone number;",
        "the role you are applying for, and any message you add;",
        "your resume, and anything it contains;",
        "the IP address and browser your application was sent from, and the time it was sent — " +
          "used only to protect the form from spam and abuse.",
      ],
      after: [
        "We use this information only to consider you for roles at K.D. Constructions — now and, " +
          "unless you tell us otherwise, for roles that open later — and to contact you about them. " +
          "By sending the form you consent to this use. We do not use it for marketing, and we do " +
          "not sell it or share it with anyone outside the company.",
      ],
    },
    {
      heading: "Who can see it",
      body: [
        "Your application is sent by email to our HR team and also stored on our web server, where " +
          "only authorised K.D. Constructions staff can see it. Our email is provided by Google " +
          "Workspace and our website is hosted on servers in India; these providers process the " +
          "information only on our behalf.",
        "We may disclose information if the law requires us to, for example in response to a " +
          "lawful request from a government authority.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "We keep an application for up to 24 months after we receive it, so we can consider you for " +
          "roles that open later. After that it is deleted automatically from our website's server. " +
          "If you are hired, your application becomes part of your employee record and is kept under " +
          "our employment policies instead.",
      ],
    },
    {
      heading: "How we protect it",
      body: [
        "Resumes are stored where they cannot be reached from the public website, and the staff " +
          "area that lists applications is protected by a login. The site is served over an " +
          "encrypted (HTTPS) connection. No system is perfectly secure, but we take reasonable steps, " +
          "appropriate to the information, to protect it.",
      ],
    },
    {
      heading: "Cookies and browser storage",
      body: [
        "Visitors get no cookies from this site. Two cookies are set only for K.D. Constructions " +
          "staff who sign in to edit the website; they keep that session open and are never set " +
          "for anyone else.",
        "To load faster, the site may keep a copy of its own page text in your browser's local " +
          "storage. It contains nothing about you.",
        "Our Contact page shows an embedded Google Map. When that page loads, Google may set its own " +
          "cookies or collect information under Google's privacy policy. If you prefer, use the " +
          "address on that page instead of the map.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can ask us at any time to see the information we hold about you, to correct it, or to " +
          "delete it, and you can withdraw your consent to our keeping your application. Email " +
          "hr@kdconstructions.net from the address you applied with, and we will act on your request " +
          "within 30 days. Withdrawing consent does not affect anything we did with your information " +
          "before you withdrew it.",
      ],
    },
    {
      heading: "Questions and complaints",
      body: [
        "Questions or complaints about how we handle your personal information can be sent to our " +
          "Grievance Officer, the Head of HR, at hr@kdconstructions.net, or by post to the address " +
          "above. We will acknowledge a complaint promptly and resolve it within 30 days. If you are " +
          "not satisfied with our response, you may approach the Data Protection Board of India once " +
          "it is accepting complaints.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "If we change how we handle personal information, we will update this page and the date at " +
          "the top of it.",
      ],
    },
  ],
};

export const terms: LegalPageCopy = {
  meta: {
    title: "Terms of Use — K.D. Constructions",
    description:
      "The terms on which the K.D. Constructions website and its content may be used.",
  },
  ...chrome,
  hero: {
    kicker: "Legal",
    title: "Terms of Use",
    sub: "The terms on which you may use this website and what is published on it.",
  },
  updated: "Last updated: 9 October 2026",
  sections: [
    {
      heading: "About these terms",
      body: [
        "This website, kdconstructions.net, is run by Kailashchandra Dilipkumar Constructions " +
          "Private Limited (\"K.D. Constructions\", \"we\", \"us\"), Office No. 1313/1314, Real Tech " +
          "Park, Sector 30A, Vashi, Navi Mumbai – 400703, Maharashtra, India. By using the site you " +
          "agree to these terms. If you do not agree, please do not use it.",
      ],
    },
    {
      heading: "Information on this site",
      body: [
        "The website describes K.D. Constructions, its capabilities and its projects for general " +
          "information. We work to keep it accurate and current, but it may contain errors or be out " +
          "of date, and we may change it at any time without notice.",
        "Nothing on this site is an offer, a bid or a binding commitment. Project figures, " +
          "capacities and certifications are described in summary; for tenders and contracts, only " +
          "the documents we formally submit are authoritative.",
      ],
    },
    {
      heading: "Copyright and trademarks",
      body: [
        "The text, photographs, videos, drawings and design of this website, and the K.D. " +
          "Constructions name and logo, belong to K.D. Constructions or are used with permission. " +
          "You may view the site and share links to it. You may not copy, republish or use its " +
          "content or photographs for any other purpose without our written permission.",
        "Names and logos of our clients and of other organisations appear on this site only to " +
          "identify them, and belong to their owners.",
      ],
    },
    {
      heading: "Acceptable use",
      body: ["When using this site you agree not to:"],
      items: [
        "attempt to gain access to any part of the site, its server or its staff area that is not " +
          "meant for you;",
        "interfere with the site's operation, or overload it with automated requests;",
        "send false information, or someone else's details, through the application form;",
        "use the site for anything unlawful.",
      ],
    },
    {
      heading: "Job applications and recruitment fraud",
      body: [
        "Sending an application through this site does not guarantee an interview or a job. How we " +
          "handle the information you send is set out in our Privacy Policy.",
        "K.D. Constructions never asks candidates for money — no fee for an application, interview, " +
          "training, uniform or offer letter. Genuine messages from us come from an " +
          "@kdconstructions.net email address. If anyone asks you for payment in our name, do not " +
          "pay, and tell us at hr@kdconstructions.net.",
      ],
    },
    {
      heading: "Links to other websites",
      body: [
        "This site links to other websites — such as LinkedIn, job portals and Google Maps — for " +
          "your convenience. We do not control them and are not responsible for their content or " +
          "their privacy practices.",
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        "The website is provided \"as is\". To the extent the law allows, K.D. Constructions is not " +
          "liable for any loss arising from use of the site, from relying on its content, or from " +
          "the site being unavailable. Nothing in these terms limits any liability that cannot be " +
          "limited under Indian law.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of India. The courts at Mumbai, Maharashtra have " +
          "exclusive jurisdiction over any dispute arising from them or from use of this site.",
      ],
    },
    {
      heading: "Changes and contact",
      body: [
        "We may update these terms from time to time; the date at the top of this page shows when " +
          "they last changed. Questions about them can be sent to infra@kdconstructions.net.",
      ],
    },
  ],
};
