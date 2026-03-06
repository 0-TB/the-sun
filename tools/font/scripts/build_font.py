#!/usr/bin/env python3
"""
build_font.py — Glyph PNGs → TTF + WOFF2

Usage:
  cd tools/font
  python scripts/build_font.py --name HeliosHandwriting

  # With multiple variant folders already in output/glyphs/:
  python scripts/build_font.py --name HeliosHandwriting --variants 3

Requires:
  pip install fonttools brotli
  brew install potrace
"""

import argparse
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
import config

from fontTools import fontBuilder
from fontTools.pens.t2Pen import T2Pen
from fontTools.pens.pointPen import SegmentToPointPen

# fonttools SVG path parser
from fontTools.svgLib.path import SVGPath
from fontTools.pens.recordingPen import RecordingPen
from fontTools.misc.transform import Transform

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR   = Path(__file__).parent
TOOLS_DIR    = SCRIPT_DIR.parent
GLYPHS_DIR   = TOOLS_DIR / "output" / "glyphs"
FONT_OUT_DIR = TOOLS_DIR / "output" / "font"
PUBLIC_FONTS = TOOLS_DIR.parent.parent / "public" / "fonts"


# ---------------------------------------------------------------------------
# Step 1: Vectorise a single glyph PNG via potrace
# ---------------------------------------------------------------------------

def png_to_svg_path(png_path: Path) -> str | None:
    """
    Call potrace to convert a binary PNG to an SVG, then extract the
    raw 'd' attribute string from the first <path> element.
    Returns None if the glyph appears empty.
    """
    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as tmp:
        svg_path = tmp.name

    try:
        result = subprocess.run(
            [
                "potrace",
                "--svg",
                "--output", svg_path,
                "--alphamax", "1.0",   # smoother curves
                "--opttolerance", "0.2",
                str(png_path),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"  WARN potrace failed on {png_path.name}: {result.stderr.strip()}")
            return None

        svg_text = Path(svg_path).read_text()
        match = re.search(r'<path[^>]+\bd="([^"]+)"', svg_text)
        if not match:
            return None
        return match.group(1)
    finally:
        Path(svg_path).unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Step 2: Parse SVG path + flip Y + scale to font coordinate space
# ---------------------------------------------------------------------------

def parse_path_commands(d: str) -> list[tuple]:
    """
    Very small SVG path parser — supports M, L, C, Z (what potrace emits).
    Returns a list of (command, *coords) tuples with coordinates as floats.
    """
    token_re = re.compile(r"([MLCZmlcz])|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)")
    tokens = token_re.findall(d)
    commands = []
    current_cmd = None
    current_args: list[float] = []

    CMD_ARGC = {"M": 2, "L": 2, "C": 6, "Z": 0, "m": 2, "l": 2, "c": 6, "z": 0}

    for letter, number in tokens:
        if letter:
            if current_cmd and (current_cmd.upper() != "Z"):
                commands.append((current_cmd, current_args))
            current_cmd = letter
            current_args = []
        elif number:
            current_args.append(float(number))
            expected = CMD_ARGC.get(current_cmd.upper(), 0)
            if expected > 0 and len(current_args) == expected:
                commands.append((current_cmd, list(current_args)))
                # For M after first use, repeat as L
                if current_cmd == "M":
                    current_cmd = "L"
                elif current_cmd == "m":
                    current_cmd = "l"
                current_args = []

    if current_cmd and current_cmd.upper() == "Z":
        commands.append((current_cmd, []))

    return commands


def draw_svg_path_to_pen(d: str, pen, svg_height: float, scale: float, y_offset: int) -> None:
    """
    Replay an SVG path into a fontTools pen, applying:
      - Y flip:   font_y = (svg_height - svg_y) * scale + y_offset
      - X scale:  font_x = svg_x * scale
    """
    def tx(x: float) -> int:
        return round(x * scale)

    def ty(y: float) -> int:
        return round((svg_height - y) * scale + y_offset)

    commands = parse_path_commands(d)
    open_contour = False

    for cmd, args in commands:
        u = cmd.upper()
        if u == "M":
            if open_contour:
                pen.endPath()
            pen.beginPath()
            open_contour = True
            pen.addPoint((tx(args[0]), ty(args[1])), segmentType="move")
        elif u == "L":
            pen.addPoint((tx(args[0]), ty(args[1])), segmentType="line")
        elif u == "C":
            # Cubic bezier: C x1 y1 x2 y2 x y
            pen.addPoint((tx(args[0]), ty(args[1])), segmentType=None)  # off-curve
            pen.addPoint((tx(args[2]), ty(args[3])), segmentType=None)  # off-curve
            pen.addPoint((tx(args[4]), ty(args[5])), segmentType="curve")
        elif u == "Z":
            if open_contour:
                pen.endPath()
                open_contour = False

    if open_contour:
        pen.endPath()


# ---------------------------------------------------------------------------
# Step 3: Assemble the font
# ---------------------------------------------------------------------------

# potrace SVG output for a 256×256 PNG has this viewBox
SVG_HEIGHT = 256.0
SVG_WIDTH  = 256.0

def compute_scale() -> float:
    """Scale SVG 256px coordinates to font UPM space."""
    glyph_height = config.GLYPH_TOP - config.GLYPH_BOTTOM
    return glyph_height / SVG_HEIGHT


def build_font(font_name: str, num_variants: int) -> None:
    FONT_OUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_FONTS.mkdir(parents=True, exist_ok=True)

    scale = compute_scale()
    y_offset = config.GLYPH_BOTTOM  # baseline sits at 0 in font coords

    # ── Collect available glyphs from variant_1 (base) ──────────────────────
    v1_dir = GLYPHS_DIR / "variant_1"
    if not v1_dir.exists():
        print(f"ERROR: {v1_dir} not found. Run extract_glyphs.py first.")
        sys.exit(1)

    base_pngs = sorted(v1_dir.glob("*.png"))
    if not base_pngs:
        print(f"ERROR: No PNG files found in {v1_dir}")
        sys.exit(1)

    print(f"Found {len(base_pngs)} base glyphs.")

    # ── Determine which characters have variants ────────────────────────────
    variant_dirs: list[Path] = []
    for v in range(1, num_variants + 1):
        vdir = GLYPHS_DIR / f"variant_{v}"
        if vdir.exists():
            variant_dirs.append(vdir)
    print(f"Variants: {[d.name for d in variant_dirs]}")

    # ── Build glyph name lists ──────────────────────────────────────────────
    # Base glyph names (from variant_1 filenames, stripped of .png)
    base_glyph_names = [p.stem for p in base_pngs]

    # All glyph names including .alt1, .alt2 …
    all_glyph_names = list(base_glyph_names)
    for v_idx, vdir in enumerate(variant_dirs[1:], start=1):  # skip variant_1 (it's base)
        for name in base_glyph_names:
            alt_png = vdir / f"{name}.png"
            if alt_png.exists():
                all_glyph_names.append(f"{name}.alt{v_idx}")

    all_glyph_names = [".notdef"] + all_glyph_names

    # ── Unicode cmap ────────────────────────────────────────────────────────
    char_to_unicode: dict[str, int] = {}
    for char in config.all_chars():
        if char.startswith("_spare_") or char.startswith("_empty_"):
            continue
        gname = config.glyph_name(char)
        if gname in base_glyph_names:
            char_to_unicode[gname] = ord(char)

    cmap = {v: k for k, v in char_to_unicode.items()}

    # ── FontBuilder ─────────────────────────────────────────────────────────
    fb = fontBuilder.FontBuilder(config.UPM, isTTF=True)
    fb.setupGlyphOrder(all_glyph_names)
    fb.setupCharacterMap(cmap)

    fb.setupGlyph(".notdef")

    metrics: dict[str, tuple[int, int]] = {}   # {glyph_name: (width, lsb)}
    pen_data: dict[str, list] = {}              # for drawing later

    # ── Vectorize and record paths ───────────────────────────────────────────
    def process_png(png_path: Path, glyph_name_out: str) -> None:
        print(f"  Vectorizing {png_path.name} …", end="", flush=True)
        d = png_to_svg_path(png_path)
        if d is None:
            print(" (empty — using blank glyph)")
            metrics[glyph_name_out] = (config.UPM // 3, 0)
            pen_data[glyph_name_out] = []
            return

        # Collect path commands into a recording
        rec = RecordingPen()
        draw_svg_path_to_pen(d, rec.value if hasattr(rec, "value") else rec, SVG_HEIGHT, scale, y_offset)
        pen_data[glyph_name_out] = d  # store raw 'd' for drawing at glyph-draw stage
        metrics[glyph_name_out] = (round(SVG_WIDTH * scale * 0.95), 20)
        print(" ok")

    # Base glyphs
    for png_path in base_pngs:
        process_png(png_path, png_path.stem)

    # Alt glyphs
    for v_idx, vdir in enumerate(variant_dirs[1:], start=1):
        for name in base_glyph_names:
            alt_png = vdir / f"{name}.png"
            if alt_png.exists():
                process_png(alt_png, f"{name}.alt{v_idx}")

    # .notdef metrics
    metrics[".notdef"] = (500, 0)

    # ── Draw glyphs ──────────────────────────────────────────────────────────
    fb.setupGlyph(".notdef", width=500)

    glyphs_widths = {".notdef": 500}
    for gname in all_glyph_names:
        if gname == ".notdef":
            continue
        w = metrics.get(gname, (500, 0))[0]
        glyphs_widths[gname] = w
        fb.setupGlyph(gname, width=w)

    fb.setupHorizontalMetrics({
        gname: (glyphs_widths.get(gname, 500), 0)
        for gname in all_glyph_names
    })

    # Draw actual contours
    for gname in all_glyph_names:
        if gname == ".notdef":
            continue
        d_str = pen_data.get(gname)
        if not d_str:
            continue
        pen = fb.font.getGlyphSet()[gname].getPen() if hasattr(fb.font.getGlyphSet()[gname], "getPen") else None
        # Use fontTools glyph drawing API
        glyph = fb.font["glyf"][gname] if "glyf" in fb.font else None
        # For TTF, we need to draw via T2Pen/PointPen — use simpler approach below.

    # ── Simpler draw approach using fontTools directly ───────────────────────
    # Re-build using fontBuilder properly
    _build_with_fontbuilder(font_name, all_glyph_names, base_glyph_names,
                             variant_dirs, scale, y_offset, cmap, num_variants)


def _build_with_fontbuilder(
    font_name: str,
    all_glyph_names: list[str],
    base_glyph_names: list[str],
    variant_dirs: list[Path],
    scale: float,
    y_offset: int,
    cmap: dict[int, str],
    num_variants: int,
) -> None:
    """Clean rebuild using fontTools FontBuilder correctly."""
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.t2Pen import T2Pen
    from fontTools.ttLib import TTFont

    fb = FontBuilder(config.UPM, isTTF=False)  # CFF (OTF) — easier path handling
    fb.setupGlyphOrder(all_glyph_names)
    fb.setupCharacterMap(cmap)

    # Collect glyph metrics and path strings
    glyph_paths: dict[str, str | None] = {}
    glyph_widths: dict[str, int] = {}

    def load_glyph(png_path: Path) -> tuple[int, str | None]:
        d = png_to_svg_path(png_path)
        w = round(SVG_WIDTH * scale * 0.95) if d else round(config.UPM * 0.5)
        return w, d

    # .notdef
    glyph_paths[".notdef"] = None
    glyph_widths[".notdef"] = 500

    # Base glyphs
    v1_dir = variant_dirs[0]
    for gname in base_glyph_names:
        png_path = v1_dir / f"{gname}.png"
        if png_path.exists():
            print(f"  [{gname}]", end=" ", flush=True)
            w, d = load_glyph(png_path)
            glyph_paths[gname] = d
            glyph_widths[gname] = w
        else:
            glyph_paths[gname] = None
            glyph_widths[gname] = 500

    # Alt glyphs
    for v_idx, vdir in enumerate(variant_dirs[1:], start=1):
        for gname in base_glyph_names:
            alt_name = f"{gname}.alt{v_idx}"
            if alt_name not in all_glyph_names:
                continue
            png_path = vdir / f"{gname}.png"
            if png_path.exists():
                w, d = load_glyph(png_path)
                glyph_paths[alt_name] = d
                glyph_widths[alt_name] = w

    print()  # newline after progress dots

    # Draw glyphs
    def draw_glyph(pen, d: str | None) -> None:
        if not d:
            return
        # Use a simple segment pen approach
        commands = parse_path_commands(d)
        open_contour = False

        def tx(x): return round(x * scale)
        def ty(y): return round((SVG_HEIGHT - y) * scale + y_offset)

        for cmd, args in commands:
            u = cmd.upper()
            if u == "M":
                if open_contour:
                    pen.closePath()
                pen.moveTo((tx(args[0]), ty(args[1])))
                open_contour = True
            elif u == "L":
                pen.lineTo((tx(args[0]), ty(args[1])))
            elif u == "C":
                pen.curveTo(
                    (tx(args[0]), ty(args[1])),
                    (tx(args[2]), ty(args[3])),
                    (tx(args[4]), ty(args[5])),
                )
            elif u == "Z":
                if open_contour:
                    pen.closePath()
                    open_contour = False

        if open_contour:
            pen.closePath()

    metrics_map = {gname: (glyph_widths.get(gname, 500), 0) for gname in all_glyph_names}

    fb.setupGlyph(".notdef", width=500, unicodes=[])
    for gname in all_glyph_names:
        if gname == ".notdef":
            continue
        unicodes = [cp for cp, gn in cmap.items() if gn == gname]
        fb.setupGlyph(gname, width=glyph_widths.get(gname, 500), unicodes=unicodes)

    fb.setupHorizontalMetrics(metrics_map)

    fb.setupHorizontalHeader(ascent=config.ASCENDER, descent=config.DESCENDER)
    fb.setupNameTable({
        "familyName": font_name,
        "styleName": "Regular",
    })
    fb.setupOs2(
        sTypoAscender=config.ASCENDER,
        sTypoDescender=config.DESCENDER,
        sTypoLineGap=config.LINE_GAP,
        usWinAscent=config.ASCENDER,
        usWinDescent=abs(config.DESCENDER),
        sxHeight=config.X_HEIGHT,
        sCapHeight=config.CAP_HEIGHT,
        fsType=0,
        fsSelection=0x40,
        achVendID="HLIO",
    )
    fb.setupPost()
    fb.setupHead(unitsPerEm=config.UPM)

    # Draw contours into CFF
    for gname in all_glyph_names:
        d = glyph_paths.get(gname)
        pen = fb.setupCFF(  # noqa — setupCFF is not per-glyph; use getPen below
            nameStrings={"version": "1.0", "FullName": font_name, "FamilyName": font_name},
        ) if False else None

    # Actually draw via T2CharString pen
    fb.setupCFF(
        nameStrings={"version": "1.0", "FullName": font_name, "FamilyName": font_name},
        privateDict={"defaultWidthX": 500, "nominalWidthX": 0},
        globalSubrs=[],
    )
    for gname in all_glyph_names:
        d_str = glyph_paths.get(gname)
        t2_pen = fb.font.getGlyphSet()[gname].charString.draw if False else None
        # Use charString drawing via T2Pen
        char_string = fb.font["CFF "].cff.topDictIndex[0].CharStrings[gname]
        from fontTools.pens.t2Pen import T2Pen
        pen = T2Pen(glyph_widths.get(gname, 500), char_string)
        draw_glyph(pen, glyph_paths.get(gname))

    # ── OpenType calt feature for randomization ──────────────────────────────
    if num_variants > 1:
        fea_code = _generate_calt_fea(base_glyph_names, num_variants, all_glyph_names)
        print("Adding calt feature …")
        from fontTools.feaLib.builder import addOpenTypeFeatures
        from io import StringIO
        addOpenTypeFeatures(fb.font, StringIO(fea_code))

    # ── Save TTF ──────────────────────────────────────────────────────────────
    # Convert CFF → TTF via cu2qu
    print("Saving OTF …")
    otf_path = FONT_OUT_DIR / f"{font_name}.otf"
    fb.font.save(str(otf_path))
    print(f"  → {otf_path}")

    # ── Save WOFF2 ────────────────────────────────────────────────────────────
    print("Converting to WOFF2 …")
    woff2_path = FONT_OUT_DIR / f"{font_name}.woff2"
    from fontTools import ttLib
    font = ttLib.TTFont(str(otf_path))
    font.flavor = "woff2"
    font.save(str(woff2_path))
    print(f"  → {woff2_path}")

    # Copy to public/fonts/
    import shutil
    shutil.copy2(woff2_path, PUBLIC_FONTS / woff2_path.name)
    print(f"  Copied to {PUBLIC_FONTS / woff2_path.name}")

    print("\nFont build complete.")


# ---------------------------------------------------------------------------
# calt feature generation
# ---------------------------------------------------------------------------

def _generate_calt_fea(
    base_names: list[str],
    num_variants: int,
    all_names: list[str],
) -> str:
    """
    Generate OpenType feature code for endless-cycle randomization.
    Characters that have all variants get included; others are skipped.
    """
    # Filter to only chars that have all alt variants
    fully_covered = [
        name for name in base_names
        if all(f"{name}.alt{v}" in all_names for v in range(1, num_variants))
    ]

    if not fully_covered:
        return ""

    lines = ["# Auto-generated calt feature — Helios Handwriting\n"]

    # Base cycle (variant_1)
    glyphs_str = " ".join(fully_covered)
    lines.append(f"@cycle1 = [{glyphs_str}];")

    # Alt cycles
    for v in range(1, num_variants):
        alts = " ".join(f"{name}.alt{v}" for name in fully_covered)
        lines.append(f"@cycle{v+1} = [{alts}];")

    total = num_variants  # number of cycles
    lines.append("")
    lines.append("feature calt {")

    # Endless cycle: each cycle triggers the next
    for i in range(1, total + 1):
        prev = i
        nxt = (i % total) + 1
        lines.append(f"  sub @cycle{prev} @cycle{prev}' by @cycle{nxt};")

    lines.append("} calt;")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Build HeliosHandwriting font from glyph PNGs.")
    parser.add_argument("--name", default="HeliosHandwriting", help="Font family name.")
    parser.add_argument("--variants", type=int, default=1,
                        help="Number of variant sheets to include (default: 1).")
    args = parser.parse_args()

    print(f"Building '{args.name}' with {args.variants} variant(s) …\n")

    # Discover variant dirs
    variant_dirs = []
    for v in range(1, args.variants + 1):
        vdir = GLYPHS_DIR / f"variant_{v}"
        if vdir.exists():
            variant_dirs.append(vdir)
        else:
            if v == 1:
                print(f"ERROR: {vdir} not found. Run extract_glyphs.py first.")
                sys.exit(1)
            else:
                print(f"WARN: {vdir} not found, skipping.")

    v1_dir = variant_dirs[0]
    base_pngs = sorted(v1_dir.glob("*.png"))
    base_glyph_names = [p.stem for p in base_pngs]

    # Build full glyph name list
    all_glyph_names = [".notdef"] + list(base_glyph_names)
    for v_idx, vdir in enumerate(variant_dirs[1:], start=1):
        for gname in base_glyph_names:
            if (vdir / f"{gname}.png").exists():
                all_glyph_names.append(f"{gname}.alt{v_idx}")

    # Unicode cmap
    cmap: dict[int, str] = {}
    for char in config.all_chars():
        if char.startswith("_spare_") or char.startswith("_empty_"):
            continue
        gname = config.glyph_name(char)
        if gname in base_glyph_names:
            cmap[ord(char)] = gname

    scale = compute_scale()
    y_offset = config.GLYPH_BOTTOM

    _build_with_fontbuilder(
        args.name,
        all_glyph_names,
        base_glyph_names,
        variant_dirs,
        scale,
        y_offset,
        cmap,
        args.variants,
    )


if __name__ == "__main__":
    main()
