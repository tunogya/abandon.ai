# ABANDON.AI

A living interface built on cellular automata and Three.js, where information emerges from noise.

## Tech Stack

- **Next.js 16.1** — React framework
- **React 19** — UI library
- **Three.js** — WebGL rendering
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Styling
- **Geist Pixel Fonts** — Typography system

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Design Philosophy

### 1️⃣ World Model

- A fixed-resolution 2D grid of **cells** (not pixels)
- Each cell is the minimum semantic unit
- Cells have finite states: character / brightness / color / activation

**Key insight**: Once you accept "cells, not pixels" — everything else follows.

### 2️⃣ Noise State (Default)

- Every cell displays:
  - Character set: `[0, 1, *, ., :, #, +]`
  - Or: luminance blocks / dot matrix
  - State changes over time (low correlation, local continuity)

**Not a static background** — a living system.

### 3️⃣ Information State

- Same cells, but:
  - Some cells "lock" into target patterns
  - Others fade / deprioritize / weaken

**Information doesn't overlay** — it emerges:

```
Noise → Organization → Meaning
```

### 4️⃣ Transition

This is the soul of the UI.

Not fade. Not slide. Instead:
- Noise is **attracted**
- **Captured**
- **Constrained**
- **Tamed**

---

## Typography

Uses the **Geist Pixel font system** with semantic rules:

- **Pixel Circle** — Brand identity, hero headlines
- **Pixel Grid** — System data, metrics, numbers
- **Pixel Line** — UI labels, badges, status
- **Pixel Square** — Warnings, legal, authority
- **Geist Sans** — All body text

**Rule**: Maximum 2 Pixel variants per page. Pixel fonts for recognition, not reading.

---

## License

MIT
