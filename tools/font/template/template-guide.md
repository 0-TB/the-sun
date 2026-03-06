# Handwriting Template Guide

Tips for getting clean glyphs out of the extraction pipeline.

---

## Pen & ink

- Use a **0.5 mm fineliner** (Staedtler Triplus, Pigma Micron, or similar) or a **gel pen**
- Avoid ballpoints — they vary in pressure and leave inconsistent strokes
- Black ink only — blue/red confuse the threshold step
- Write at normal speed. Don't slow down artificially; your natural rhythm produces the best letterforms

## Writing the characters

- **Stay between the cap-height (top dashed) line and the baseline (solid line)**
- Descenders (g, j, p, q, y) should dip below the baseline into the grey zone — that space is reserved
- Aim for **consistent size** across characters, not perfection in each one
- Leave the spare cells (row 9, marked `—`) blank unless you want to add accented characters later
- One character per cell. Don't overlap into adjacent cells

## Paper

- Use the printed sheet as-is. Do not photocopy — copies shift registration markers slightly
- If the paper is thin and bleeds, place a second blank sheet underneath

---

## Photography / scanning

### Scanner (preferred)
- 300 dpi minimum, 600 dpi ideal
- Greyscale or colour — both work; greyscale is faster
- Export as JPEG (quality 90+) or PNG
- Make sure the page lies completely flat

### Phone camera (also fine)
1. Place the sheet on a **flat, non-reflective surface** (desk, not carpet)
2. Shoot in **daylight** — natural light from a window, not overhead artificial light
3. **No flash** — it creates hotspots that wash out strokes near the centre
4. Hold the phone directly above the sheet, **parallel to the paper** (no perspective tilt)
5. Fill the frame with the sheet — leave ~1–2 cm of background visible around all edges so the registration markers are fully captured
6. Tap to focus on the sheet, then tap again to lock exposure
7. Shoot at highest resolution your phone supports

### Lighting checklist
- [ ] No shadows crossing the sheet
- [ ] No reflection or glare on the paper surface
- [ ] All four corner black squares clearly visible and fully black
- [ ] Ink strokes appear dark, not grey

---

## Running the extractor

```bash
cd tools/font
python scripts/extract_glyphs.py --input path/to/scan.jpg --variant 1
```

Add `--debug` to save a perspective-corrected preview of the whole sheet:

```bash
python scripts/extract_glyphs.py --input scan.jpg --variant 1 --debug
```

Check the debug image — it should look like a clean, un-distorted A4 page. If the grid looks skewed, retake the photo more parallel to the paper.

---

## Multiple variants (for natural randomization)

Print the **identical template** 2–3 times. Fill each copy with the same characters, written freshly each time (do not trace). Each filled copy = one variant sheet.

Process each separately:

```bash
python scripts/extract_glyphs.py --input scan_v1.jpg --variant 1
python scripts/extract_glyphs.py --input scan_v2.jpg --variant 2
python scripts/extract_glyphs.py --input scan_v3.jpg --variant 3
```

Then build with variants:

```bash
python scripts/build_font.py --name HeliosHandwriting --variants 3
```
