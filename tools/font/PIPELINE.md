# Helios Handwriting Font Pipeline

> Replicates every feature of Calligraphr — fully local, no subscription.

---

## Context

Build a fully local handwriting-to-font pipeline so we can create a personal font for Helios without paying for Calligraphr. The user writes characters on a printed template; this pipeline extracts, vectorizes, and assembles them into a production-quality TTF/WOFF2 with optional OpenType `calt` randomization for natural variation.

---

## Toolchain (all free, open source)

| Step | Tool | Install |
|---|---|---|
| Template | HTML/CSS (browser print) | None |
| Image extraction | Python + OpenCV | `pip install opencv-python Pillow numpy` |
| Vectorization | potrace | `brew install potrace` |
| Font assembly | fonttools | `pip install fonttools brotli` |
| Feature code | fonttools feaLib | (bundled with fonttools) |

---

## Character Set

Sheet layout: A4, 10 cols × 9 rows = 90 cells per sheet.

| Rows | Content | Cells |
|---|---|---|
| 0–2 | a–z (26 lowercase) + 4 spare | 30 |
| 3–5 | A–Z (26 uppercase) + 4 spare | 30 |
| 6 | 0–9 (10 digits) | 10 |
| 7–8 | `. , ; : ! ? ' " ( ) - / & @ # % + = £ $` | 20 |

Categories are row-aligned — uppercase always starts at row 3, digits at row 6. This makes cell cropping deterministic and independent of how many chars are in each group.

---

## Variants — how many to make

**Recommendation: 3 sheets total** (1 base + 2 additional variant sheets).

| Sheets filled | Effect |
|---|---|
| 1 | Functional font, but every letter is a clone — looks "stamped" on repetition |
| 2 | Noticeably more natural — letters alternate, eye stops noticing repetition |
| **3** | **Looks genuinely handwritten** — calt cycle long enough that patterns never appear |
| 4+ | Imperceptible improvement; diminishing returns |

**Which characters need variants?**

Only **lowercase letters matter** for variants. Uppercase, digits, and punctuation appear infrequently enough that the eye never notices repetition. The pipeline handles partial coverage gracefully — only glyphs that exist in *all* variant folders join the calt cycle; everything else silently falls back to variant 1.

**For variant sheets 2 and 3:** You only *need* to write the 26 lowercase letters (`a–z`, rows 0–1). Writing the full sheet again is fine too (more coverage, same sitting) — but not required.

For multi-variant: user prints and fills identical sheets. Each sheet = one variant set.

---

## File Structure

```
tools/font/
  PIPELINE.md            # this file
  config.py              # grid layout, character mapping, font metrics
  template/
    template.html        # Printable A4 template (open in browser, Cmd+P)
    template-guide.md    # Pen, lighting, and photography tips
  scripts/
    extract_glyphs.py    # Photo/scan → individual glyph PNGs
    build_font.py        # Glyph PNGs → TTF/WOFF2
  output/
    glyphs/
      variant_1/         # One folder per template sheet filled
      variant_2/
    font/
      HeliosHandwriting.ttf
      HeliosHandwriting.woff2
public/fonts/            # Final font served by Next.js
```

---

## Phase A — Template + Extraction

### Step 1: Print the template

Open `tools/font/template/template.html` in any browser. Print at 100% scale on A4 (no "fit to page"). The sheet has:
- 4 filled black squares (12 mm) in page corners — registration markers for OpenCV
- Each cell: ~18 mm wide × 30 mm tall with guide lines (baseline solid, x-height + cap-height dashed)
- Character label printed below each cell in small grey text

Read `template-guide.md` for pen and photography tips before writing.

### Step 2: Extract glyphs

```bash
cd tools/font
python scripts/extract_glyphs.py --input scan.jpg --variant 1
```

Algorithm:
1. Load image, convert to grayscale
2. Otsu threshold to binary
3. Find contours → locate 4 registration markers (large filled squares in corners)
4. Compute perspective transform from marker centres → `warpPerspective` to canonical A4
5. Divide corrected image into cells using known grid dimensions from `config.py`
6. For each cell: crop with inset, adaptive threshold, remove noise < 5px, invert
7. Save as `output/glyphs/variant_1/{char_name}.png`

---

## Phase B — Font Assembly (single variant)

```bash
cd tools/font
python scripts/build_font.py --name "HeliosHandwriting"
```

For each glyph PNG:
1. Call `potrace --svg` via subprocess to vectorize bitmap → SVG path
2. Parse SVG `<path d="...">` and flip Y-axis for font coordinate system
3. Scale path to fit 1000-unit UPM

Then use `fonttools.fontBuilder.FontBuilder`:
- Metrics: UPM=1000, ascender=800, descender=-200, capHeight=700, xHeight=500
- Build cmap (Unicode → glyph name)
- Save `.ttf` and `.woff2`

---

## Phase C — Multi-variant + calt

For characters with variants, generate `.fea` code using the "endless cycle" pattern:

```fea
@cycle1 = [a b c ...];        # base glyphs
@cycle2 = [a.alt1 b.alt1 ...]; # variant 1
@cycle3 = [a.alt2 b.alt2 ...]; # variant 2

feature calt {
  sub @cycle1 @cycle1' by @cycle2;
  sub @cycle2 @cycle1' by @cycle3;
  sub @cycle3 @cycle1' by @cycle1;
} calt;
```

Compiled into the GSUB table via `fonttools.feaLib.builder.addOpenTypeFeatures`.

---

## Next.js Integration

```tsx
// app/layout.tsx
import localFont from 'next/font/local'

const heliosFont = localFont({
  src: '../public/fonts/HeliosHandwriting.woff2',
  variable: '--font-handwriting',
  display: 'swap',
})
```

```css
/* Enable calt (usually on by default in browsers) */
font-feature-settings: "calt" 1;
```

---

## Current Status

**Phase A complete (pipeline built).** Next human action required: print and fill the template.

- [x] Phase A pipeline built: template, config, extract_glyphs.py, build_font.py
- [ ] Human: print `template/template.html` and fill 1–3 sheets (see template-guide.md)
- [ ] Human: photograph sheet(s) and drop into `tools/font/` as `scan_v1.jpg`, `scan_v2.jpg` etc.
- [ ] Run `extract_glyphs.py` on each photo
- [ ] Run `build_font.py --variants N`
- [ ] Load OTF in macOS Font Book — verify all characters present
- [ ] Drop WOFF2 into `public/fonts/` → wire up in `app/layout.tsx`
- [ ] Visual QA in Helios at card + body text sizes

## Verification Checklist

- [ ] Print template → check cells and registration markers are correct at A4
- [ ] Run `extract_glyphs.py` on a test photo → verify each PNG crops cleanly (add `--debug` flag)
- [ ] Run `build_font.py` → load OTF in macOS Font Book, verify all characters present
- [ ] Test in browser with a standalone HTML page using the font
- [ ] Verify calt randomization: repeated letters should cycle through variants visually
- [ ] Drop WOFF2 into Helios Next.js → visual QA at card + body text sizes

---

## Font Metrics Reference

| Property | Value |
|---|---|
| UPM | 1000 |
| Ascender | 800 |
| Descender | -200 |
| Cap Height | 700 |
| x-Height | 500 |
| Line Gap | 0 |
