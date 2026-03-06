"""
Font pipeline configuration.
All measurements in millimetres unless noted.
"""

# ---------------------------------------------------------------------------
# Grid dimensions
# ---------------------------------------------------------------------------

# A4 at 96 dpi = 794 x 1123 px.  We design in mm and convert for OpenCV.
PAGE_WIDTH_MM  = 210
PAGE_HEIGHT_MM = 297

MARGIN_MM = 15          # page margin on all four sides
REG_MARKER_MM = 12      # filled-square registration marker side length

COLS = 10
ROWS = 9                # 3 lower + 3 upper + 1 digits + 1 punctuation + 1 spare

# Cell interior dimensions (cells fill the usable area between margins)
# Computed at runtime in extract_glyphs.py; kept here for documentation.
CELL_WIDTH_MM  = (PAGE_WIDTH_MM  - 2 * MARGIN_MM) / COLS   # ~18 mm
CELL_HEIGHT_MM = (PAGE_HEIGHT_MM - 2 * MARGIN_MM) / ROWS   # ~29.7 mm

# Guide-line positions within a cell (fraction of cell height from top)
BASELINE_FRAC  = 0.72   # solid line
XHEIGHT_FRAC   = 0.42   # dashed line
CAPHEIGHT_FRAC = 0.22   # dashed line

# ---------------------------------------------------------------------------
# Character map  (row, col) → unicode character
# Row index 0-based; col index 0-based.
# ---------------------------------------------------------------------------

LOWERCASE = list("abcdefghijklmnopqrstuvwxyz")
UPPERCASE = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
DIGITS    = list("0123456789")
PUNCT     = list(".,;:!?'\"()-/&@#%+=£$")  # exactly 20 chars → 2 rows

# Build flat ordered list matching the grid (row-major, row-aligned)
# Rows 0-2 (30 cells): a-z + 4 spare
# Rows 3-5 (30 cells): A-Z + 4 spare
# Row  6   (10 cells): 0-9
# Rows 7-8 (20 cells): punctuation (exactly 20 chars)

_spare_counter = 0

def _pad_to(lst: list, target: int) -> list:
    """Pad list to exactly `target` length with uniquely-named spare markers."""
    global _spare_counter
    result = list(lst)
    while len(result) < target:
        result.append(f"_spare_{_spare_counter}")
        _spare_counter += 1
    return result

_chars_ordered: list[str] = (
    _pad_to(LOWERCASE, 30)   # rows 0-2
    + _pad_to(UPPERCASE, 30) # rows 3-5
    + DIGITS                  # row 6
    + PUNCT                   # rows 7-8  (exactly 20)
)

def cell_char(row: int, col: int) -> str:
    """Return the character assigned to a given (row, col) cell."""
    idx = row * COLS + col
    if idx >= len(_chars_ordered):
        return "_empty_"
    return _chars_ordered[idx]

def all_chars() -> list[str]:
    return _chars_ordered[:COLS * ROWS]

# ---------------------------------------------------------------------------
# Font metrics  (in UPM units, UPM = 1000)
# ---------------------------------------------------------------------------

UPM         = 1000
ASCENDER    = 800
DESCENDER   = -200
CAP_HEIGHT  = 700
X_HEIGHT    = 500
LINE_GAP    = 0

# Target glyph bounding box within the UPM
GLYPH_TOP    = 750     # highest point (above baseline = positive)
GLYPH_BOTTOM = -200    # descenders

# ---------------------------------------------------------------------------
# Character-to-glyph-name mapping (used by build_font.py)
# ---------------------------------------------------------------------------

def glyph_name(char: str) -> str:
    """Return a legal PostScript glyph name for a character."""
    if char.startswith("_spare_") or char.startswith("_empty_"):
        return char.replace("_", "")
    special = {
        ".": "period", ",": "comma", ";": "semicolon", ":": "colon",
        "!": "exclam", "?": "question", "'": "quotesingle", '"': "quotedbl",
        "(": "parenleft", ")": "parenright", "-": "hyphen", "/": "slash",
        "&": "ampersand", "@": "at", "#": "numbersign", "%": "percent",
        "+": "plus", "=": "equal", "£": "sterling", "$": "dollar",
    }
    if char in special:
        return special[char]
    if char.isupper():
        return char  # A, B, C … already valid
    if char.islower():
        return char  # a, b, c … already valid
    if char.isdigit():
        digit_names = {
            "0": "zero", "1": "one", "2": "two", "3": "three",
            "4": "four", "5": "five", "6": "six", "7": "seven",
            "8": "eight", "9": "nine",
        }
        return digit_names[char]
    return f"uni{ord(char):04X}"
