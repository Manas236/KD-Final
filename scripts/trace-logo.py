"""
K.D. logo -> vector (public/kd-logo.svg)
------------------------------------------------------------
The only logo K.D. has supplied is a raster, kd_logo.jpg (1536x1024, the
mark about 730px wide in the middle of a mint canvas). Scaled into the
102px nav box it was cut to a 1x JPEG and pixelated on every high-density
screen (client feedback, 9 Oct 2026). This traces it once into an SVG so
the nav and footer stay sharp at any size.

Three flat colours, read off the source: the mint canvas, the ink of the
letters and the yellow of the rebar stripes and the rule. Each colour is
thresholded on a 4x Lanczos upscale (smoother curves than the JPEG's own
pixels) and traced with potrace. The yellow mask is grown by a hair so no
mint seam shows between it and the ink.

Usage (from kd-construction/):
    pip install potracer numpy pillow
    python scripts/trace-logo.py public/kd-logo.svg
"""
import sys

import numpy as np
import potrace
from PIL import Image, ImageFilter

S = 4  # upscale factor before tracing

src = Image.open("kd_logo.jpg").convert("RGB")
a = np.asarray(src).astype(int)
bg = a[20:60, 20:60].reshape(-1, 3).mean(0)

# Crop to the mark plus a 40px margin.
ys, xs = np.where(np.abs(a - bg).sum(2) > 60)
pad = 40
crop = src.crop((xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad))

big = crop.resize((crop.width * S, crop.height * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(S * 0.6))
b = np.asarray(big).astype(int)
r, g, bl = b[..., 0], b[..., 1], b[..., 2]
lum = 0.299 * r + 0.587 * g + 0.114 * bl


def dilate(mask, k):
    return np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(k))) > 127


ink = lum < 110
yellow = dilate((r > 170) & (g > 120) & (bl < 110) & (r - bl > 90), 5)
ink = ink | (dilate(ink, 7) & ~yellow & (lum < 200))


def trace(mask):
    # potracer fills the False side of the bitmap, hence the inversion.
    path = potrace.Bitmap(~mask).trace(turdsize=20 * S, alphamax=1.0, opticurve=True, opttolerance=0.2)
    out = []
    for curve in path:
        sp = curve.start_point
        d = [f"M{sp.x / S:.2f} {sp.y / S:.2f}"]
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x / S:.2f} {seg.c.y / S:.2f}L{seg.end_point.x / S:.2f} {seg.end_point.y / S:.2f}")
            else:
                d.append(
                    f"C{seg.c1.x / S:.2f} {seg.c1.y / S:.2f} {seg.c2.x / S:.2f} {seg.c2.y / S:.2f} "
                    f"{seg.end_point.x / S:.2f} {seg.end_point.y / S:.2f}"
                )
        d.append("Z")
        out.append("".join(d))
    return "".join(out)


ca = np.asarray(crop).astype(int)
cl = 0.299 * ca[..., 0] + 0.587 * ca[..., 1] + 0.114 * ca[..., 2]
ink_colour = np.median(ca[cl < 40], 0)
yellow_colour = np.median(ca[(ca[..., 0] > 200) & (ca[..., 2] < 80)], 0)
hexc = lambda c: "#%02x%02x%02x" % tuple(int(v) for v in c)

W, H = crop.size
svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="K.D. Constructions">
<rect width="{W}" height="{H}" fill="{hexc(bg)}"/>
<path fill="{hexc(ink_colour)}" fill-rule="evenodd" d="{trace(ink)}"/>
<path fill="{hexc(yellow_colour)}" fill-rule="evenodd" d="{trace(yellow)}"/>
</svg>
"""
open(sys.argv[1], "w").write(svg)
print(f"wrote {sys.argv[1]} ({len(svg):,} bytes, {W}x{H})")
