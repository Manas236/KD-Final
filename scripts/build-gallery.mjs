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
   and three fixes:
     cropBottom   fraction to trim off the foot ("Shot on OnePlus").
     inset        px to trim off every edge (a Canva export's border).
     trim         remove letterbox bars matching the corner pixel.

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
  // already the Matunga Workshop FOB stand-in (project-matunga-workshop-fob.jpg).
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
  // twin of the Matunga Workshop FOB stand-in (see the note above); and
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

  // Matunga Workshop FOB — the Matunga Z-Bridge. Supplied 2026-09-28 in
  // a folder named "Gati Shakti"; the file names say "Z bridge" and the
  // frames are the Matunga Workshop yard, so it is this project
  // (OPEN-QUESTIONS.md #38). 01 replaces the Bonkode stand-in as the
  // project's card and hero image.
  { out: "matunga-workshop-fob-01.jpg", src: "Gati Shakti/Z bridge approach from the West.jpeg" },
  { out: "matunga-workshop-fob-02.jpg", src: "Gati Shakti/Z bridge.jpeg" },
  { out: "matunga-workshop-fob-03.jpg", src: "Gati Shakti/Z bridge granite and toughened glass.jpeg" },
  { out: "matunga-workshop-fob-04.jpg", src: "Gati Shakti/Girder erection.jpeg" },
  { out: "matunga-workshop-fob-05.jpg", src: "Gati Shakti/Roof members 2.jpeg" },
  { out: "matunga-workshop-fob-06.jpg", src: "Gati Shakti/Roof members.jpeg" },
  { out: "matunga-workshop-fob-07.jpg", src: "Gati Shakti/Erection of roof sheeting over running workshop.jpeg" },
  { out: "matunga-workshop-fob-08.jpg", src: "Gati Shakti/Beautification on the ground.jpeg" },
];

const ONLY = process.argv[2] ?? "";

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
  const input = p.video ? frame(p.video, p.at) : readFileSync(path.join(ROOT, p.src));

  // Orientation first, as its own pass, so every crop below is measured
  // against the image the way it is actually seen.
  let buf = await sharp(input).rotate().toBuffer();
  if (p.trim) buf = await sharp(buf).trim({ threshold: 24 }).toBuffer();

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
