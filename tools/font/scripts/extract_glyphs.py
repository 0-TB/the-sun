#!/usr/bin/env python3
"""
extract_glyphs.py — Photo/scan → individual glyph PNGs

Usage:
  cd tools/font
  python scripts/extract_glyphs.py --input scan.jpg --variant 1

Requires:
  pip install opencv-python Pillow numpy
"""

import argparse
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# Add parent dir so we can import config
sys.path.insert(0, str(Path(__file__).parent.parent))
import config

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Output resolution for each glyph PNG
GLYPH_PX = 256

# Inset fraction: how much to crop from cell edges before extracting glyph
CELL_INSET_FRAC = 0.04

# Minimum contour area in pixels (noise removal after threshold)
MIN_CONTOUR_AREA = 25

# Output root
OUTPUT_ROOT = Path(__file__).parent.parent / "output" / "glyphs"


# ---------------------------------------------------------------------------
# Registration marker detection
# ---------------------------------------------------------------------------

def find_registration_markers(binary: np.ndarray) -> list[tuple[int, int]]:
    """
    Find the 4 corner registration markers (large filled squares).
    Returns list of (cx, cy) centres sorted: [TL, TR, BL, BR].
    """
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    h, w = binary.shape
    page_area = h * w

    candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        # Markers are large (roughly 2-5% of page area) and roughly square
        if area < page_area * 0.001 or area > page_area * 0.08:
            continue
        x, y, bw, bh = cv2.boundingRect(cnt)
        aspect = bw / bh if bh > 0 else 0
        if 0.6 < aspect < 1.6:
            cx = x + bw // 2
            cy = y + bh // 2
            candidates.append((cx, cy, area))

    if len(candidates) < 4:
        raise RuntimeError(
            f"Expected 4 registration markers, found {len(candidates)}. "
            "Check lighting and that all 4 corner squares are visible."
        )

    # Keep 4 largest candidates
    candidates.sort(key=lambda c: c[2], reverse=True)
    pts = [(c[0], c[1]) for c in candidates[:4]]

    # Sort: TL, TR, BL, BR
    pts.sort(key=lambda p: p[0] + p[1])   # smallest x+y = TL
    tl = pts[0]
    pts.sort(key=lambda p: -p[0] + p[1])  # largest -x+y = BL... recompute properly
    pts_arr = np.array(pts)
    centroid = pts_arr.mean(axis=0)
    tl = min(pts, key=lambda p: (p[0] - centroid[0])**2 + (p[1] - centroid[1])**2 - 2*p[0] - 2*p[1])

    def sort_corners(pts):
        pts = sorted(pts, key=lambda p: p[1])  # top 2 / bottom 2
        top = sorted(pts[:2], key=lambda p: p[0])
        bot = sorted(pts[2:], key=lambda p: p[0])
        return [top[0], top[1], bot[0], bot[1]]  # TL, TR, BL, BR

    return sort_corners(pts)


# ---------------------------------------------------------------------------
# Perspective correction
# ---------------------------------------------------------------------------

# A4 canonical dimensions in pixels at 300 dpi
A4_W = int(210 / 25.4 * 300)  # 2480 px
A4_H = int(297 / 25.4 * 300)  # 3508 px

def correct_perspective(img: np.ndarray, markers: list[tuple[int, int]]) -> np.ndarray:
    """
    Warp the image so the four registration marker centres map to the
    known corner positions of an A4 page at 300 dpi.
    """
    # Marker centres in the source image
    src = np.float32(markers)  # TL, TR, BL, BR

    # Corresponding positions in the canonical A4 image
    # Markers sit at 1.5mm from each edge (same as template.html)
    margin_mm = 1.5
    marker_mm = config.REG_MARKER_MM
    half = marker_mm / 2

    def mm_to_px(mm: float) -> int:
        return int(mm / 25.4 * 300)

    tl_x = mm_to_px(margin_mm + half)
    tl_y = mm_to_px(margin_mm + half)
    tr_x = A4_W - mm_to_px(margin_mm + half)
    tr_y = mm_to_px(margin_mm + half)
    bl_x = mm_to_px(margin_mm + half)
    bl_y = A4_H - mm_to_px(margin_mm + half)
    br_x = A4_W - mm_to_px(margin_mm + half)
    br_y = A4_H - mm_to_px(margin_mm + half)

    dst = np.float32([[tl_x, tl_y], [tr_x, tr_y], [bl_x, bl_y], [br_x, br_y]])

    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(img, M, (A4_W, A4_H), flags=cv2.INTER_LINEAR)
    return warped


# ---------------------------------------------------------------------------
# Cell extraction
# ---------------------------------------------------------------------------

def mm_to_px(mm: float) -> int:
    return int(mm / 25.4 * 300)

def extract_cells(warped_gray: np.ndarray, variant: int) -> None:
    """
    Divide the corrected A4 image into cells, threshold each, and save.
    """
    out_dir = OUTPUT_ROOT / f"variant_{variant}"
    out_dir.mkdir(parents=True, exist_ok=True)

    margin = mm_to_px(config.MARGIN_MM)
    # Usable area
    usable_w = A4_W - 2 * margin
    usable_h = A4_H - 2 * margin

    cell_w = usable_w // config.COLS
    cell_h = usable_h // config.ROWS

    inset_x = int(cell_w * CELL_INSET_FRAC)
    inset_y = int(cell_h * CELL_INSET_FRAC)

    saved = 0
    for row in range(config.ROWS):
        for col in range(config.COLS):
            char = config.cell_char(row, col)
            if char.startswith("_spare_") or char.startswith("_empty_"):
                continue

            # Cell bounding box in the corrected image
            x0 = margin + col * cell_w + inset_x
            y0 = margin + row * cell_h + inset_y
            x1 = margin + (col + 1) * cell_w - inset_x
            y1 = margin + (row + 1) * cell_h - inset_y

            cell_crop = warped_gray[y0:y1, x0:x1]

            # Adaptive threshold: handles uneven lighting
            thresh = cv2.adaptiveThreshold(
                cell_crop, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV,
                blockSize=31,
                C=10,
            )

            # Remove small noise blobs
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            clean = np.zeros_like(thresh)
            for cnt in contours:
                if cv2.contourArea(cnt) >= MIN_CONTOUR_AREA:
                    cv2.drawContours(clean, [cnt], -1, 255, -1)

            # Resize to standard glyph size (GLYPH_PX × GLYPH_PX)
            glyph = cv2.resize(clean, (GLYPH_PX, GLYPH_PX), interpolation=cv2.INTER_AREA)

            # Save as PNG (white glyph on black background = ready for potrace)
            name = config.glyph_name(char)
            out_path = out_dir / f"{name}.png"
            cv2.imwrite(str(out_path), glyph)
            saved += 1

    print(f"Saved {saved} glyph PNGs → {out_dir}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Extract glyphs from a photographed template sheet.")
    parser.add_argument("--input", required=True, help="Path to the scanned/photographed template (JPEG or PNG).")
    parser.add_argument("--variant", required=True, type=int, help="Variant number (1, 2, 3 …). Creates output/glyphs/variant_N/")
    parser.add_argument("--debug", action="store_true", help="Save debug images (perspective-corrected sheet).")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f"ERROR: input file not found: {input_path}")
        sys.exit(1)

    print(f"Loading {input_path} …")
    img = cv2.imread(str(input_path))
    if img is None:
        print(f"ERROR: could not read image (unsupported format?): {input_path}")
        sys.exit(1)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Binarize for marker detection
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    print("Detecting registration markers …")
    try:
        markers = find_registration_markers(binary)
    except RuntimeError as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    print(f"  Markers found at: {markers}")

    print("Correcting perspective …")
    warped = correct_perspective(gray, markers)

    if args.debug:
        debug_path = Path(args.input).with_suffix(".corrected.png")
        cv2.imwrite(str(debug_path), warped)
        print(f"  Debug image saved → {debug_path}")

    print("Extracting cells …")
    extract_cells(warped, args.variant)

    print("Done.")


if __name__ == "__main__":
    main()
