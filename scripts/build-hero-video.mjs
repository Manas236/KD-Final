/* ============================================================
   Homepage hero video
   ------------------------------------------------------------
   Cuts the homepage hero's background loop out of the raw DJI drone
   footage of Uran Railway Station (Uran_Drone_Footage/ at the project
   root: git-ignored like every raw client folder, listed in
   raw-media.manifest.txt). The originals are only ever read.

   The edit is data, SHOTS below: one steady stretch per clip, played at
   natural speed, joined by XFADE_SECONDS dissolves, in an order that
   flows wide, closer, inside, then back out. The loop is seamless: the
   video opens XFADE_SECONDS into the first shot and ends by dissolving
   into that shot's opening seconds, so its last frame runs straight on
   into its first.

   Writes:
     public/video/hero-uran-1080.mp4   1920x1080, what desktop plays
     public/video/hero-uran-720.mp4    1280x720, for phones, used only if
                                       Hero.astro's HERO_VIDEO_ON_PHONES
                                       is switched on
     src/assets/hero-uran-poster.jpg   the video's first frame, the still
                                       the <Image> under the video shows

   How:
     1. A near-lossless master in the temp folder. Each shot is trimmed
        with input seeking (-ss and -t before -i), so only the seconds
        used are decoded, then brought to one frame rate (the source's,
        or 30 if that is higher) and size, and dissolved together.
     2. Both MP4s are encoded from the master: H.264 High, 8-bit
        yuv420p, BT.709 tags, no audio, +faststart. A file over its
        budget is re-encoded at CRF + CRF_STEP, up to CRF_RETRIES times;
        if it is still over, the longest shot loses a second and
        everything is cut again.
     3. The poster is the master's first frame, through sharp as in
        build-gallery.mjs.

   Usage:  node scripts/build-hero-video.mjs
   Needs ffmpeg and ffprobe on PATH. ffmpeg's own output goes to
   build.log in the work folder; on a failure the last 10 lines of it
   are printed.
   ============================================================ */
import sharp from "sharp";
import { execFileSync, spawnSync } from "node:child_process";
import { closeSync, mkdirSync, openSync, readFileSync, statSync, writeFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RAW = path.join(ROOT, "Uran_Drone_Footage");
const WORK = path.join(tmpdir(), "kd-hero-video");
const LOG = path.join(WORK, "build.log");
const MASTER = path.join(WORK, "master.mp4");

/* The edit, in playing order. `in` and `out` are seconds into the clip.
   DJI_0588 is not used: it is a fast turn on the spot above the roof,
   with no steady stretch long enough. */
const SHOTS = [
  // Wide: high over the line, closing slowly on the station, mid-frame with the town behind.
  { file: "DJI_0575.MOV", in: 13.5, out: 19.5 },
  // Closer: a level sideways pass along the length of the shed, hills behind.
  { file: "DJI_0580.MOV", in: 21.5, out: 27.5 },
  // Inside: flying down the platform under the roof trusses.
  { file: "DJI_0604.MOV", in: 17.0, out: 22.5 },
  // Closest: easing in on the URAN name board. Ends before the camera jolts at 5.8s.
  { file: "DJI_0569.MOV", in: 0.7, out: 5.7 },
  // Back out: rising away from the station, the town on the skyline. Dissolves into the first shot.
  { file: "DJI_0570.MOV", in: 18.0, out: 24.0 },
];
const XFADE_SECONDS = 0.8;
const MAX_FPS = 30;

/* Encoding. CRF is the starting quality; the budget loop only ever
   raises it. MB here is a million bytes. */
const CRF = 27;
const CRF_STEP = 2;
const CRF_RETRIES = 3;
const MAXRATE = "2.5M";
const BUFSIZE = "5M";
const PRESET = "slow";
const MB = 1000 * 1000;
const OUTPUTS = [
  { file: "public/video/hero-uran-1080.mp4", width: 1920, height: 1080, budget: 9 * MB },
  { file: "public/video/hero-uran-720.mp4", width: 1280, height: 720, budget: 3.5 * MB },
];
const POSTER = { file: "src/assets/hero-uran-poster.jpg", width: 1920, quality: 90 };

/* The master: as big as the largest output, near-lossless, temp only. */
const MASTER_SIZE = { width: 1920, height: 1080 };
const MASTER_CRF = 10;

/* The last resort, shortening shots, stops here. */
const MAX_SHORTENINGS = 3;
const MIN_SHOT_SECONDS = 4;

const COLOUR = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv"];

mkdirSync(WORK, { recursive: true });
writeFileSync(LOG, "");

function run(cmd, args) {
  const fd = openSync(LOG, "a");
  writeSync(fd, `\n$ ${cmd} ${args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(" ")}\n`);
  const r = spawnSync(cmd, args, { stdio: ["ignore", fd, fd] });
  closeSync(fd);
  if (r.status !== 0) {
    const tail = readFileSync(LOG, "utf8").trimEnd().split(/\r?\n/).slice(-10).join("\n");
    console.error(`${cmd} failed (${r.error ? r.error.message : `exit ${r.status}`}). Last lines of ${LOG}:\n${tail}`);
    process.exit(1);
  }
}

function probe(file, entries) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", entries, "-of", "json", file], { encoding: "utf8" });
  return JSON.parse(out);
}

/* The frame rate every shot is brought to, as ffmpeg wants it and as a number. */
const rates = SHOTS.map((s) => probe(path.join(RAW, s.file), "stream=codec_type,r_frame_rate").streams)
  .map((streams) => streams.find((st) => st.codec_type === "video").r_frame_rate)
  .map((r) => ({ arg: r, value: r.split("/").reduce((n, d) => n / d) }));
const slowest = rates.reduce((a, b) => (b.value < a.value ? b : a));
const FPS = slowest.value <= MAX_FPS ? slowest : { arg: String(MAX_FPS), value: MAX_FPS };

const frames = (seconds) => Math.round(seconds * FPS.value);
const seconds = (n) => (n / FPS.value).toFixed(6);
const mb = (bytes) => `${(bytes / MB).toFixed(2)} MB`;

/* Step 1. Returns the length of the cut in frames. */
function buildMaster(shots) {
  const fade = frames(XFADE_SECONDS);
  const [first, ...rest] = shots;
  const pieces = [
    { file: first.file, start: first.in + fade / FPS.value, frames: frames(first.out - first.in) - fade },
    ...rest.map((s) => ({ file: s.file, start: s.in, frames: frames(s.out - s.in) })),
    { file: first.file, start: first.in, frames: fade },
  ];

  const args = ["-hide_banner", "-nostats", "-y"];
  for (const p of pieces) {
    // A couple of spare frames in, so the trim below is never short.
    args.push("-ss", p.start.toFixed(3), "-t", seconds(p.frames + 2), "-i", path.join(RAW, p.file));
  }
  const { width, height } = MASTER_SIZE;
  const graph = pieces.map(
    (p, i) =>
      `[${i}:v]setpts=PTS-STARTPTS,fps=${FPS.arg},scale=${width}:${height}:flags=lanczos,setsar=1,format=yuv420p,` +
      `trim=end_frame=${p.frames},setpts=PTS-STARTPTS,settb=AVTB[p${i}]`,
  );
  let last = "p0";
  let length = pieces[0].frames;
  for (let i = 1; i < pieces.length; i++) {
    const out = i === pieces.length - 1 ? "v" : `x${i}`;
    graph.push(`[${last}][p${i}]xfade=transition=fade:duration=${seconds(fade)}:offset=${seconds(length - fade)}[${out}]`);
    length += pieces[i].frames - fade;
    last = out;
  }

  args.push(
    "-filter_complex", graph.join(";"),
    "-map", "[v]", "-an", "-sn", "-dn", "-map_metadata", "-1", "-map_chapters", "-1",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", String(MASTER_CRF), "-pix_fmt", "yuv420p", ...COLOUR,
    MASTER,
  );
  run("ffmpeg", args);
  return length;
}

/* Step 2, one output at one CRF. Returns its size in bytes. */
function encode(output, crf) {
  const dest = path.join(ROOT, output.file);
  mkdirSync(path.dirname(dest), { recursive: true });
  const args = ["-hide_banner", "-nostats", "-y", "-i", MASTER, "-map", "0:v:0", "-an", "-sn", "-dn", "-map_metadata", "-1"];
  if (output.width !== MASTER_SIZE.width || output.height !== MASTER_SIZE.height) {
    args.push("-vf", `scale=${output.width}:${output.height}:flags=lanczos`);
  }
  args.push(
    "-c:v", "libx264", "-profile:v", "high", "-preset", PRESET,
    "-crf", String(crf), "-maxrate", MAXRATE, "-bufsize", BUFSIZE,
    "-pix_fmt", "yuv420p", ...COLOUR, "-movflags", "+faststart",
    dest,
  );
  run("ffmpeg", args);
  return statSync(dest).size;
}

/* Step 3. RGB through the BT.709 matrix the video is tagged with, so the
   still matches the first frame as a browser draws it. */
async function writePoster() {
  const png = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", MASTER, "-frames:v", "1", "-vf", "scale=in_color_matrix=bt709:in_range=tv,format=rgb24", "-f", "image2pipe", "-vcodec", "png", "-"],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  return sharp(png)
    .resize({ width: POSTER.width })
    .jpeg({ quality: POSTER.quality, mozjpeg: true })
    .toFile(path.join(ROOT, POSTER.file));
}

const shots = SHOTS.map((s) => ({ ...s }));
for (let shortened = 0; ; shortened++) {
  const length = buildMaster(shots);
  console.log(`cut: ${shots.length} shots, ${(length / FPS.value).toFixed(2)} s at ${FPS.value} fps (${length} frames), log ${LOG}`);

  const done = [];
  let over = null;
  for (const output of OUTPUTS) {
    let crf = CRF;
    let size = encode(output, crf);
    for (let retry = 1; size > output.budget && retry <= CRF_RETRIES; retry++) {
      console.log(`  ${output.file}: ${mb(size)} at CRF ${crf}, over ${mb(output.budget)}; trying CRF ${crf + CRF_STEP}`);
      crf += CRF_STEP;
      size = encode(output, crf);
    }
    if (size > output.budget) {
      over = { output, size, crf };
      break;
    }
    done.push({ output, size, crf });
  }

  if (!over) {
    const poster = await writePoster();
    for (const { output, size, crf } of done) {
      const info = probe(path.join(ROOT, output.file), "stream=codec_type,codec_name,profile,pix_fmt,width,height,r_frame_rate:format=duration");
      const video = info.streams.find((st) => st.codec_type === "video");
      const audio = info.streams.filter((st) => st.codec_type === "audio").length;
      console.log(
        `${output.file.padEnd(34)} ${video.width}x${video.height} ${video.codec_name} ${video.profile} ${video.pix_fmt} ` +
          `${video.r_frame_rate} fps, ${Number(info.format.duration).toFixed(2)} s, ${audio} audio, CRF ${crf}, ${mb(size)} (budget ${mb(output.budget)})`,
      );
    }
    console.log(`${POSTER.file.padEnd(34)} ${poster.width}x${poster.height} ${Math.round(poster.size / 1024)} KB`);
    console.log("shots:", shots.map((s) => `${s.file} ${s.in}-${s.out}`).join(", "));
    break;
  }

  const longest = shots.reduce((a, s) => (s.out - s.in > a.out - a.in ? s : a));
  if (shortened === MAX_SHORTENINGS || longest.out - longest.in - 1 < MIN_SHOT_SECONDS) {
    console.error(`${over.output.file} is still ${mb(over.size)} at CRF ${over.crf}, over its ${mb(over.output.budget)} budget. Giving up.`);
    process.exit(1);
  }
  console.log(`  ${over.output.file} still over at CRF ${over.crf}: shortening ${longest.file} to ${longest.in}-${longest.out - 1}`);
  longest.out -= 1;
}
