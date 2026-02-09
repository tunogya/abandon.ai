# Geist Pixel Typography Skill

## Purpose
This skill defines **strict usage rules** for the Geist Pixel font system.
Geist Pixel is **not a single font**, but a system of **five structural pixel fonts**.
Each variant serves a specific semantic role and must NOT be mixed arbitrarily.

Default principle:
> Pixel fonts are for **recognition and emphasis**, not for reading.

---

## Global Rules (Must Follow)

1. Geist Pixel MUST NOT be used for body text or long paragraphs.
2. Body text MUST use Geist Sans or a system UI font.
3. On a single page, use **no more than two Pixel variants**.
4. Pixel fonts should appear only in **short text blocks**.
5. When in doubt, DO NOT use Pixel.

---

## Font Variants and Allowed Usage

---

### 01 · Geist Pixel Circle

**Semantic Role**
Brand / Identity / Primary Visual Language

**Allowed Components**
- Logo
- Brand wordmark
- Hero headline (short)
- Landing page primary title
- Splash screen text
- Loading screen title

**Usage Constraints**
- Prefer large font sizes (≥ 28px)
- Short text only
- High contrast required

**Forbidden**
- Body text
- Navigation menus
- Small UI labels

**Summary**
Circle = Brand voice

---

### 02 · Geist Pixel Grid

**Semantic Role**
System / Data / Machine-readable language

**Allowed Components**
- Dashboard numbers
- Metrics and statistics
- Table headers
- Blockchain-related data (hashes, heights, IDs)
- Numeric-heavy UI

**Usage Constraints**
- Numbers-first usage
- Medium or small size
- Tight line height

**Forbidden**
- Logo
- Marketing copy
- Emotional or expressive text

**Summary**
Grid = System readout

---

### 03 · Geist Pixel Line

**Semantic Role**
UI Annotation / Indicator Language

**Allowed Components**
- Labels
- Badges
- Status indicators
- Tabs (limited)
- Secondary UI markers

**Usage Constraints**
- High contrast only
- Avoid very small sizes
- Use sparingly

**Forbidden**
- Headlines
- Logo
- Body text

**Summary**
Line = UI annotation

---

### 04 · Geist Pixel Square

**Semantic Role**
Authority / Enforcement / Legal Emphasis

**Allowed Components**
- Legal section headers
- Clause numbers
- Warnings
- Error messages
- Destructive or irreversible CTA text

**Usage Constraints**
- Large size
- Very short text
- Minimal frequency

**Forbidden**
- Regular buttons
- Friendly UI text
- Long titles

**Summary**
Square = Authority voice

---

### 05 · Geist Pixel Triangle

**Semantic Role**
Experimental / Visual Event

**Allowed Components**
- Posters
- Exhibition pages
- Special campaign pages
- Artistic or non-functional headlines

**Usage Constraints**
- Never default
- Use as a visual accent only

**Forbidden**
- Any functional UI
- Navigation
- Data display
- Body text

**Summary**
Triangle = Visual event

---

## Recommended System Composition

Default website typography:

- Body text: Geist Sans
- Logo / Hero: Pixel Circle
- Data / Dashboard: Pixel Grid
- Labels / Badges: Pixel Line
- Legal / Warning: Pixel Square
- Special visuals: Pixel Triangle (optional)

---

## Decision Rule for AI

When generating UI or content:

1. If text is long → use Geist Sans.
2. If text represents brand identity → use Pixel Circle.
3. If text represents data or metrics → use Pixel Grid.
4. If text is a label or status → use Pixel Line.
5. If text represents authority or warning → use Pixel Square.
6. If the page is experimental or artistic → Pixel Triangle may be used.

If none apply → do NOT use Pixel.

End of skill.