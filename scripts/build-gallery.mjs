/* ============================================================
   Project gallery derivatives
   ------------------------------------------------------------
   Writes src/assets/gallery/*.jpg from the raw media folders at the
   project root. Those folders never enter git (PHOTOS.md, "Processing
   rules"); these derivatives are what the site imports. Astro still
   generates the actual tile and lightbox sizes at request time — this
   script only fixes orientation, crops what has to go, caps the long
   edge and strips metadata (phone EXIF carries GPS).

   The picks follow PHOTOS.md tiers A/B/C, attributed by folder. Captions
   are NOT here — they live in src/data/gallery.ts, keyed by the same
   `out` file name, so this file can be re-run without touching copy.

   Three source kinds:
     src          a still.
     video + at   a frame grab (seconds). Panvel–Karjat has no stills at
                  all — the Chowk folder is video only — so its gallery
                  is frames from the site's own 720p phone footage.
   and four fixes:
     cropBottom   fraction to trim off the foot ("Shot on OnePlus").
     inset        px to trim off every edge (a Canva export's border).
     trim         remove letterbox bars matching the corner pixel.
     crop         [left, top, right, bottom] as fractions — one panel of
                  a WhatsApp collage, or a GPS-camera overlay cut away.

   Usage:  node scripts/build-gallery.mjs [prefix]
   Needs ffmpeg on PATH for the video frames. With a prefix, only the
   outputs whose name starts with it are written — so a new group can
   be added without re-cutting every frame (and without ffmpeg, when
   the new group has no video source).
   ============================================================ */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "src", "assets", "gallery");
const MAX = 1600;

const MANKHURD = "Safety Department/08-01-2026 Mankhurd";

const PHOTOS = [
  // Panvel–Karjat — Chowk site video
  { out: "panvel-karjat-01.jpg", video: "Chowk/WhatsApp Video 2025-04-25 at 4.25.21 PM.mp4", at: 21 },
  { out: "panvel-karjat-02.jpg", video: "Chowk/WhatsApp Video 2025-04-25 at 4.25.21 PM.mp4", at: 40 },
  { out: "panvel-karjat-03.jpg", video: "Chowk/Untitled design (2).mp4", at: 57, inset: 10 },
  { out: "panvel-karjat-04.jpg", video: "Chowk/Untitled design (2).mp4", at: 66, inset: 10 },
  { out: "panvel-karjat-05.jpg", video: "Chowk/1.mp4", at: 2 },

  // Matunga Workshop
  { out: "matunga-workshop-01.jpg", src: "Matunga Images/car shead matunga.jpeg" },
  { out: "matunga-workshop-02.jpg", src: "Matunga Images/matunga 6.jpeg" },
  { out: "matunga-workshop-03.jpg", src: "Matunga Images/matunga 2.jpeg", cropBottom: 0.11 },
  { out: "matunga-workshop-04.jpg", src: "Matunga Images/matunga 1.jpg" },
  { out: "matunga-workshop-05.jpg", src: "Matunga Images/car shead matunga 1.jpeg" },
  { out: "matunga-workshop-06.jpg", src: "Matunga Images/matunga.jpeg" },
  { out: "matunga-workshop-07.jpg", src: "Matunga Images/car shead matunga office.jpeg" },
  { out: "matunga-workshop-08.jpg", src: "Matunga Images/matunga 4.jpeg" },
  { out: "matunga-workshop-09.jpg", src: "Matunga Images/SRS00111.JPG" },
  { out: "matunga-workshop-10.jpg", src: "Matunga Images/SRS00061.JPG" },
  { out: "matunga-workshop-11.jpg", src: "Matunga Images/SRS00116.JPG" },
  { out: "matunga-workshop-12.jpg", src: "Matunga Images/SRS00075.JPG" },

  // Nhava Sheva & Uran
  { out: "nhava-sheva-uran-01.jpg", src: "Nave Sheva/Nhava Sheva 10.JPG" },
  { out: "nhava-sheva-uran-02.jpg", src: "Nave Sheva/nave sheva 1.jpg" },
  { out: "nhava-sheva-uran-03.jpg", src: "Nave Sheva/navha sheva station 1.jpg" },
  { out: "nhava-sheva-uran-04.jpg", src: "Nave Sheva/Nhava Sheva.JPG" },
  { out: "nhava-sheva-uran-05.jpg", src: "Nave Sheva/Nhava Sheva 12.JPG" },
  { out: "nhava-sheva-uran-06.jpg", src: "Nave Sheva/navha sheva station.jpg" },
  { out: "nhava-sheva-uran-07.jpg", src: "Uran Railway Station/uran railway station.jpg" },
  { out: "nhava-sheva-uran-08.jpg", src: "Uran Railway Station/uran railway station 2.jpg" },
  { out: "nhava-sheva-uran-09.jpg", src: "Uran Railway Station/whatsappimage20240112at1217431.jpg" },

  // Harbour Line FOBs — the Vashi FOB
  { out: "harbour-line-fobs-01.jpg", src: "Vashi FOB/AX6A7118.JPG" },
  { out: "harbour-line-fobs-02.jpg", src: "Vashi FOB/VASHI FOB2.jpg" },
  { out: "harbour-line-fobs-03.jpg", src: "Vashi FOB/AX6A7119.JPG" },
  { out: "harbour-line-fobs-04.jpg", src: "Vashi FOB/AX6A7042.JPG" },
  { out: "harbour-line-fobs-05.jpg", src: "Vashi FOB/AX6A7044.JPG" },
  { out: "harbour-line-fobs-06.jpg", src: "Vashi FOB/AX6A7051.JPG" },
  { out: "harbour-line-fobs-07.jpg", src: "Vashi FOB/VASHI FOB 3.jpg" },
  { out: "harbour-line-fobs-08.jpg", src: "Vashi FOB/WhatsApp Image 2025-04-02 at 1.41.57 PM.jpeg" },
  { out: "harbour-line-fobs-09.jpg", src: "Vashi FOB/WhatsApp Image 2025-04-02 at 1.41.58 PM.jpeg" },

  // Mumbai Harbour Line Station Redevelopment — the Mankhurd site
  { out: "harbour-line-stations-01.jpg", src: `${MANKHURD}/IMG_20260108_175026042_HDR.jpg` },
  { out: "harbour-line-stations-02.jpg", src: `${MANKHURD}/IMG_20260108_173643729_HDR.jpg` },
  { out: "harbour-line-stations-03.jpg", src: `${MANKHURD}/IMG_20260108_173715213_HDR.jpg` },

  // Sanpada Carshed
  { out: "sanpada-carshed-01.jpg", src: "Sanpada Carshed/SANPADA CARSHEAD.jpg" },
  { out: "sanpada-carshed-02.jpg", src: "Sanpada Carshed/sanpada carshed.jpg", trim: true },
  { out: "sanpada-carshed-03.jpg", src: "Sanpada Carshed/1744881187763.jpeg" },
  { out: "sanpada-carshed-04.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.05 PM.jpeg" },
  { out: "sanpada-carshed-05.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.57 PM.jpeg" },
  { out: "sanpada-carshed-06.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.20 PM.jpeg" },

  // Beyond the railway — the confirmed non-railway projects, one frame
  // each, shown on /projects as name + location + photograph only. See
  // OPEN-QUESTIONS.md #30 for why one frame and why these frames.
  // `WHITE HOUSE FOB 1.jpg` is deliberately NOT the Bonkode pick: it is
  // formerly the Matunga Z-Bridge stand-in (project-matunga-workshop-fob.jpg).
  { out: "social-bonkode-fob.jpg", src: "Bonkode FOB/AX6A7070.JPG" },
  { out: "social-ulwe-hospital.jpg", src: "Ulwa Hospital/1.jpg" },
  { out: "social-ulwe-cidco-school.jpg", src: "Ulwa CIDCO School/school.jpg" },
  { out: "social-karanjade-health-care.jpg", src: "Karanjade Health Care/Karanjale Health Care.jpg" },
  { out: "social-kharghar-golf-course.jpg", src: "Kharghar Golf Course/GOLF COURSE NEW.jpg" },
  { out: "social-lush-meadows.jpg", src: "Lush Meadows/AX.JPG" },

  // The same projects' further frames, for their own pages under
  // /projects/<slug> (OPEN-QUESTIONS.md #36). Each gallery opens on its
  // social-*.jpg tile above; these follow it. Left out on purpose:
  // AX6A7054 (a hoarding with a model's face fills the left third) and
  // AX6A7071 (AX6A7070 again, a second later); WHITE HOUSE FOB X, the
  // twin of the former Matunga Z-Bridge stand-in (see the note above); and
  // `Ulwa Hospital/ULWE HOSPITAL.jpg`, which shows the Karanjade building
  // (#30). The two collages are cut above their inset thumbnails.
  { out: "bonkode-fob-02.jpg", src: "Bonkode FOB/AX6A7062.JPG" },
  { out: "bonkode-fob-03.jpg", src: "Bonkode FOB/AX6A7085.JPG" },
  { out: "bonkode-fob-04.jpg", src: "Bonkode FOB/AX6A7067.JPG" },
  { out: "ulwe-cidco-school-02.jpg", src: "Ulwa CIDCO School/ULWE CIDCO SCHOOL.jpg", cropBottom: 0.31 },
  { out: "kharghar-golf-course-02.jpg", src: "Kharghar Golf Course/GOLF COURSE.jpg", cropBottom: 0.28 },
  { out: "kharghar-golf-course-03.jpg", src: "Kharghar Golf Course/476809854_2089582004810785_7377283002968379122_n.jpg" },

  // Vindhane steel fabrication plant — /resources/vindhane-plant
  // (OPEN-QUESTIONS.md #33). The two confirmed frames, PHOTOS.md B19 and
  // B20, both recovered from the 2026 Annual PPT at web-export size. B21
  // (EOT crane) is uncaptioned on that slide and stays out until confirmed.
  { out: "vindhane-plant-01.jpg", src: "Vindhane Plant/vindhane-yard-girders-hydra.png" },
  // Portrait; the tile's centre crop would cut the welder's face, so the
  // foot of the frame (the base of the welding set) is trimmed.
  { out: "vindhane-plant-02.jpg", src: "Vindhane Plant/vindhane-welder-wire-feed.png", cropBottom: 0.3 },
  // The client's own labelled set, received 2026-09-28 (OPEN-QUESTIONS.md
  // #38). Left out: "Dussera celebration at Vindhane" (a staff lunch, not
  // the plant) and "Drain construction" (site drainage works).
  { out: "vindhane-plant-03.jpg", src: "Vindhane Plant/Fabrication shop.jpeg" },
  { out: "vindhane-plant-04.jpg", src: "Vindhane Plant/20T crane installation.jpeg" },
  { out: "vindhane-plant-05.jpg", src: "Vindhane Plant/Fabricated girders for Railways.jpeg" },
  { out: "vindhane-plant-06.jpg", src: "Vindhane Plant/WhatsApp Image 2026-09-27 at 18.10.59.jpeg" },
  { out: "vindhane-plant-07.jpg", src: "Vindhane Plant/Fabricated members.jpeg" },
  { out: "vindhane-plant-08.jpg", src: "Vindhane Plant/Fabrication of arched members.jpeg" },
  { out: "vindhane-plant-09.jpg", src: "Vindhane Plant/Metalizing shop.jpeg" },
  { out: "vindhane-plant-10.jpg", src: "Vindhane Plant/Painting shop.jpeg" },
  { out: "vindhane-plant-11.jpg", src: "Vindhane Plant/DG powered facory.jpeg" },
  { out: "vindhane-plant-12.jpg", src: "Vindhane Plant/Vindhane approach road.jpeg" },

  // Karjat RMC plant — /resources/rmc-plant-karjat (OPEN-QUESTIONS.md
  // #37, #38). 01 is also the page's hero. Left out: "New tippers for
  // RMC plant" (a dealer's handover photo, banner and all).
  { out: "rmc-plant-01.jpg", src: "RMC Plant Karjat/RMC plant.jpeg" },
  { out: "rmc-plant-02.jpg", src: "RMC Plant Karjat/Covered RMC plant.jpeg" },
  { out: "rmc-plant-03.jpg", src: "RMC Plant Karjat/RMC plant 2.jpeg" },
  { out: "rmc-plant-04.jpg", src: "RMC Plant Karjat/TM loading.jpeg" },
  { out: "rmc-plant-05.jpg", src: "RMC Plant Karjat/Cement Bulker unloading.jpeg" },
  { out: "rmc-plant-06.jpg", src: "RMC Plant Karjat/RMC plant silos.jpeg" },
  { out: "rmc-plant-07.jpg", src: "RMC Plant Karjat/Silos.jpeg" },
  { out: "rmc-plant-08.jpg", src: "RMC Plant Karjat/RMC plant coverage construction.jpeg" },
  { out: "rmc-plant-09.jpg", src: "RMC Plant Karjat/RMC plant inside.jpeg" },

  // Matunga Z-Bridge (the Matunga Workshop FOB). Supplied 2026-09-28 in
  // a folder named "Gati Shakti"; the file names say "Z bridge" and the
  // frames are the Matunga Workshop yard, so it is this project
  // (OPEN-QUESTIONS.md #38). 02, the aerial of the covered deck, is the
  // project's card and hero image. `Z bridge approach from the West.jpeg`
  // is deliberately NOT used: 2026-09-29 the user confirmed that walkway
  // is not K.D.'s work (#41).
  { out: "matunga-workshop-fob-02.jpg", src: "Gati Shakti/Z bridge.jpeg" },
  { out: "matunga-workshop-fob-03.jpg", src: "Gati Shakti/Z bridge granite and toughened glass.jpeg" },
  { out: "matunga-workshop-fob-04.jpg", src: "Gati Shakti/Girder erection.jpeg" },
  { out: "matunga-workshop-fob-05.jpg", src: "Gati Shakti/Roof members 2.jpeg" },
  { out: "matunga-workshop-fob-06.jpg", src: "Gati Shakti/Roof members.jpeg" },
  { out: "matunga-workshop-fob-07.jpg", src: "Gati Shakti/Erection of roof sheeting over running workshop.jpeg" },
  { out: "matunga-workshop-fob-08.jpg", src: "Gati Shakti/Beautification on the ground.jpeg" },
  // EVERY REMAINING SUPPLIED PHOTOGRAPH — added 2026-09-28 at the user's
  // request that all supplied photos be used (OPEN-QUESTIONS.md #40).
  // Near-duplicates are kept; each group puts its earlier picks first.
  // .CR2 sources are the RAW-only frames (see cr2() below).
  // matunga-workshop
  { out: "matunga-workshop-13.jpg", src: "Matunga Images/CAR SHEAD.jpg" },
  { out: "matunga-workshop-14.jpg", src: "Matunga Images/matunga 1.jpeg", cropBottom: 0.05 },
  { out: "matunga-workshop-15.jpg", src: "Matunga Images/matunga 3.jpeg" },
  { out: "matunga-workshop-16.jpg", src: "Matunga Images/matunga 3.jpg" },
  { out: "matunga-workshop-17.jpg", src: "Matunga Images/matunga 5.jpeg" },
  { out: "matunga-workshop-18.jpg", src: "Matunga Images/matunga.jpg" },
  { out: "matunga-workshop-19.jpg", src: "Matunga Images/SRS00044.JPG" },
  { out: "matunga-workshop-20.jpg", src: "Matunga Images/SRS00045.JPG" },
  { out: "matunga-workshop-21.jpg", src: "Matunga Images/SRS00046.JPG" },
  { out: "matunga-workshop-22.jpg", src: "Matunga Images/SRS00047.JPG" },
  { out: "matunga-workshop-23.jpg", src: "Matunga Images/SRS00048.JPG" },
  { out: "matunga-workshop-24.jpg", src: "Matunga Images/SRS00049.JPG" },
  { out: "matunga-workshop-25.jpg", src: "Matunga Images/SRS00050.JPG" },
  { out: "matunga-workshop-26.jpg", src: "Matunga Images/SRS00051.JPG" },
  { out: "matunga-workshop-27.jpg", src: "Matunga Images/SRS00052.JPG" },
  { out: "matunga-workshop-28.jpg", src: "Matunga Images/SRS00053.JPG" },
  { out: "matunga-workshop-29.jpg", src: "Matunga Images/SRS00054.JPG" },
  { out: "matunga-workshop-30.jpg", src: "Matunga Images/SRS00055.JPG" },
  { out: "matunga-workshop-31.jpg", src: "Matunga Images/SRS00056.JPG" },
  { out: "matunga-workshop-32.jpg", src: "Matunga Images/SRS00057.JPG" },
  { out: "matunga-workshop-33.jpg", src: "Matunga Images/SRS00058.JPG" },
  { out: "matunga-workshop-34.jpg", src: "Matunga Images/SRS00059.JPG" },
  { out: "matunga-workshop-35.jpg", src: "Matunga Images/SRS00060.JPG" },
  { out: "matunga-workshop-36.jpg", src: "Matunga Images/SRS00062.JPG" },
  { out: "matunga-workshop-37.jpg", src: "Matunga Images/SRS00063.JPG" },
  { out: "matunga-workshop-38.jpg", src: "Matunga Images/SRS00064.JPG" },
  { out: "matunga-workshop-39.jpg", src: "Matunga Images/SRS00065.JPG" },
  { out: "matunga-workshop-40.jpg", src: "Matunga Images/SRS00066.JPG" },
  { out: "matunga-workshop-41.jpg", src: "Matunga Images/SRS00067.JPG" },
  { out: "matunga-workshop-42.jpg", src: "Matunga Images/SRS00068.JPG" },
  { out: "matunga-workshop-43.jpg", src: "Matunga Images/SRS00069.JPG" },
  { out: "matunga-workshop-44.jpg", src: "Matunga Images/SRS00070.JPG" },
  { out: "matunga-workshop-45.jpg", src: "Matunga Images/SRS00071.JPG" },
  { out: "matunga-workshop-46.jpg", src: "Matunga Images/SRS00072.JPG" },
  { out: "matunga-workshop-47.jpg", src: "Matunga Images/SRS00073.JPG" },
  { out: "matunga-workshop-48.jpg", src: "Matunga Images/SRS00074.JPG" },
  { out: "matunga-workshop-49.jpg", src: "Matunga Images/SRS00076.JPG" },
  { out: "matunga-workshop-50.jpg", src: "Matunga Images/SRS00077.JPG" },
  { out: "matunga-workshop-51.jpg", src: "Matunga Images/SRS00078.JPG" },
  { out: "matunga-workshop-52.jpg", src: "Matunga Images/SRS00079.JPG" },
  { out: "matunga-workshop-53.jpg", src: "Matunga Images/SRS00080.JPG" },
  { out: "matunga-workshop-54.jpg", src: "Matunga Images/SRS00081.JPG" },
  { out: "matunga-workshop-55.jpg", src: "Matunga Images/SRS00082.JPG" },
  { out: "matunga-workshop-56.jpg", src: "Matunga Images/SRS00083.JPG" },
  { out: "matunga-workshop-57.jpg", src: "Matunga Images/SRS00084.JPG" },
  { out: "matunga-workshop-58.jpg", src: "Matunga Images/SRS00085.JPG" },
  { out: "matunga-workshop-59.jpg", src: "Matunga Images/SRS00086.JPG" },
  { out: "matunga-workshop-60.jpg", src: "Matunga Images/SRS00087.JPG" },
  { out: "matunga-workshop-61.jpg", src: "Matunga Images/SRS00088.JPG" },
  { out: "matunga-workshop-62.jpg", src: "Matunga Images/SRS00089.JPG" },
  { out: "matunga-workshop-63.jpg", src: "Matunga Images/SRS00090.JPG" },
  { out: "matunga-workshop-64.jpg", src: "Matunga Images/SRS00091.JPG" },
  { out: "matunga-workshop-65.jpg", src: "Matunga Images/SRS00092.JPG" },
  { out: "matunga-workshop-66.jpg", src: "Matunga Images/SRS00093.JPG" },
  { out: "matunga-workshop-67.jpg", src: "Matunga Images/SRS00094.JPG" },
  { out: "matunga-workshop-68.jpg", src: "Matunga Images/SRS00095.JPG" },
  { out: "matunga-workshop-69.jpg", src: "Matunga Images/SRS00096.JPG" },
  { out: "matunga-workshop-70.jpg", src: "Matunga Images/SRS00097.JPG" },
  { out: "matunga-workshop-71.jpg", src: "Matunga Images/SRS00098.JPG" },
  { out: "matunga-workshop-72.jpg", src: "Matunga Images/SRS00099.JPG" },
  { out: "matunga-workshop-73.jpg", src: "Matunga Images/SRS00100.JPG" },
  { out: "matunga-workshop-74.jpg", src: "Matunga Images/SRS00101.JPG" },
  { out: "matunga-workshop-75.jpg", src: "Matunga Images/SRS00102.JPG" },
  { out: "matunga-workshop-76.jpg", src: "Matunga Images/SRS00103.JPG" },
  { out: "matunga-workshop-77.jpg", src: "Matunga Images/SRS00104.JPG" },
  { out: "matunga-workshop-78.jpg", src: "Matunga Images/SRS00105.JPG" },
  { out: "matunga-workshop-79.jpg", src: "Matunga Images/SRS00106.JPG" },
  { out: "matunga-workshop-80.jpg", src: "Matunga Images/SRS00107.JPG" },
  { out: "matunga-workshop-81.jpg", src: "Matunga Images/SRS00108.JPG" },
  { out: "matunga-workshop-82.jpg", src: "Matunga Images/SRS00109.JPG" },
  { out: "matunga-workshop-83.jpg", src: "Matunga Images/SRS00110.JPG" },
  { out: "matunga-workshop-84.jpg", src: "Matunga Images/SRS00112.JPG" },
  { out: "matunga-workshop-85.jpg", src: "Matunga Images/SRS00113.JPG" },
  { out: "matunga-workshop-86.jpg", src: "Matunga Images/SRS00114.JPG" },
  { out: "matunga-workshop-87.jpg", src: "Matunga Images/SRS00115.JPG" },
  { out: "matunga-workshop-88.jpg", src: "Matunga Images/SRS00117.JPG" },
  { out: "matunga-workshop-89.jpg", src: "Matunga Images/SRS00118.JPG" },
  { out: "matunga-workshop-90.jpg", src: "Matunga Images/SRS00119.JPG" },
  { out: "matunga-workshop-91.jpg", src: "Matunga Images/SRS00120.JPG" },
  { out: "matunga-workshop-92.jpg", src: "Matunga Images/SRS00121.JPG" },
  { out: "matunga-workshop-93.jpg", src: "Matunga Images/SRS00122.JPG" },
  { out: "matunga-workshop-94.jpg", src: "Matunga Images/SRS00123.JPG" },
  { out: "matunga-workshop-95.jpg", src: "Matunga Images/SRS00124.JPG" },
  { out: "matunga-workshop-96.jpg", src: "Matunga Images/SRS00125.JPG" },
  { out: "matunga-workshop-97.jpg", src: "Matunga Images/SRS00126.JPG" },
  // hse
  { out: "hse-01.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_173738585.jpg" },
  { out: "hse-02.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174110605.jpg" },
  { out: "hse-03.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174113121.jpg" },
  { out: "hse-04.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174153079_HDR.jpg" },
  { out: "hse-05.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174221160_HDR.jpg" },
  { out: "hse-06.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174321542.jpg" },
  { out: "hse-07.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174436319_HDR.jpg" },
  { out: "hse-08.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174437189_HDR.jpg" },
  { out: "hse-09.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174438714_HDR.jpg" },
  { out: "hse-10.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174447943_HDR.jpg" },
  { out: "hse-11.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174456677_HDR.jpg" },
  { out: "hse-12.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174457432_HDR.jpg" },
  { out: "hse-13.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174503511_HDR.jpg" },
  { out: "hse-14.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174511803_HDR.jpg" },
  { out: "hse-15.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174513115_HDR.jpg" },
  { out: "hse-16.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174522300_HDR.jpg" },
  { out: "hse-17.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174523332_HDR.jpg" },
  { out: "hse-18.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174539616_HDR.jpg" },
  { out: "hse-19.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174540871_HDR.jpg" },
  { out: "hse-20.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174546347_HDR.jpg" },
  { out: "hse-21.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174627928_HDR.jpg" },
  { out: "hse-22.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174628842_HDR.jpg" },
  { out: "hse-23.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174630044_HDR.jpg" },
  { out: "hse-24.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174636717_HDR.jpg" },
  { out: "hse-25.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174637929_HDR.jpg" },
  { out: "hse-26.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174656840_HDR.jpg" },
  { out: "hse-27.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174657939_HDR.jpg" },
  { out: "hse-28.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174710236_HDR.jpg" },
  { out: "hse-29.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174710891_HDR.jpg" },
  { out: "hse-30.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174729519_HDR.jpg" },
  { out: "hse-31.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174730789_HDR.jpg" },
  { out: "hse-32.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174741599_HDR.jpg" },
  { out: "hse-33.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174742362_HDR.jpg" },
  { out: "hse-34.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174803965_HDR.jpg" },
  { out: "hse-35.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174815085_HDR.jpg" },
  { out: "hse-36.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174816461_HDR.jpg" },
  { out: "hse-37.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174817928_HDR.jpg" },
  { out: "hse-38.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174829878_HDR.jpg" },
  { out: "hse-39.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174830850_HDR.jpg" },
  { out: "hse-40.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174944170_HDR.jpg" },
  { out: "hse-41.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_174948305_HDR.jpg" },
  { out: "hse-42.jpg", src: "Safety Department/08-01-2026 Mankhurd/IMG_20260108_175027693_HDR.jpg" },
  { out: "hse-43.jpg", src: "Safety Department/08-01-2026 Mankhurd/New folder/IMG_20260108_173738585.jpg" },
  { out: "hse-44.jpg", src: "Safety Department/08-01-2026 Mankhurd/New folder/IMG_20260108_174110605.jpg" },
  { out: "hse-45.jpg", src: "Safety Department/08-01-2026 Mankhurd/New folder/IMG_20260108_174438714_HDR.jpg" },
  { out: "hse-46.jpg", src: "Safety Department/08-01-2026 Mankhurd/New folder/IMG_20260108_174628842_HDR.jpg" },
  { out: "hse-47.jpg", src: "Safety Department/08-01-2026 Mankhurd/New folder/IMG_20260108_174729519_HDR.jpg" },
  { out: "hse-48.jpg", src: "Safety Department/08-01-2026 Mankhurd/New folder/IMG_20260108_175027693_HDR.jpg" },
  { out: "hse-49.jpg", src: "HSE Department/image20.jpg" },
  { out: "hse-50.jpg", src: "HSE Department/Picture2.jpg" },
  { out: "hse-51.jpg", src: "HSE Department/Picture3.jpg" },
  { out: "hse-52.jpg", src: "HSE Department/Picture4.jpg" },
  { out: "hse-53.jpg", src: "HSE Department/Picture5.jpg" },
  { out: "hse-54.jpg", src: "HSE Department/WhatsApp Image 2025-04-30 at 9.44.56 PM.jpeg" },
  { out: "hse-55.jpg", src: "HSE Department/WhatsApp Image 2025-04-30 at 9.44.57 PM.jpeg" },
  // hse — the EHS team's September 2026 WhatsApp reports (OPEN-QUESTIONS.md #42).
  // Named by subject, not number, so the file name says what the picture is.
  { out: "hse-national-safety-week-karjat.jpg", src: "HSE Department/2026-09 EHS reports/safety-week-300000-safe-man-hours-karjat.jpg" },
  { out: "hse-national-safety-day-mankhurd.jpg", src: "HSE Department/2026-09 EHS reports/national-safety-day-mankhurd.jpg" },
  { out: "hse-medical-camp-mankhurd.jpg", src: "HSE Department/2026-09 EHS reports/medical-camp-mankhurd.jpeg" },
  // top panel of a two-photo collage
  { out: "hse-lifting-training-govandi.jpg", src: "HSE Department/2026-09 EHS reports/lifting-training-govandi.jpeg", crop: [0.027, 0.02, 0.973, 0.494] },
  // cuts the GPS-camera map (top) and the coordinates stamp (foot)
  { out: "hse-air-monitoring-mankhurd.jpg", src: "HSE Department/2026-09 EHS reports/air-quality-monitoring-mankhurd.jpg", crop: [0, 0.2, 1, 0.9] },
  { out: "hse-world-environment-day.jpg", src: "HSE Department/2026-09 EHS reports/world-environment-day-toolbox-talk.jpg" },
  { out: "hse-worker-recognition.jpg", src: "HSE Department/2026-09 EHS reports/worker-recognition-award.jpg" },
  // added 2026-10-09 — the electrical-shock mock drill photo from the same batch
  { out: "hse-electrical-shock-drill-mankhurd.jpg", src: "HSE Department/2026-09 EHS reports/electrical-shock-drill-mankhurd.jpg" },
  // sanpada-carshed
  { out: "sanpada-carshed-07.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 6.15.14 PM.jpeg" },
  { out: "sanpada-carshed-08.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 6.15.15 PM (1).jpeg" },
  { out: "sanpada-carshed-09.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 6.15.15 PM.jpeg" },
  { out: "sanpada-carshed-10.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 6.15.17 PM (1).jpeg" },
  { out: "sanpada-carshed-11.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 6.15.17 PM.jpeg" },
  { out: "sanpada-carshed-12.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 6.15.18 PM.jpeg" },
  { out: "sanpada-carshed-13.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.53 PM (1).jpeg" },
  { out: "sanpada-carshed-14.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.53 PM.jpeg" },
  { out: "sanpada-carshed-15.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.54 PM.jpeg" },
  { out: "sanpada-carshed-16.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.55 PM.jpeg" },
  { out: "sanpada-carshed-17.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.56 PM (1).jpeg" },
  { out: "sanpada-carshed-18.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.56 PM (2).jpeg" },
  { out: "sanpada-carshed-19.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.56 PM.jpeg" },
  { out: "sanpada-carshed-20.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.58 PM (1).jpeg" },
  { out: "sanpada-carshed-21.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.09.58 PM.jpeg" },
  { out: "sanpada-carshed-22.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.04 PM.jpeg" },
  { out: "sanpada-carshed-23.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.17 PM (1).jpeg" },
  { out: "sanpada-carshed-24.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.17 PM.jpeg" },
  { out: "sanpada-carshed-25.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.18 PM (1).jpeg" },
  { out: "sanpada-carshed-26.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.18 PM.jpeg" },
  { out: "sanpada-carshed-27.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.19 PM.jpeg" },
  { out: "sanpada-carshed-28.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.20 PM (1).jpeg" },
  { out: "sanpada-carshed-29.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.21 PM (1).jpeg" },
  { out: "sanpada-carshed-30.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.21 PM.jpeg" },
  { out: "sanpada-carshed-31.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.22 PM (1).jpeg" },
  { out: "sanpada-carshed-32.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.22 PM.jpeg" },
  { out: "sanpada-carshed-33.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.23 PM (1).jpeg" },
  { out: "sanpada-carshed-34.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.23 PM.jpeg" },
  { out: "sanpada-carshed-35.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.24 PM.jpeg" },
  { out: "sanpada-carshed-36.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.25 PM.jpeg" },
  { out: "sanpada-carshed-37.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.26 PM (1).jpeg" },
  { out: "sanpada-carshed-38.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.26 PM.jpeg" },
  { out: "sanpada-carshed-39.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.28 PM (1).jpeg" },
  { out: "sanpada-carshed-40.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.28 PM.jpeg" },
  { out: "sanpada-carshed-41.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.40 PM (1).jpeg" },
  { out: "sanpada-carshed-42.jpg", src: "Sanpada Carshed/WhatsApp Image 2026-01-02 at 7.10.40 PM.jpeg" },
  // bonkode-fob
  { out: "bonkode-fob-05.jpg", src: "Bonkode FOB/1.jpg" },
  { out: "bonkode-fob-06.jpg", src: "Bonkode FOB/Add a subheading.png" },
  { out: "bonkode-fob-07.jpg", src: "Bonkode FOB/AX6A7054.JPG" },
  { out: "bonkode-fob-08.jpg", src: "Bonkode FOB/AX6A7058.CR2" },
  { out: "bonkode-fob-09.jpg", src: "Bonkode FOB/AX6A7059.CR2" },
  { out: "bonkode-fob-10.jpg", src: "Bonkode FOB/AX6A7060.CR2" },
  { out: "bonkode-fob-11.jpg", src: "Bonkode FOB/AX6A7063.CR2" },
  { out: "bonkode-fob-12.jpg", src: "Bonkode FOB/AX6A7064.CR2" },
  { out: "bonkode-fob-13.jpg", src: "Bonkode FOB/AX6A7065.CR2" },
  { out: "bonkode-fob-14.jpg", src: "Bonkode FOB/AX6A7071.JPG" },
  { out: "bonkode-fob-15.jpg", src: "Bonkode FOB/AX6A7074.CR2" },
  { out: "bonkode-fob-16.jpg", src: "Bonkode FOB/AX6A7083 (1).CR2" },
  { out: "bonkode-fob-17.jpg", src: "Bonkode FOB/AX6A7083.CR2" },
  { out: "bonkode-fob-18.jpg", src: "Bonkode FOB/AX6A7086.CR2" },
  { out: "bonkode-fob-19.jpg", src: "Bonkode FOB/AX6A7091.CR2" },
  { out: "bonkode-fob-20.jpg", src: "Bonkode FOB/AX6A7092.CR2" },
  { out: "bonkode-fob-21.jpg", src: "Bonkode FOB/AX6A7096.CR2" },
  { out: "bonkode-fob-22.jpg", src: "Bonkode FOB/AX6A7098.CR2" },
  { out: "bonkode-fob-23.jpg", src: "Bonkode FOB/AX6A7099.CR2" },
  { out: "bonkode-fob-24.jpg", src: "Bonkode FOB/AX6A7103.CR2" },
  { out: "bonkode-fob-25.jpg", src: "Bonkode FOB/AX6A7104.CR2" },
  { out: "bonkode-fob-26.jpg", src: "Bonkode FOB/WHITE HOUSE FOB 1.jpg" },
  { out: "bonkode-fob-27.jpg", src: "Bonkode FOB/WHITE HOUSE FOB X.jpg" },
  { out: "bonkode-fob-28.jpg", src: "Bonkode FOB/WHITE HOUSE FOB.CR2" },
  // kharghar-golf-course
  { out: "kharghar-golf-course-04.jpg", src: "Kharghar Golf Course/AX6A7025.CR2" },
  { out: "kharghar-golf-course-05.jpg", src: "Kharghar Golf Course/AX6A7028.CR2" },
  { out: "kharghar-golf-course-06.jpg", src: "Kharghar Golf Course/AX6A7033.CR2" },
  { out: "kharghar-golf-course-07.jpg", src: "Kharghar Golf Course/AX6A7034.CR2" },
  { out: "kharghar-golf-course-08.jpg", src: "Kharghar Golf Course/AX6A7039.CR2" },
  { out: "kharghar-golf-course-09.jpg", src: "Kharghar Golf Course/Black Aesthetic Photo Collage Instagram Post.png" },
  { out: "kharghar-golf-course-10.jpg", src: "Kharghar Golf Course/GOLF COURSE 1.jpg" },
  { out: "kharghar-golf-course-11.jpg", src: "Kharghar Golf Course/GOLF COURSE old 1.jpg" },
  { out: "kharghar-golf-course-12.jpg", src: "Kharghar Golf Course/KVGC5-2.jpg" },
  { out: "kharghar-golf-course-13.jpg", src: "Kharghar Golf Course/Screenshot 2025-04-02 175812.png" },
  // lush-meadows
  { out: "lush-meadows-02.jpg", src: "Lush Meadows/Brown Modern Skincare Photo Collage Instagram Post.png" },
  { out: "lush-meadows-03.jpg", src: "Lush Meadows/kailash-lush-meadows-in-kharghar-elevation-photo-137z.jpg" },
  // nhava-sheva-uran
  { out: "nhava-sheva-uran-10.jpg", src: "Nave Sheva/NHAVA SHIVA RAILWAY STATION.jpg" },
  { out: "nhava-sheva-uran-11.jpg", src: "Uran Railway Station/unnamed (1).jpg" },
  { out: "nhava-sheva-uran-12.jpg", src: "Uran Railway Station/unnamed (2).jpg" },
  { out: "nhava-sheva-uran-13.jpg", src: "Uran Railway Station/Your paragraph text.png" },
  // karanjade-health-care
  { out: "karanjade-health-care-02.jpg", src: "Ulwa Hospital/ULWE HOSPITAL.jpg" },
  // harbour-line-fobs
  { out: "harbour-line-fobs-10.jpg", src: "Vashi FOB/AX6A7041.CR2" },
  { out: "harbour-line-fobs-11.jpg", src: "Vashi FOB/AX6A7043.JPG" },
  { out: "harbour-line-fobs-12.jpg", src: "Vashi FOB/AX6A7045.CR2" },
  { out: "harbour-line-fobs-13.jpg", src: "Vashi FOB/AX6A7048.CR2" },
  { out: "harbour-line-fobs-14.jpg", src: "Vashi FOB/AX6A7050.CR2" },
  { out: "harbour-line-fobs-15.jpg", src: "Vashi FOB/AX6A7053.CR2" },
  { out: "harbour-line-fobs-16.jpg", src: "Vashi FOB/AX6A7109.CR2" },
  { out: "harbour-line-fobs-17.jpg", src: "Vashi FOB/AX6A7113.CR2" },
  { out: "harbour-line-fobs-18.jpg", src: "Vashi FOB/AX6A7116.CR2" },
  { out: "harbour-line-fobs-19.jpg", src: "Vashi FOB/ddb.JPG" },
  { out: "harbour-line-fobs-20.jpg", src: "Vashi FOB/Untitled design.png" },
  { out: "harbour-line-fobs-21.jpg", src: "Vashi FOB/VASHI FOB 3.jpeg" },
  { out: "harbour-line-fobs-22.jpg", src: "Vashi FOB/VASHI FOB 4.jpg" },
  { out: "harbour-line-fobs-23.jpg", src: "Vashi FOB/VASHI FOB1.JPG" },
  // vindhane-plant
  { out: "vindhane-plant-13.jpg", src: "Vindhane Plant/Drain construction.jpeg" },
  { out: "vindhane-plant-14.jpg", src: "Vindhane Plant/Dussera celebration at Vindhane.jpeg" },
  { out: "vindhane-plant-15.jpg", src: "Vindhane Plant/vindhane-fleet-and-team.png" },
  { out: "vindhane-plant-16.jpg", src: "Vindhane Plant/vindhane-shed-eot-crane.png" },
  // rmc-plant
  { out: "rmc-plant-10.jpg", src: "RMC Plant Karjat/New tippers for RMC plant.jpeg" },
];

const ONLY = process.argv[2] ?? "";

/* A Canon .CR2 is a TIFF whose IFD0 strip is a full-size JPEG — the
   camera's own rendering of the RAW. Returned with IFD0's orientation
   applied, since the embedded JPEG carries none of its own. Used for the
   31 frames that exist only as RAW (OPEN-QUESTIONS.md #40). */
async function cr2(file) {
  const b = readFileSync(file);
  const le = b.toString("latin1", 0, 2) === "II";
  const u16 = (o) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
  const u32 = (o) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
  const ifd = u32(4);
  const tags = {};
  for (let i = 0, n = u16(ifd); i < n; i++) {
    const e = ifd + 2 + i * 12;
    const type = u16(e + 2);
    tags[u16(e)] = type === 3 ? u16(e + 8) : u32(e + 8);
  }
  const jpeg = b.subarray(tags[0x0111], tags[0x0111] + tags[0x0117]);
  const angle = { 3: 180, 6: 90, 8: 270 }[tags[0x0112]] ?? 0;
  return sharp(jpeg).rotate(angle).toBuffer();
}

function frame(video, at) {
  return execFileSync(
    "ffmpeg",
    ["-v", "error", "-ss", String(at), "-i", path.join(ROOT, video), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
    { maxBuffer: 64 * 1024 * 1024 }
  );
}

mkdirSync(OUT, { recursive: true });

for (const p of PHOTOS) {
  if (ONLY && !p.out.startsWith(ONLY)) continue;
  const input = p.video
    ? frame(p.video, p.at)
    : /\.cr2$/i.test(p.src)
      ? await cr2(path.join(ROOT, p.src))
      : readFileSync(path.join(ROOT, p.src));

  // Orientation first, as its own pass, so every crop below is measured
  // against the image the way it is actually seen.
  let buf = await sharp(input).rotate().toBuffer();
  if (p.trim) buf = await sharp(buf).trim({ threshold: 24 }).toBuffer();

  if (p.crop) {
    const m = await sharp(buf).metadata();
    const [l, t, r, b] = p.crop;
    buf = await sharp(buf)
      .extract({
        left: Math.round(m.width * l),
        top: Math.round(m.height * t),
        width: Math.round(m.width * (r - l)),
        height: Math.round(m.height * (b - t)),
      })
      .toBuffer();
  }

  const { width, height } = await sharp(buf).metadata();
  const inset = p.inset ?? 0;
  const bottom = Math.round(height * (p.cropBottom ?? 0));
  if (inset || bottom) {
    buf = await sharp(buf)
      .extract({ left: inset, top: inset, width: width - inset * 2, height: height - inset * 2 - bottom })
      .toBuffer();
  }

  const info = await sharp(buf)
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, p.out));

  console.log(`${p.out.padEnd(30)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}
