# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application for abandon.ai, built with React 19, TypeScript, and Tailwind CSS 4. The project showcases the **Geist Pixel font system** with strict semantic typography rules.

## Development Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build & Deploy
npm run build        # Production build
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture

### Font System (Critical)

This project uses the **Geist Pixel font system** - a set of five structural pixel fonts, each with specific semantic roles. **This is the most important architectural decision in the codebase.**

**Global Rules:**
1. Pixel fonts are for **recognition and emphasis**, NOT for reading
2. Body text MUST use Geist Sans (`font-sans`)
3. Maximum **2 Pixel variants per page**
4. Pixel fonts only for **short text blocks**
5. When in doubt, DO NOT use Pixel

**Font Variants and Usage:**

- `font-pixel-circle` - Brand identity, hero headlines, logos (≥28px, high contrast)
- `font-pixel-grid` - System data, metrics, statistics, blockchain data (numbers-first)
- `font-pixel-line` - UI labels, badges, status indicators (high contrast, sparingly)
- `font-pixel-square` - Authority, warnings, errors, legal text (large, minimal use)
- `font-pixel-triangle` - Experimental/artistic only (never for functional UI)

**All five fonts are registered in `app/layout.tsx` as CSS variables:**
```typescript
// Layout loads all variants
GeistPixelSquare, GeistPixelCircle, GeistPixelLine,
GeistPixelTriangle, GeistPixelGrid
```

**CSS theme variables defined in `globals.css`:**
```css
--font-pixel-square, --font-pixel-grid, --font-pixel-circle,
--font-pixel-triangle, --font-pixel-line
```

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.3
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with inline theme configuration
- **Fonts**: Geist Sans, Geist Mono, Geist Pixel (5 variants)

### File Structure

- `app/layout.tsx` - Root layout with font registration and metadata
- `app/page.tsx` - Home page (currently showing font demos)
- `app/globals.css` - Global styles with Tailwind v4 inline theme
- `tsconfig.json` - Uses `@/*` path alias for imports

### Styling Approach

Uses Tailwind CSS v4 with `@theme inline` directive in globals.css. Custom design tokens:
- `--color-background` / `--color-foreground` (dark mode via prefers-color-scheme)
- Font family tokens mapped to Geist variables

### Import Aliases

TypeScript configured with `@/*` pointing to project root.

## Typography Decision Tree

When creating or modifying UI:

1. **Long text?** → Use `font-sans` (Geist Sans)
2. **Brand/logo/hero?** → Use `font-pixel-circle`
3. **Data/metrics/numbers?** → Use `font-pixel-grid`
4. **Labels/badges/status?** → Use `font-pixel-line`
5. **Warnings/legal/authority?** → Use `font-pixel-square`
6. **Experimental/artistic?** → Use `font-pixel-triangle` (sparingly)
7. **None apply?** → DO NOT use Pixel fonts

Full typography guidelines available in project memory at:
`~/.claude/projects/-Users-teihate-github-tunogya-abandon-ai/memory/geist-pixel-typography-skill.md`
