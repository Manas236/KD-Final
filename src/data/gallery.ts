/* ============================================================
   Project galleries — which photographs belong to which project
   ------------------------------------------------------------
   Rendered in two places: the Gallery tab on /projects (every group,
   via `projects.gallery.groups`) and the gallery block on each
   /projects/[slug] page (its own group, via getGallery()).

   `project` is the project's exact title — the same string projects.ts
   and project-detail.ts use — so the link to a project page comes from
   the one slugify() everything else uses, and a renamed project that
   is not renamed here simply loses its gallery rather than linking
   somewhere wrong.

   THIS FILE IS THE BASELINE. Since 3 Oct 2026 the site shows it with
   the studio gallery manager's changes (/studio/gallery) replayed over
   it — hides, moves, reorders, captions — see src/lib/gallery-live.ts.
   Editing this file still works and still ships; the studio's changes
   apply on top of whatever it says. Photographs taken off the site live
   in gallery-library.ts.

   `file` names a derivative in src/assets/gallery/, written by
   scripts/build-gallery.mjs, which also records the raw source of
   every file. It is an attribute value, never rendered as text, which
   is why scripts/check-edit-keys.mjs skips `.file` paths the way it
   skips `.alt` and `.href`.

   NO IMAGE IMPORTS IN THIS FILE, on purpose. projects.ts re-exports
   this data, and check-edit-keys.mjs imports projects.ts straight into
   Node, which cannot import a .jpg. Components resolve `file` to an
   image through src/lib/gallery-images.ts instead.

   ATTRIBUTION IS BY FOLDER, and three groups lean on it:
     · Panvel–Karjat has no stills anywhere in the library. Its photos
       are frames from the Chowk site videos (Chowk is one of the
       corridor's four stations), so they are 720p.
     · Harbour Line FOBs is the Vashi FOB folder — Vashi–Sanpada is one
       of that project's four locations.
     · Mumbai Harbour Line Station Redevelopment is the Mankhurd safety
       event of January 2026 — Mankhurd is one of its four stations.
   Solapur and Lower Parel have no photographs of their own at all, so
   they have no group; their pages show no gallery. (Matunga Workshop
   FOB was in that list until 2026-09-28.)
   Nor do Kharghar Football Stadium and Kharghar Centre of Excellence,
   whose pages show a "Photograph to be added" placeholder instead.
   ============================================================ */

import { slugify } from "../lib/slug.ts";

export interface GalleryPhoto {
  readonly file: string;
  readonly caption: string;
}

export interface ProjectGallery {
  readonly project: string;
  /** Where the group heading links. Omitted, it is /projects/<slug of
      project> — only the plant groups, which live under /resources,
      set it. An attribute, never rendered as text. */
  readonly href?: string;
  /** Set on a PART of a project's gallery (MATUNGA_PARTS): the title of
      the project it belongs to. Pages show the parent with one
      sub-heading per part; only the studio shows a part on its own. */
  readonly parent?: string;
  /** A part's sub-heading on the page — "Civil Works". */
  readonly label?: string;
  readonly photos: readonly GalleryPhoto[];
  /** Filled in by src/lib/gallery-live.ts, never written here: a split
      project's photographs, part by part. `photos` is then all of them. */
  readonly parts?: readonly GalleryPart[];
}

export interface GalleryPart {
  readonly label: string;
  readonly photos: readonly GalleryPhoto[];
}

/* The railway projects, in the /projects listing's order. */
const railwayFirst: readonly ProjectGallery[] = [
  {
    project: "Panvel–Karjat Railway Line",
    photos: [
      { file: "panvel-karjat-01.jpg", caption: "Steel girder lifted in at Chowk, RCC box segments staged in front" },
      { file: "panvel-karjat-03.jpg", caption: "Crane lifting a pre-assembled track panel on the corridor" },
      { file: "panvel-karjat-04.jpg", caption: "Track-panel lift under way, excavator working alongside" },
      { file: "panvel-karjat-05.jpg", caption: "Night work: rail cutting on the corridor" },
    ],
  },
  /* Split three ways since 8 Oct 2026 — see MATUNGA_PARTS below. The
     group stays here, empty, so no group after it changes index. */
  {
    project: "Matunga Workshop",
    photos: [],
  },
  {
    project: "Nhava Sheva & Uran Railway Stations",
    photos: [
      { file: "nhava-sheva-uran-01.jpg", caption: "Nhava Sheva station from the air, platform roof and approach roads" },
      { file: "nhava-sheva-uran-02.jpg", caption: "Nhava Sheva platforms under the full-length truss roof" },
      { file: "nhava-sheva-uran-03.jpg", caption: "Nhava Sheva station in its landscape" },
      { file: "nhava-sheva-uran-04.jpg", caption: "Nhava Sheva platform and station nameboard" },
      { file: "nhava-sheva-uran-05.jpg", caption: "Nhava Sheva during construction, materials on site" },
      { file: "nhava-sheva-uran-06.jpg", caption: "Nhava Sheva station building nearing completion" },
      { file: "nhava-sheva-uran-07.jpg", caption: "Uran station's arched platform roof, from the air" },
      { file: "nhava-sheva-uran-08.jpg", caption: "Uran platform under the arched canopy" },
      { file: "nhava-sheva-uran-09.jpg", caption: "A suburban train at Uran platform, January 2024" },
      { file: "nhava-sheva-uran-11.jpg", caption: "Uran platform at dusk under the arched roof" },
      { file: "nhava-sheva-uran-12.jpg", caption: "Uran station building on opening day" },
    ],
  },
  {
    project: "Harbour Line FOBs & Trespass-Control",
    photos: [
      { file: "harbour-line-fobs-03.jpg", caption: "On the deck, inside the Vashi FOB truss" },
      { file: "harbour-line-fobs-04.jpg", caption: "Vashi FOB end to end, stair to span" },
      { file: "harbour-line-fobs-05.jpg", caption: "Stair tower and piers of the Vashi FOB" },
      { file: "harbour-line-fobs-06.jpg", caption: "Canopied stair up to the Vashi FOB deck" },
      { file: "harbour-line-fobs-08.jpg", caption: "Truss in place at Vashi, crane on site below" },
      { file: "harbour-line-fobs-09.jpg", caption: "Twin cranes at dusk during erection works at Vashi" },
      { file: "harbour-line-fobs-11.jpg", caption: "Stair up to the FOB deck" },
      { file: "harbour-line-fobs-12.jpg", caption: "Inside the steel truss, along the FOB deck" },
      { file: "harbour-line-fobs-13.jpg", caption: "FOB stair landing with arched railings" },
      { file: "harbour-line-fobs-15.jpg", caption: "Truss FOB spanning the tracks" },
      { file: "harbour-line-fobs-16.jpg", caption: "FOB stair rising to the deck" },
      { file: "harbour-line-fobs-17.jpg", caption: "Stair to the FOB, front view" },
      { file: "harbour-line-fobs-23.jpg", caption: "FOB spanning the tracks under the overhead wires" },
    ],
  },
  {
    project: "Mumbai Harbour Line Station Redevelopment",
    photos: [
      { file: "harbour-line-stations-01.jpg", caption: "Site workforce assembled at Mankhurd, January 2026" },
      { file: "harbour-line-stations-02.jpg", caption: "Safety briefing for the Mankhurd site team" },
      { file: "harbour-line-stations-03.jpg", caption: "Marking 75,000 safe man-hours without a lost-time incident" },
    ],
  },
  {
    project: "Sanpada Carshed",
    photos: [
      { file: "sanpada-carshed-01.jpg", caption: "Carshed from the air: sheds, stabling lines and yard" },
      { file: "sanpada-carshed-02.jpg", caption: "Rakes stabled under the shed roofs, from the air" },
      { file: "sanpada-carshed-03.jpg", caption: "Carshed administration building" },
      { file: "sanpada-carshed-07.jpg", caption: "Guests welcomed with bouquets at the inauguration, January 2026" },
      { file: "sanpada-carshed-08.jpg", caption: "A bouquet of welcome at the entrance porch" },
      { file: "sanpada-carshed-09.jpg", caption: "Greeting guests on the red carpet" },
      { file: "sanpada-carshed-24.jpg", caption: "The entrance on inauguration morning" },
      { file: "sanpada-carshed-27.jpg", caption: "The arched gateway under a clear sky" },
      { file: "sanpada-carshed-30.jpg", caption: "Frontage and entrance porch, towers beyond" },
      { file: "sanpada-carshed-42.jpg", caption: "Greetings on the red carpet at the entrance" },
      { file: "matunga-workshop-13.jpg", caption: "Carshed sheds across the grounds, with inset views of the finished buildings" },
      { file: "matunga-workshop-14.jpg", caption: "Boom lift at work inside a shed under construction" },
      { file: "matunga-workshop-03.jpg", caption: "Shed interior, EOT crane spanning the bay" },
    ],
  },
];

/* Beyond the railway — the six photographed projects of the band on
   /projects (projects.social), in that band's order. Each opens on its
   /projects tile's own frame (the social-*.jpg files); the rest are
   that project's other usable frames (scripts/build-gallery.mjs says
   which were left out, and why). Four of them have no second frame in
   the library, so their gallery is the one photograph.
   OPEN-QUESTIONS.md #36. */
export const socialGalleries: readonly ProjectGallery[] = [
  {
    project: "Bonkode FOB",
    photos: [
      { file: "social-bonkode-fob.jpg", caption: "The skywalk over the Thane–Belapur road, a lift tower at each end" },
      { file: "bonkode-fob-02.jpg", caption: "The enclosed walkway between its two glazed towers" },
      { file: "bonkode-fob-03.jpg", caption: "Steel stair and walkway meeting at a lift tower" },
      { file: "bonkode-fob-04.jpg", caption: "A glazed lift tower at street level" },
      { file: "bonkode-fob-07.jpg", caption: "The skywalk over the Thane–Belapur road, a hoarding alongside" },
      { file: "bonkode-fob-09.jpg", caption: "Skywalk meeting a glazed lift tower" },
      { file: "bonkode-fob-10.jpg", caption: "Glazed lift tower at street level" },
      { file: "bonkode-fob-18.jpg", caption: "The skywalk curving over the road" },
      { file: "bonkode-fob-19.jpg", caption: "The skywalk seen down the carriageway" },
      { file: "bonkode-fob-20.jpg", caption: "Lift tower and skywalk span" },
      { file: "bonkode-fob-21.jpg", caption: "Stair access up to the skywalk" },
      { file: "bonkode-fob-23.jpg", caption: "Inside the enclosed skywalk" },
      { file: "bonkode-fob-25.jpg", caption: "Canopied stair, front view" },
      { file: "bonkode-fob-27.jpg", caption: "Skywalk and trestles, wide view" },
    ],
  },
  {
    project: "Ulwe Hospital",
    photos: [
      { file: "social-ulwe-hospital.jpg", caption: "The completed building, seen from its gate" },
    ],
  },
  {
    project: "Ulwe CIDCO School",
    photos: [
      { file: "ulwe-cidco-school-02.jpg", caption: "The school's long elevation and boundary wall" },
    ],
  },
  {
    project: "Karanjade Health Care",
    photos: [
      { file: "social-karanjade-health-care.jpg", caption: "The health centre, its blue glazed column running full height" },
      { file: "karanjade-health-care-02.jpg", caption: "The health centre tower, blue glazed strip and brown cladding" },
    ],
  },
  {
    project: "Kharghar Golf Course",
    photos: [
      { file: "social-kharghar-golf-course.jpg", caption: "The clubhouse seen across the green" },
      { file: "kharghar-golf-course-02.jpg", caption: "The clubhouse, its stone base and timber-screened terrace" },
      { file: "kharghar-golf-course-03.jpg", caption: "The course, with the Kharghar hills behind" },
      { file: "kharghar-golf-course-04.jpg", caption: "Single-storey pavilion with a stone base" },
      { file: "kharghar-golf-course-07.jpg", caption: "Kharghar Valley Golf Course name wall and course map" },
      { file: "kharghar-golf-course-08.jpg", caption: "Clubhouse terrace among palms" },
      { file: "kharghar-golf-course-12.jpg", caption: "A fairway beneath the Kharghar hills" },
      { file: "kharghar-golf-course-13.jpg", caption: "A winding path across the course, city towers behind" },
    ],
  },
  {
    project: "Lush Meadows",
    photos: [
      { file: "social-lush-meadows.jpg", caption: "The entrance porch, the name lettering above it" },
    ],
  },
];

/* The Matunga Workshop's photographs, split by discipline at the
   owner's request on 8 Oct 2026. Each part is a group of its own — so
   the studio gallery manager can move a photograph from one to another,
   upload into one, reorder within one — with `parent` naming the
   project it belongs to. Pages never show a part as a project: they
   show the parent, with one sub-heading per part (src/lib/gallery-live.ts).
   They are in NONE of the lists below — every page lists the parent —
   only in galleryParts at the end of this file, which gallery-live.ts
   folds in. So no group in any list changes index, and with it no
   stored heading edit (projects.gallery.groups.N).

   Sorted by eye: Mechanical is the shed, its cranes, traverser and
   rolling stock; Electrical is the lighting — the dusk and night shots,
   the lit stair and the reception ceiling; Civil is everything else,
   buildings, landscaping, boundary works and interiors. */
export const MATUNGA_PARTS = {
  civil: "Matunga Workshop — Civil Works",
  mechanical: "Matunga Workshop — Mechanical Works",
  electrical: "Matunga Workshop — Electrical Works",
} as const;

const matungaParts: readonly ProjectGallery[] = [
  {
    project: MATUNGA_PARTS.civil,
    parent: "Matunga Workshop",
    label: "Civil Works",
    photos: [
      { file: "matunga-workshop-10.jpg", caption: "Name wall and water feature at the workshop entrance" },
      { file: "matunga-workshop-16.jpg", caption: "Office block side elevation and service lane" },
      { file: "matunga-workshop-17.jpg", caption: "Renovated two-storey block with a landscaped forecourt" },
      { file: "matunga-workshop-18.jpg", caption: "Shed facade under scaffold netting, covered coach entry below" },
      { file: "matunga-workshop-21.jpg", caption: "Workshop gate with the new office block beyond" },
      { file: "matunga-workshop-23.jpg", caption: "Office block and its paved approach" },
      { file: "matunga-workshop-25.jpg", caption: "Planting bed along the office block" },
      { file: "matunga-workshop-27.jpg", caption: "Paved drive to the office block entrance" },
      { file: "matunga-workshop-29.jpg", caption: "Potted palms lining the entrance walk" },
      { file: "matunga-workshop-31.jpg", caption: "Name wall and water feature at the workshop entrance" },
      { file: "matunga-workshop-34.jpg", caption: "Stone planters and the name wall from the side" },
      { file: "matunga-workshop-38.jpg", caption: "Boundary screens, with the workshop gate beyond" },
      { file: "matunga-workshop-39.jpg", caption: "Planted bed along the tiled boundary wall" },
      { file: "matunga-workshop-40.jpg", caption: "Office block end elevation" },
      { file: "matunga-workshop-41.jpg", caption: "Tiled boundary wall with green panels" },
      { file: "matunga-workshop-44.jpg", caption: "Tensile canopy over the office block entrance" },
      { file: "matunga-workshop-56.jpg", caption: "Lobby planters and wall-mounted artwork" },
      { file: "matunga-workshop-62.jpg", caption: "Frosted-glass entry to the manager's suite" },
      { file: "matunga-workshop-64.jpg", caption: "Corridor of timber doors and framed paintings" },
      { file: "matunga-workshop-66.jpg", caption: "Stair void and corridor on the upper floor" },
      { file: "matunga-workshop-67.jpg", caption: "Office with meeting table and timber-panelled walls" },
      { file: "matunga-workshop-72.jpg", caption: "Lounge seating, front view" },
      { file: "matunga-workshop-73.jpg", caption: "Lounge corner under a Vande Bharat painting" },
      { file: "matunga-workshop-74.jpg", caption: "Sofas against the timber panelling" },
      { file: "matunga-workshop-75.jpg", caption: "Manager's desk and visitor chairs" },
      { file: "matunga-workshop-76.jpg", caption: "Manager's office seen from the lounge" },
      { file: "matunga-workshop-77.jpg", caption: "Office meeting table and wall art" },
      { file: "matunga-workshop-78.jpg", caption: "The Chief Workshop Manager's nameplate" },
      { file: "matunga-workshop-82.jpg", caption: "Conference room from the window side" },
      { file: "matunga-workshop-07.jpg", caption: "Carriage workshop office building" },
      { file: "matunga-workshop-08.jpg", caption: "Workshop facility block and landscaped approach" },
    ],
  },
  {
    project: MATUNGA_PARTS.mechanical,
    parent: "Matunga Workshop",
    label: "Mechanical Works",
    photos: [
      { file: "matunga-workshop-01.jpg", caption: "Vande Bharat trainset inside the maintenance shed" },
      { file: "matunga-workshop-02.jpg", caption: "LHB coach shed under its full-length arched roof" },
      { file: "matunga-workshop-05.jpg", caption: "Looking down the workshop yard from above" },
      { file: "matunga-workshop-04.jpg", caption: "Boom lift at work under the shed roof trusses" },
    ],
  },
  {
    project: MATUNGA_PARTS.electrical,
    parent: "Matunga Workshop",
    label: "Electrical Works",
    photos: [
      { file: "matunga-workshop-09.jpg", caption: "Workshop entrance monument at dusk" },
      { file: "matunga-workshop-11.jpg", caption: "Tensile canopy over the forecourt, lit at dusk" },
      { file: "matunga-workshop-52.jpg", caption: "The manager's office reception, full height" },
      { file: "matunga-workshop-59.jpg", caption: "Lit stair treads and steel handrail" },
      { file: "matunga-workshop-86.jpg", caption: "Courtyard and tensile canopies at night" },
      { file: "matunga-workshop-88.jpg", caption: "Office block cove lighting at dusk" },
      { file: "matunga-workshop-93.jpg", caption: "Workshop name board and gate at night" },
    ],
  },
];

/* The Matunga Z-Bridge — received 2026-09-28 in a folder named "Gati
   Shakti", the first photographs of this structure the site has had
   (OPEN-QUESTIONS.md #38). Last in projectGalleries, so no group
   above changes index. */
const railwayLater: readonly ProjectGallery[] = [
  {
    project: "Matunga Z-Bridge",
    photos: [
      { file: "matunga-workshop-fob-02.jpg", caption: "The covered bridge running the length of the workshop yard, ventilators along its roof" },
      { file: "matunga-workshop-fob-03.jpg", caption: "Granite flooring and toughened-glass side screens on the deck" },
      { file: "matunga-workshop-fob-04.jpg", caption: "Steel girders set in place during erection" },
      { file: "matunga-workshop-fob-05.jpg", caption: "Mobile crane lifting the arched roof members onto the bridge" },
      { file: "matunga-workshop-fob-06.jpg", caption: "Arched roof members going up along the deck" },
      { file: "matunga-workshop-fob-07.jpg", caption: "Roof sheeting erected above the running workshop" },
      { file: "matunga-workshop-fob-08.jpg", caption: "Laser-cut steel screens dressing a support tower at ground level" },
    ],
  },
];

/* Every railway project with photographs, in the /projects order. */
export const railwayGalleries: readonly ProjectGallery[] = [...railwayFirst, ...railwayLater];

/* The order the /projects Gallery tab has always used — a group's
   index is part of its caption edit keys (projects.gallery.groups.N),
   so a new group is only ever appended. */
export const projectGalleries: readonly ProjectGallery[] = [...railwayFirst, ...socialGalleries, ...railwayLater];

/* K.D.'s own plants. Defined here rather than in plant.ts / rmc-plant.ts
   so the /projects Gallery tab and /gallery can list them without
   importing those modules (plant.ts imports projects.ts, which imports
   this file). Both plant pages take their gallery from these arrays. */
export const vindhanePlantPhotos: readonly GalleryPhoto[] = [
  /* PHOTOS.md B19 and B20 first — the two frames from the annual deck. */
  { file: "vindhane-plant-01.jpg", caption: "Fabricated plate girders laid out in the yard, Hydra crane alongside" },
  { file: "vindhane-plant-02.jpg", caption: "Welder at a wire-feed welding set inside the fabrication shed" },
  /* The company's own labelled set, received 2026-09-28 — captions
     follow its file names (OPEN-QUESTIONS.md #38). */
  { file: "vindhane-plant-03.jpg", caption: "The fabrication shop, a fully clad steel shed" },
  { file: "vindhane-plant-04.jpg", caption: "Installing the 20-tonne EOT crane girder inside the shed" },
  { file: "vindhane-plant-05.jpg", caption: "Fabricated girders for the railways loaded out under the EOT crane" },
  { file: "vindhane-plant-06.jpg", caption: "A painted girder lifted onto a trailer for dispatch" },
  { file: "vindhane-plant-07.jpg", caption: "Fabricated members on a trailer, ready to leave the yard" },
  { file: "vindhane-plant-08.jpg", caption: "Arched members fabricated and primed in the yard" },
  { file: "vindhane-plant-09.jpg", caption: "The metalizing shop" },
  { file: "vindhane-plant-10.jpg", caption: "The painting shop, its entry hung with strip curtains" },
  { file: "vindhane-plant-11.jpg", caption: "The plant's diesel generator, keeping the shops running on their own power" },
  { file: "vindhane-plant-12.jpg", caption: "Concreting the plant's approach road" },
    { file: "vindhane-plant-13.jpg", caption: "Building the plant's storm-water drain" },
    { file: "vindhane-plant-14.jpg", caption: "Dussehra celebration lunch at the plant" },
    { file: "vindhane-plant-15.jpg", caption: "The plant team and truck fleet lined up outside the shed" },
    { file: "vindhane-plant-16.jpg", caption: "EOT crane spanning a fabrication shed bay" },
];

export const rmcPlantPhotos: readonly GalleryPhoto[] = [
  { file: "rmc-plant-01.jpg", caption: "The batching plant under its red cladding, aggregate stockpiles in front" },
  { file: "rmc-plant-03.jpg", caption: "Inside the covered shed: a transit mixer loading at left, a cement bulker at right" },
  { file: "rmc-plant-04.jpg", caption: "A transit mixer loading under the batching plant" },
  { file: "rmc-plant-05.jpg", caption: "A cement bulker unloading into the covered bay" },
  { file: "rmc-plant-06.jpg", caption: "The cement silos lifted into place by mobile crane" },
  { file: "rmc-plant-08.jpg", caption: "Cladding the plant enclosure, a mobile crane lifting steel" },
  { file: "rmc-plant-09.jpg", caption: "The strip-curtained loading bay inside the shed" },
    { file: "rmc-plant-10.jpg", caption: "Handover of new tipper trucks for the plant" },
];

/* Titles are the plant pages' own H1s. */
export const plantGalleries: readonly ProjectGallery[] = [
  { project: "Vindhane Steel Fabrication Plant", href: "/resources/vindhane-plant", photos: vindhanePlantPhotos },
  { project: "RMC Plant — Karjat", href: "/resources/rmc-plant-karjat", photos: rmcPlantPhotos },
];

/* The EHS team's September 2026 site reports — also the photo band on
   /hse (pages.ts). Chosen, not all supplied: no worker names, injuries,
   individual health screening, open corrective actions or signed audit
   sheets (OPEN-QUESTIONS.md #42). */
export const hseReportPhotos: readonly GalleryPhoto[] = [
  { file: "hse-national-safety-week-karjat.jpg", caption: "National Safety Week at Karjat — 3,00,000 safe man-hours without a lost-time injury" },
  { file: "hse-national-safety-day-mankhurd.jpg", caption: "National Safety Day at Mankhurd Station — safety pledge and awards" },
  { file: "hse-medical-camp-mankhurd.jpg", caption: "Free medical camp at Mankhurd for 88 workers and staff" },
  { file: "hse-lifting-training-govandi.jpg", caption: "Lifting procedure and tools-and-tackles training at Govandi" },
  { file: "hse-air-monitoring-mankhurd.jpg", caption: "Ambient air-quality monitoring on the Mankhurd site" },
  { file: "hse-world-environment-day.jpg", caption: "The site workforce marks World Environment Day" },
  { file: "hse-worker-recognition.jpg", caption: "Prize distribution for safe work on site" },
  /* Appended 2026-10-09, so no earlier caption key moves. */
  { file: "hse-electrical-shock-drill-mankhurd.jpg", caption: "Electrical-shock mock drill at Mankhurd — the casualty is moved to a standby ambulance" },
];

/* Health, Safety & Environment — the Mankhurd 75,000 safe man-hours
   celebration (Safety Department/, January 2026) and the HSE Department
   folder's site safety meetings and drills. Not a project, so it links
   to /hse. Added 2026-09-28 (OPEN-QUESTIONS.md #40). */
export const hseGalleries: readonly ProjectGallery[] = [
  {
    project: "Health, Safety & Environment",
    href: "/hse",
    photos: [
      { file: "hse-01.jpg", caption: "Addressing the workforce at the 75,000 safe man-hours celebration, Mankhurd" },
      { file: "hse-02.jpg", caption: "A speech under the 75,000 safe man-hours banner" },
      { file: "hse-03.jpg", caption: "Speaking to the site team at the celebration" },
      { file: "hse-04.jpg", caption: "Site leadership lined up before the seated workforce" },
      { file: "hse-05.jpg", caption: "Site leaders addressing the workforce" },
      { file: "hse-06.jpg", caption: "Engineers and supervisors at the celebration" },
      { file: "hse-07.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-08.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-09.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-10.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-11.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-12.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-13.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-14.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-15.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-16.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-17.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-18.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-19.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-20.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-21.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-22.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-23.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-24.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-25.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-26.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-27.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-28.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-29.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-30.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-31.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-32.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-33.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-34.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-35.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-36.jpg", caption: "A certificate and a handshake under the celebration banner" },
      { file: "hse-37.jpg", caption: "Recognising a team member for the safe man-hours milestone" },
      { file: "hse-38.jpg", caption: "Certificate handed over in front of the seated workforce" },
      { file: "hse-39.jpg", caption: "Safety certificate presented to a site team member" },
      { file: "hse-40.jpg", caption: "The whole Mankhurd workforce assembled with their certificates" },
      { file: "hse-41.jpg", caption: "Workforce assembled for the safety milestone photograph" },
      { file: "hse-42.jpg", caption: "Group photograph, certificates in hand" },
      { file: "hse-49.jpg", caption: "Safety meeting in the site office" },
      { file: "hse-50.jpg", caption: "Safety training: fire-extinguisher drills and PPE checks" },
      { file: "hse-51.jpg", caption: "Toolbox talks, safety meetings and a fire-extinguisher drill" },
      { file: "hse-52.jpg", caption: "Safety review meeting in the site office" },
      { file: "hse-53.jpg", caption: "Workers and engineers around the site-office table" },
      { file: "hse-54.jpg", caption: "Site perimeter secured with sheet barricading" },
      { file: "hse-55.jpg", caption: "Sheet barricading around the site boundary" },
      ...hseReportPhotos,
    ],
  },
];

/* Every photograph group on the site — the /projects Gallery tab. */
export const allGalleries: readonly ProjectGallery[] = [...projectGalleries, ...plantGalleries, ...hseGalleries];

/* The parts of split projects — see MATUNGA_PARTS. */
export const galleryParts: readonly ProjectGallery[] = [...matungaParts];

/** Where a group's heading links. */
export function galleryHref(group: ProjectGallery): string {
  return group.href ?? `/projects/${slugify(group.parent ?? group.project)}`;
}

export function getGallery(projectTitle: string): ProjectGallery | undefined {
  return projectGalleries.find((g) => g.project === projectTitle);
}
