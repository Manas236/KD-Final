# ASSETS — Media Inventory

What arrived in the August 2026 drop, what's usable, and what still needs shooting.

**Scanned:** 2026-08-15 · **255 images · 12 videos · ~54 PDFs · 3.6 GB**
**Facts derived from these assets live in:** [KD_INFO.md](KD_INFO.md) §7
**Last updated:** 2026-08-18

> **Revision 3 — 2026-08-18.** The approved document (`K.D.Website_Details.docx`) identifies **four** of
> the nine previously unknown photographed projects, so four folders now have a project page to attach to.
> It also names **six projects with no photography at all**, which widens the shooting gap rather than
> closing it. Mapping updated throughout.

---

## ⚠️ Two things to deal with first

### 1. 3.6 GB of media is sitting untracked in the repo root

None of it is covered by [.gitignore](../.gitignore). A single `git add .` commits 3.6 GB into git
history permanently — and git history cannot be trimmed without a force-push rewrite.

**Recommended:** move the source media out of the repo (a `kd-assets/` folder alongside it, or
Drive/OneDrive), and commit only the web-optimised derivatives under `public/`. Failing that, add the
folder names to `.gitignore` before the next commit. I have not changed `.gitignore` — say the word and
I will.

### 2. `Engineers Certificates/` contains personal data

~54 PDFs of named individuals' degree and diploma certificates — roughly 26 engineers in the main folder
plus more under `Others/`, including one for a director (`2.4 Shiv Kailash Gindodia.pdf`).

These look like **tender pre-qualification documents**, not website material. They should not be
published, and they should not enter git history. Treat this folder as confidential and store it outside
the repo.

*Useful signal, though:* the folder implies roughly **26 qualified engineers on staff** — the first hard
number we have toward the employee headcount in [NEEDED.md](NEEDED.md) #28.

---

## Inventory by folder

| Folder | Images | Video | Size | Largest | Quality | Maps to |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Matunga Images | 97 | 3 | 1.5 GB | 6000×4000 | ★★★ pro DSLR | Matunga Railway Workshop |
| Safety Department | 51 | 2 | 644 MB | 4096×3072 | ★★★ | HSE · Mankhurd (Harbour Line) |
| Sanpada Carshed | 42 | — | 6.9 MB | 4000×2250 | ★☆☆ 40 of 42 compressed | Sanpada Carshed |
| Vashi FOB | 15 | — | 366 MB | 5760×3840 | ★★★ + RAW | **Harbour Line FOBs** ★ *(now documented)* |
| Bonkode FOB | 10 | — | 648 MB | 5760×3840 | ★★★ + RAW | ⬜ unidentified — possibly Harbour Line FOBs |
| Kharghar Golf Course | 8 | — | 12.5 MB | 5760×3840 | ★★☆ mixed + RAW | **Kharghar Golf Course** ★ *(named, undescribed)* |
| Nave Sheva | 7 | — | 25.9 MB | 4000×2250 | ★★★ | **Nhava Sheva Station** ★ *(now documented)* |
| HSE Department | 7 | — | 2.7 MB | 4096×3072 | ★★☆ mixed | HSE |
| Uran Railway Station | 6 | — | 10.9 MB | 3474×1939 | ★★☆ | **Uran Station** ★ *(now documented)* |
| Lush Meadows | 3 | — | 10.9 MB | 5760×3840 | ★★☆ | ⬜ unidentified 🟡 |
| Chowk | — | 7 | 160 MB | — | video only | Panvel–Karjat corridor (Chowk station) |
| Ulwa CIDCO School | 2 | — | 3.8 MB | 1117×744 | ★☆☆ | ⬜ unidentified |
| Ulwa Hospital | 2 | — | 3.6 MB | 5760×3840 | ★★☆ | ⬜ unidentified |
| Engineers Certificates | 3 | — | 86 MB | 3264×1836 | — | ⚠️ personal data, do not publish |
| Karanjade Health Care | 1 | — | 1.9 MB | 1105×724 | ★☆☆ | ⬜ unidentified |

> **Folder-name corrections for the website** — the approved document's spellings win:
> `Nave Sheva` → **Nhava Sheva** · `Ulwa` → **Ulwe** (the CIDCO node is Ulwe). Keep the source folders as
> they are; use the approved spellings in slugs, alt text and copy.

---

## Coverage against the approved portfolio

Ten projects now carry approved copy. Photography exists for four of them.

| Project | Photos | Verdict |
| --- | ---: | --- |
| Matunga Railway Workshop | 97 + 3 video | ✅ Complete — can build the full case study today |
| **Harbour Line FOBs** (Vashi FOB) | 15 + RAW | ✅ **Strongest set in the drop** — and it now has a project |
| **Nhava Sheva & Uran Stations** | 13 | 🟡 Enough for a compact case study; more would help |
| Sanpada Carshed | 2 usable of 42 | 🟡 Lead images only; needs originals for a gallery |
| Panvel–Karjat Corridor | 7 videos, 0 stills | 🟡 One station of four, no stills |
| **Matunga Workshop FOB** | **0** | ⬜ **Not buildable** — a 303 m FOB and not one photograph |
| **Matunga LHB Facility** | **0** | ⬜ Not buildable — the largest RCC volume in the portfolio |
| **Harbour Line Redevelopment** | 0 construction | ⬜ Not buildable — HSE photos at Mankhurd only |
| **Lower Parel Redevelopment** | **0** | ⬜ Newly awarded — a site photo would do |
| **Solapur Vande Bharat Depot** | **0** | ⬜ Newly awarded — a site photo would do |

**Also unphotographed and now front-page content:**

- **The Vindhane steel fabrication plant** — a headline capability with zero imagery
- **The Karjat RMC plant** — newly confirmed, zero imagery
- **The equipment fleet** — 50+ units, zero imagery
- **The Vashi office and the team** — zero imagery

> The photography gap **moved**, it did not shrink. Four folders found their project; six approved
> projects and both plants have nothing. See [NEEDED §6–7](NEEDED.md).

---

## What's genuinely strong

- **Matunga Workshop — 97 images at up to 6000×4000, plus 3 videos.** A proper professional shoot. The
  `SRS000xx.JPG` sequence (83 frames) is the core set: the workshop gate and signage, interior bays with
  overhead cranes, and **a Vande Bharat trainset inside the shed** — a striking hero candidate, and now
  doubly apt given the Solapur Vande Bharat depot award.
- **Vashi FOB — 15 images at 5760×3840 with Canon RAW originals.** Technically the best material in the
  drop, and the approved doc finally gives it a home: the Harbour Line FOBs & Trespass-Control contract,
  where the Vashi–Sanpada span is recorded at 44.5 m + 24.9 m.
- **Safety Department — 51 images at 4096×3072, dated 08-01-2026, at Mankhurd.** Toolbox talks, a mass
  safety briefing with ~50 workers in orange full-body harnesses, site inductions. Direct visual proof of
  the HSE claims in [KD_INFO §8](KD_INFO.md#8-health-safety--environment-hse) — and now paired with
  ISO 45001:2018 certification, the HSE page has both evidence and credential.
- **Sanpada Carshed aerials.** `SANPADA CARSHEAD.jpg` (4000×2250) and `sanpada carshed.jpg` are drone
  shots showing the full site — sheds, rail lines, surrounding development. The only two good files in
  that folder.
- **Canon CR2 RAW originals** for Vashi FOB, Bonkode FOB and Kharghar Golf Course. `sharp` cannot read
  CR2 — they need Lightroom, Capture One, or `dcraw`/`darktable` to convert.

---

## Problems in the set

| Issue | Detail | Fix |
| --- | --- | --- |
| **Six approved projects have no photography** | Matunga Workshop FOB, Matunga LHB facility, Harbour Line redevelopment, Lower Parel, Solapur depot — plus both plants | Shoot. The FOB and the LHB facility are signature projects |
| **Sanpada is WhatsApp-compressed** | 40 of 42 files under 2 MP, median 963×1280, whole folder 6.9 MB | Re-request originals from whoever shot them |
| **Duplicates** | 12 in Matunga, 6 in Safety Department (a literal `New folder/` of re-copies), 2 in Sanpada | De-dupe before building galleries |
| **Panvel–Karjat is video-only** | 7 clips from Chowk station, no stills, 3 of 4 stations unrepresented — on a project that is 90%+ complete | Request stills; extract frames as a stopgap |
| **Small folders are thin** | Karanjade (1 image), Ulwe School (2, max 1117×744), Ulwe Hospital (2) — and all three are still unidentified projects | Identify first, then decide whether to shoot |
| **Marketing collages mixed in** | `Add a subheading.png`, `Black Aesthetic Photo Collage Instagram Post.png`, `Your paragraph text.png`, `Untitled design.png` are Instagram exports | Exclude from the site |
| **No office, team, equipment or plant photos** | Nothing of the Vashi office, no staff portraits, no machinery, neither plant | Outstanding — [NEEDED](NEEDED.md) #7, #17, #18, #18b |

---

## Leadership portraits

The approved document contains a **leadership slide** with circular portrait crops of all four directors
(Kailash, Sarita, Mohanlal, Shiv). Extracted, they are roughly **300 px** — usable as a temporary
placeholder at small sizes, **not** for a proper leadership page.

⬜ Professional headshots in a consistent style are still needed — see [NEEDED §12](NEEDED.md).

---

## Recommended pipeline

Source media stays outside the repo; only derivatives ship.

```
kd-assets/                 ← outside the repo, or gitignored
  matunga-workshop/
  harbour-line-fobs/
  ...
        │  sharp: resize, strip EXIF, AVIF + WebP + JPEG fallback
        ▼
public/images/<project>/   ← committed, web-optimised only
```

**Target derivatives per image:** 400w (card), 800w (gallery), 1600w (lightbox), 2400w (hero only). AVIF
with WebP fallback. Strip EXIF — phone photos in this set carry GPS coordinates.

Astro's `<Image>`/`<Picture>` from `astro:assets` handles responsive `srcset` generation, so originals can
live in `src/assets/` per project and be transformed at build time. Either approach works; the important
part is that the 3.6 GB of originals never lands in git.

**Folder naming:** name the derivative folders after the **approved project slugs** in
[STRUCTURE.md](STRUCTURE.md) — `harbour-line-fobs/`, not `vashi-fob/` — so assets and routes stay aligned.

---

## Logo

Produced from `kd_logo.jpg` on 2026-08-15 — see [DESIGN.md](DESIGN.md).

| File | Size | Use |
| --- | --- | --- |
| [public/logo/kd-logo.png](../public/logo/kd-logo.png) | 739×473, transparent | Light backgrounds |
| [public/logo/kd-logo-white.png](../public/logo/kd-logo-white.png) | 739×473, transparent | Navy/dark backgrounds |

Measured brand colours, straight off the artwork:

| Role | Hex | Note |
| --- | --- | --- |
| Logo navy | `#1c1226` | Darker and more purple than the `#0B2C52` recommended in DESIGN.md |
| Logo amber | `#e3b02e` | Yellower than the `#F28C28` recommended in DESIGN.md |
| Removed background | `#d9f8de` | Mint — an artefact of the source file, not a brand colour |

> 🟡 **The logo's colours do not match the recommended palette.** Someone has to decide which wins — see
> [NEEDED §5b](NEEDED.md).

**Still needed:** the original **vector** logo (AI / EPS / CDR / SVG). These PNGs are recovered from a
1536×1024 JPEG, so the artwork tops out at 739×473 — fine for a header at 1×–2×, not enough for
large-format print, signage, or a full-width hero lockup.

**Also now needed:** the **ISO 9001 / 14001 / 45001 certification marks** and the **Chamber of Railway
Industries** logo, with permission to display them. These go in the footer badge row —
[NEEDED §26b, §55](NEEDED.md).

---

## Related documents

- [KD_INFO.md](KD_INFO.md) — **source of truth**; §7 covers every documented project
- [NEEDED.md](NEEDED.md) — what is still outstanding
- [DESIGN.md](DESIGN.md) — palette and photography direction
- [STRUCTURE.md](STRUCTURE.md) — which pages these assets feed
