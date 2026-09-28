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

export interface GalleryPhoto {
  readonly file: string;
  readonly caption: string;
}

export interface ProjectGallery {
  readonly project: string;
  readonly photos: readonly GalleryPhoto[];
}

export const projectGalleries: readonly ProjectGallery[] = [
  {
    project: "Panvel–Karjat Railway Line",
    photos: [
      { file: "panvel-karjat-01.jpg", caption: "Steel girder lifted in at Chowk, RCC box segments staged in front" },
      { file: "panvel-karjat-02.jpg", caption: "Subway excavation at Chowk, box segments lined up beside the cut" },
      { file: "panvel-karjat-03.jpg", caption: "Crane lifting a pre-assembled track panel on the corridor" },
      { file: "panvel-karjat-04.jpg", caption: "Track-panel lift under way, excavator working alongside" },
      { file: "panvel-karjat-05.jpg", caption: "Night work: rail cutting on the corridor" },
    ],
  },
  {
    project: "Matunga Workshop",
    photos: [
      { file: "matunga-workshop-01.jpg", caption: "Vande Bharat trainset inside the maintenance shed" },
      { file: "matunga-workshop-02.jpg", caption: "LHB coach shed under its full-length arched roof" },
      { file: "matunga-workshop-03.jpg", caption: "Shed interior, EOT crane spanning the bay" },
      { file: "matunga-workshop-04.jpg", caption: "Boom lift at work under the shed roof trusses" },
      { file: "matunga-workshop-05.jpg", caption: "Looking down the workshop yard from above" },
      { file: "matunga-workshop-06.jpg", caption: "Shed facade and covered coach entry" },
      { file: "matunga-workshop-07.jpg", caption: "Carriage workshop office building" },
      { file: "matunga-workshop-08.jpg", caption: "Workshop facility block and landscaped approach" },
      { file: "matunga-workshop-09.jpg", caption: "Workshop entrance monument at dusk" },
      { file: "matunga-workshop-10.jpg", caption: "Name wall and water feature at the workshop entrance" },
      { file: "matunga-workshop-11.jpg", caption: "Tensile canopy over the forecourt, lit at dusk" },
      { file: "matunga-workshop-12.jpg", caption: "Lobby of the Chief Workshop Manager's office" },
    ],
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
    ],
  },
  {
    project: "Harbour Line FOBs & Trespass-Control",
    photos: [
      { file: "harbour-line-fobs-01.jpg", caption: "Vashi FOB: steel truss spanning the electrified tracks" },
      { file: "harbour-line-fobs-02.jpg", caption: "The Vashi truss under the overhead wires" },
      { file: "harbour-line-fobs-03.jpg", caption: "On the deck, inside the Vashi FOB truss" },
      { file: "harbour-line-fobs-04.jpg", caption: "Vashi FOB end to end, stair to span" },
      { file: "harbour-line-fobs-05.jpg", caption: "Stair tower and piers of the Vashi FOB" },
      { file: "harbour-line-fobs-06.jpg", caption: "Canopied stair up to the Vashi FOB deck" },
      { file: "harbour-line-fobs-07.jpg", caption: "The Vashi truss under a stormy sky" },
      { file: "harbour-line-fobs-08.jpg", caption: "Truss in place at Vashi, crane on site below" },
      { file: "harbour-line-fobs-09.jpg", caption: "Twin cranes at dusk during erection works at Vashi" },
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
      { file: "sanpada-carshed-04.jpg", caption: "Main entrance dressed for the inauguration, January 2026" },
      { file: "sanpada-carshed-05.jpg", caption: "Building frontage and landscaping" },
      { file: "sanpada-carshed-06.jpg", caption: "Entrance porch, with the Navi Mumbai skyline behind" },
    ],
  },

  /* Beyond the railway — the six photographed projects of the band on
     /projects (projects.social), in that band's order, appended so no
     group above changes index. Each opens on its /projects tile's own
     frame (the social-*.jpg files); the rest are that project's other
     usable frames (scripts/build-gallery.mjs says which were left out,
     and why). Four of them have no second frame in the library, so
     their gallery is the one photograph. OPEN-QUESTIONS.md #36. */
  {
    project: "Bonkode FOB",
    photos: [
      { file: "social-bonkode-fob.jpg", caption: "The skywalk over the Thane–Belapur road, a lift tower at each end" },
      { file: "bonkode-fob-02.jpg", caption: "The enclosed walkway between its two glazed towers" },
      { file: "bonkode-fob-03.jpg", caption: "Steel stair and walkway meeting at a lift tower" },
      { file: "bonkode-fob-04.jpg", caption: "A glazed lift tower at street level" },
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
      { file: "social-ulwe-cidco-school.jpg", caption: "The completed school block, red-and-white elevation" },
      { file: "ulwe-cidco-school-02.jpg", caption: "The school's long elevation and boundary wall" },
    ],
  },
  {
    project: "Karanjade Health Care",
    photos: [
      { file: "social-karanjade-health-care.jpg", caption: "The health centre, its blue glazed column running full height" },
    ],
  },
  {
    project: "Kharghar Golf Course",
    photos: [
      { file: "social-kharghar-golf-course.jpg", caption: "The clubhouse seen across the green" },
      { file: "kharghar-golf-course-02.jpg", caption: "The clubhouse, its stone base and timber-screened terrace" },
      { file: "kharghar-golf-course-03.jpg", caption: "The course, with the Kharghar hills behind" },
    ],
  },
  {
    project: "Lush Meadows",
    photos: [
      { file: "social-lush-meadows.jpg", caption: "The entrance porch, the name lettering above it" },
    ],
  },

  /* The Matunga Z-Bridge — received 2026-09-28 in a folder named "Gati
     Shakti", the first photographs of this structure the site has had
     (OPEN-QUESTIONS.md #38). Appended, so no group above changes index. */
  {
    project: "Matunga Workshop FOB",
    photos: [
      { file: "matunga-workshop-fob-01.jpg", caption: "The western approach, granite-paved between steel railings" },
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

export function getGallery(projectTitle: string): ProjectGallery | undefined {
  return projectGalleries.find((g) => g.project === projectTitle);
}
