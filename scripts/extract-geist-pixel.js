#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const DEFAULT_URL = "https://vercel.com/font?type=pixel#get";
const DEFAULT_ROWS = 23;
const DEFAULT_SAMPLES = 4;
const DEFAULT_VARIANT = "square";

const VARIANT_TO_FILE = {
  square: "GeistPixel-Square.woff2",
  grid: "GeistPixel-Grid.woff2",
  circle: "GeistPixel-Circle.woff2",
  triangle: "GeistPixel-Triangle.woff2",
  line: "GeistPixel-Line.woff2",
};

function parseArgs(argv) {
  const opts = {
    variant: DEFAULT_VARIANT,
    rows: DEFAULT_ROWS,
    samples: DEFAULT_SAMPLES,
    url: DEFAULT_URL,
    out: null,
    chars: null,
    font: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--variant" || arg === "-v") {
      opts.variant = (argv[i + 1] || "").toLowerCase();
      i += 1;
    } else if (arg === "--rows" || arg === "-r") {
      opts.rows = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--samples" || arg === "-s") {
      opts.samples = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--url") {
      opts.url = argv[i + 1];
      i += 1;
    } else if (arg === "--out" || arg === "-o") {
      opts.out = argv[i + 1];
      i += 1;
    } else if (arg === "--chars") {
      opts.chars = argv[i + 1];
      i += 1;
    } else if (arg === "--font") {
      opts.font = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function printHelp() {
  const usage = [
    "Extract Geist Pixel glyphs into 0/1 matrices.",
    "",
    "Usage:",
    "  node scripts/extract-geist-pixel.js [options]",
    "",
    "Options:",
    "  -v, --variant <square|grid|circle|triangle|line>  Font variant (default: square)",
    "  -r, --rows <number>                               Matrix rows (default: 23)",
    "  -s, --samples <number>                            Samples per cell (default: 4)",
    "  --url <url>                                       Specimen page URL",
    "  -o, --out <file>                                  Output JSON path",
    "  --chars <string>                                  Override characters list",
    "  --font <path>                                     Override font file path",
    "  -h, --help                                        Show help",
    "",
    "Dependencies:",
    "  npm i -D opentype.js wawoff2",
  ];
  console.log(usage.join("\n"));
}

async function loadModule(name) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(name);
  } catch (err) {
    if (err && err.code === "ERR_REQUIRE_ESM") {
      return import(name);
    }
    throw err;
  }
}

function fetchText(url) {
  if (typeof fetch === "function") {
    return fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return res.text();
    });
  }

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }
        res.setEncoding("utf8");
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "\n");
}

function extractGlyphsFromHtml(html) {
  const text = stripHtml(html);
  const startMarkers = ["Skip to Playground", "Interactive glyph inspector"];
  const endMarkers = [
    "Interactive font playground",
    "coding and design spirit within our community of creators",
  ];

  let startIndex = -1;
  for (const marker of startMarkers) {
    startIndex = text.indexOf(marker);
    if (startIndex !== -1) {
      startIndex += marker.length;
      break;
    }
  }

  let endIndex = -1;
  if (startIndex !== -1) {
    for (const marker of endMarkers) {
      endIndex = text.indexOf(marker, startIndex);
      if (endIndex !== -1) {
        break;
      }
    }
  }

  const slice =
    startIndex !== -1 && endIndex !== -1
      ? text.slice(startIndex, endIndex)
      : text;

  const tokens = slice
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const glyphs = [];
  const seen = new Set();
  for (const token of tokens) {
    if (Array.from(token).length === 1 && !seen.has(token)) {
      seen.add(token);
      glyphs.push(token);
    }
  }

  return glyphs;
}

function getAllCharsFromFont(font) {
  const cmap = font.tables && font.tables.cmap;
  if (!cmap || !cmap.glyphIndexMap) {
    return [];
  }
  const codes = Object.keys(cmap.glyphIndexMap)
    .map((key) => Number(key))
    .filter((code) => Number.isFinite(code))
    .sort((a, b) => a - b);
  return codes.map((code) => String.fromCodePoint(code));
}

function quadAt(p0, p1, p2, t) {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

function cubicAt(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

function flattenPath(path, curveSteps) {
  const segments = [];
  let startX = null;
  let startY = null;
  let prevX = null;
  let prevY = null;

  for (const cmd of path.commands) {
    if (cmd.type === "M") {
      startX = cmd.x;
      startY = cmd.y;
      prevX = cmd.x;
      prevY = cmd.y;
      continue;
    }

    if (cmd.type === "L") {
      segments.push([prevX, prevY, cmd.x, cmd.y]);
      prevX = cmd.x;
      prevY = cmd.y;
      continue;
    }

    if (cmd.type === "Q") {
      let lastX = prevX;
      let lastY = prevY;
      for (let i = 1; i <= curveSteps; i += 1) {
        const t = i / curveSteps;
        const x = quadAt(prevX, cmd.x1, cmd.x, t);
        const y = quadAt(prevY, cmd.y1, cmd.y, t);
        segments.push([lastX, lastY, x, y]);
        lastX = x;
        lastY = y;
      }
      prevX = cmd.x;
      prevY = cmd.y;
      continue;
    }

    if (cmd.type === "C") {
      let lastX = prevX;
      let lastY = prevY;
      for (let i = 1; i <= curveSteps; i += 1) {
        const t = i / curveSteps;
        const x = cubicAt(prevX, cmd.x1, cmd.x2, cmd.x, t);
        const y = cubicAt(prevY, cmd.y1, cmd.y2, cmd.y, t);
        segments.push([lastX, lastY, x, y]);
        lastX = x;
        lastY = y;
      }
      prevX = cmd.x;
      prevY = cmd.y;
      continue;
    }

    if (cmd.type === "Z") {
      if (startX !== null && startY !== null && prevX !== null) {
        segments.push([prevX, prevY, startX, startY]);
        prevX = startX;
        prevY = startY;
      }
    }
  }

  return segments;
}

function pointInSegments(segments, x, y) {
  let inside = false;
  for (const [x1, y1, x2, y2] of segments) {
    const intersects = (y1 > y) !== (y2 > y);
    if (!intersects) {
      continue;
    }
    const xInt = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
    if (x < xInt) {
      inside = !inside;
    }
  }
  return inside;
}

function glyphToMatrix({
  glyph,
  fontSize,
  rows,
  samples,
  cellSize,
  yMax,
  curveSteps,
}) {
  const path = glyph.getPath(0, 0, fontSize);
  if (!path.commands || path.commands.length === 0) {
    return { width: 0, matrix: Array.from({ length: rows }, () => []) };
  }

  const box = path.getBoundingBox();
  if (
    !Number.isFinite(box.x1) ||
    !Number.isFinite(box.x2) ||
    box.x1 === box.x2
  ) {
    return { width: 0, matrix: Array.from({ length: rows }, () => []) };
  }

  const minX = Math.floor(box.x1 / cellSize) * cellSize;
  const maxX = Math.ceil(box.x2 / cellSize) * cellSize;
  const cols = Math.max(0, Math.round((maxX - minX) / cellSize));

  const segments = flattenPath(path, curveSteps);

  const matrix = [];
  for (let row = 0; row < rows; row += 1) {
    const rowData = new Array(cols).fill(0);
    const cellTop = yMax - row * cellSize;
    const cellBottom = cellTop - cellSize;

    for (let col = 0; col < cols; col += 1) {
      const cellLeft = minX + col * cellSize;
      const cellRight = cellLeft + cellSize;

      let filled = false;
      for (let sy = 0; sy < samples && !filled; sy += 1) {
        const py = cellBottom + ((sy + 0.5) / samples) * (cellTop - cellBottom);
        for (let sx = 0; sx < samples; sx += 1) {
          const px =
            cellLeft + ((sx + 0.5) / samples) * (cellRight - cellLeft);
          if (pointInSegments(segments, px, py)) {
            filled = true;
            break;
          }
        }
      }

      if (filled) {
        rowData[col] = 1;
      }
    }

    matrix.push(rowData);
  }

  return { width: cols, matrix };
}

function codepointHex(char) {
  const code = char.codePointAt(0);
  if (!Number.isFinite(code)) {
    return "U+0000";
  }
  return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
}

function getFontYBounds(font, chars) {
  let yMin = Infinity;
  let yMax = -Infinity;

  for (const char of chars) {
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(0, 0, font.unitsPerEm);
    if (!path.commands || path.commands.length === 0) continue;
    const box = path.getBoundingBox();
    if (!Number.isFinite(box.y1) || !Number.isFinite(box.y2)) continue;
    yMin = Math.min(yMin, box.y1);
    yMax = Math.max(yMax, box.y2);
  }

  if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || yMin === yMax) {
    return { yMin: font.descender, yMax: font.ascender };
  }

  return { yMin, yMax };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  const variant = opts.variant;
  const fontFile = opts.font || VARIANT_TO_FILE[variant];
  if (!fontFile) {
    throw new Error(
      `Unknown variant "${variant}". Use one of: ${Object.keys(
        VARIANT_TO_FILE
      ).join(", ")}`
    );
  }

  const fontPath = opts.font
    ? path.resolve(opts.font)
    : path.join(
        process.cwd(),
        "node_modules",
        "geist",
        "dist",
        "fonts",
        "geist-pixel",
        fontFile
      );

  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found: ${fontPath}`);
  }

  const opentypeModule = await loadModule("opentype.js");
  const opentype = opentypeModule.default || opentypeModule;
  const wawoff2Module = await loadModule("wawoff2");
  const wawoff2 = wawoff2Module.default || wawoff2Module;
  const decompress =
    wawoff2.decompress ||
    wawoff2.decode ||
    (wawoff2Module.default && (wawoff2Module.default.decompress || wawoff2Module.default.decode));

  if (!decompress) {
    throw new Error("wawoff2 does not expose a decompress/decode function.");
  }

  const woff2Buffer = fs.readFileSync(fontPath);
  const ttfData = await decompress(new Uint8Array(woff2Buffer));
  const arrayBuffer = ttfData.buffer.slice(
    ttfData.byteOffset,
    ttfData.byteOffset + ttfData.byteLength
  );
  const font = opentype.parse(arrayBuffer);

  let chars = opts.chars;
  if (!chars) {
    try {
      const html = await fetchText(opts.url);
      const glyphs = extractGlyphsFromHtml(html);
      chars = glyphs.join("");
    } catch (err) {
      console.warn(
        `Failed to fetch or parse glyph list from ${opts.url}. Falling back to font cmap.`
      );
    }
  }

  let charList = [];
  if (chars && chars.length > 0) {
    charList = Array.from(chars);
  } else {
    charList = getAllCharsFromFont(font);
  }

  const rows =
    Number.isFinite(opts.rows) && opts.rows > 0 ? opts.rows : DEFAULT_ROWS;
  const samples =
    Number.isFinite(opts.samples) && opts.samples > 0 ? opts.samples : DEFAULT_SAMPLES;

  const { yMin, yMax } = getFontYBounds(font, charList);
  const cellSize = (yMax - yMin) / rows;
  const curveSteps = 10;

  const glyphs = [];
  for (const char of charList) {
    const glyph = font.charToGlyph(char);
    const { width, matrix } = glyphToMatrix({
      glyph,
      fontSize: font.unitsPerEm,
      rows,
      samples,
      cellSize,
      yMax,
      curveSteps,
    });
    glyphs.push({
      char,
      codepoint: codepointHex(char),
      width,
      height: rows,
      matrix,
    });
  }

  const output = {
    meta: {
      source: opts.url,
      font: fontPath,
      variant,
      rows,
      samples,
      generatedAt: new Date().toISOString(),
    },
    glyphs,
  };

  const outPath =
    opts.out ||
    path.join(process.cwd(), `geist-pixel-${variant}-${rows}rows.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${glyphs.length} glyphs to ${outPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
