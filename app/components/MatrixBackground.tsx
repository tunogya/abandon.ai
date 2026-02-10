"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CELL_SIZE_PX = 10;
const DEFAULT_MESSAGE = "Hello";
const GLYPH_DATA_URL = "/data/geist-pixel-square-23rows.json";
const NOISE_CHARS = ["0", "1", "-", "+", "·"];

type GlyphRecord = {
  char: string;
  codepoint: string;
  width: number;
  height: number;
  matrix: number[][];
};

type GlyphData = {
  meta: {
    rows: number;
    font: string;
    source: string;
  };
  glyphs: GlyphRecord[];
};

export default function MatrixBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;

    // ------------------------------------------------------------
    // Three.js setup
    // ------------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.z = 1;

    const textureFormat = THREE.RedFormat;
    let textTexture = new THREE.DataTexture(new Uint8Array([0]), 1, 1, textureFormat);
    textTexture.minFilter = THREE.NearestFilter;
    textTexture.magFilter = THREE.NearestFilter;
    textTexture.wrapS = THREE.ClampToEdgeWrapping;
    textTexture.wrapT = THREE.ClampToEdgeWrapping;
    textTexture.needsUpdate = true;

    let noiseTexture = new THREE.DataTexture(new Uint8Array([0]), 1, 1, textureFormat);
    noiseTexture.minFilter = THREE.NearestFilter;
    noiseTexture.magFilter = THREE.NearestFilter;
    noiseTexture.wrapS = THREE.ClampToEdgeWrapping;
    noiseTexture.wrapT = THREE.ClampToEdgeWrapping;
    noiseTexture.needsUpdate = true;

    // ------------------------------------------------------------
    // Grid / world state
    // ------------------------------------------------------------
    let gridX = 1;
    let gridY = 1;
    const worldOffset = new THREE.Vector2(0, 0);
    const textOrigin = new THREE.Vector2(0, 0);
    let textWidth = 1;
    let textHeight = 1;
    let textReady = false;
    let noiseCount = 1;

    function setGridFromViewport(width: number, height: number) {
      const nextGridX = Math.max(1, Math.floor(width / CELL_SIZE_PX));
      const nextGridY = Math.max(1, Math.floor(height / CELL_SIZE_PX));
      if (nextGridX === gridX && nextGridY === gridY) return false;

      gridX = nextGridX;
      gridY = nextGridY;
      return true;
    }

    // ------------------------------------------------------------
    // Shader setup (noise + grid)
    // ------------------------------------------------------------
    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = /* glsl */ `
      precision highp float;

      uniform vec2 uGrid;
      uniform vec2 uWorldOffset;
      uniform vec2 uTextOrigin;
      uniform vec2 uTextSize;
      uniform sampler2D uTextTexture;
      uniform float uTextReady;
      uniform sampler2D uNoiseAtlas;
      uniform float uNoiseCount;
      uniform float uTime;
      uniform float uNoiseScale;
      uniform float uNoiseSpeed;

      varying vec2 vUv;

      // 3D Simplex noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;

        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      void main() {
        vec2 gridUV = vUv * uGrid;
        vec2 cell = floor(gridUV);
        vec2 local = fract(gridUV);
        vec2 worldCell = cell + uWorldOffset;

        float cellMask = step(0.08, local.x) * step(0.08, local.y)
          * step(local.x, 0.92) * step(local.y, 0.92);

        float n = snoise(vec3(worldCell / uGrid * uNoiseScale, uTime * uNoiseSpeed));
        float n01 = n * 0.5 + 0.5;

        float flicker = snoise(vec3(worldCell / uGrid * (uNoiseScale * 1.7), uTime * (uNoiseSpeed * 1.4)));
        float flicker01 = flicker * 0.5 + 0.5;

        float idx = floor(min(n01, 0.9999) * uNoiseCount);
        vec2 glyphUV = vec2((idx + local.x) / uNoiseCount, local.y);
        float noiseGlyph = texture2D(uNoiseAtlas, glyphUV).r;

        float base = noiseGlyph * mix(0.05, 0.22, n01) * mix(0.75, 1.1, flicker01);

        float textValue = 0.0;
        if (uTextReady > 0.5) {
          vec2 textCell = worldCell - uTextOrigin;
          if (textCell.x >= 0.0 && textCell.y >= 0.0
              && textCell.x < uTextSize.x && textCell.y < uTextSize.y) {
            vec2 texUV = vec2(
              (textCell.x + 0.5) / uTextSize.x,
              (textCell.y + 0.5) / uTextSize.y
            );
            textValue = texture2D(uTextTexture, texUV).r;
          }
        }

        float value = max(base, textValue);
        vec3 color = vec3(value) * cellMask;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const uniforms = {
      uGrid: { value: new THREE.Vector2(gridX, gridY) },
      uWorldOffset: { value: worldOffset.clone() },
      uTextOrigin: { value: textOrigin.clone() },
      uTextSize: { value: new THREE.Vector2(textWidth, textHeight) },
      uTextTexture: { value: textTexture },
      uTextReady: { value: 0 },
      uNoiseAtlas: { value: noiseTexture },
      uNoiseCount: { value: noiseCount },
      uTime: { value: 0 },
      uNoiseScale: { value: 4.0 },
      uNoiseSpeed: { value: 0.7 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), material);
    scene.add(plane);

    // ------------------------------------------------------------
    // Resize handling (keeps plane filling the viewport)
    // ------------------------------------------------------------
    function centerTextIfReady() {
      if (!textReady) return;
      const originX = Math.floor(gridX / 2 - textWidth / 2);
      const originY = Math.floor(gridY / 2 - textHeight / 2);
      textOrigin.set(originX, originY);
      uniforms.uTextOrigin.value.set(originX, originY);
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      setGridFromViewport(w, h);
      uniforms.uGrid.value.set(gridX, gridY);
      centerTextIfReady();

      const distance = camera.position.z;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const planeHeight = 2 * Math.tan(vFov / 2) * distance;
      const planeWidth = planeHeight * camera.aspect;
      plane.scale.set(planeWidth, planeHeight, 1);
    }

    window.addEventListener("resize", resize);
    resize();

    // ------------------------------------------------------------
    // Drag to pan (world offset in cell units)
    // ------------------------------------------------------------
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    }

    function onPointerMove(event: PointerEvent) {
      if (!isDragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      worldOffset.x -= dx / CELL_SIZE_PX;
      worldOffset.y += dy / CELL_SIZE_PX;
      uniforms.uWorldOffset.value.set(worldOffset.x, worldOffset.y);
    }

    function onPointerUp() {
      isDragging = false;
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // ------------------------------------------------------------
    // Animation loop
    // ------------------------------------------------------------
    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = window.requestAnimationFrame(animate);
      const delta = clock.getDelta();
      uniforms.uTime.value += delta;
      renderer.render(scene, camera);
    }

    animate();

    function buildTextPixels(message: string, data: GlyphData) {
      const glyphMap = new Map<string, GlyphRecord>();
      for (const glyph of data.glyphs) {
        glyphMap.set(glyph.char, glyph);
      }

      const rows = data.meta?.rows || 23;
      const gap = 1;
      const chars = Array.from(message);
      const glyphs = chars.map((char) => glyphMap.get(char));

      let totalWidth = 0;
      for (let i = 0; i < glyphs.length; i += 1) {
        const glyph = glyphs[i];
        totalWidth += glyph ? glyph.width : 0;
        if (i < glyphs.length - 1) totalWidth += gap;
      }
      totalWidth = Math.max(1, totalWidth);

      const grid = Array.from({ length: rows }, () => new Array(totalWidth).fill(0));
      let offsetX = 0;
      for (let i = 0; i < glyphs.length; i += 1) {
        const glyph = glyphs[i];
        if (glyph) {
          for (let row = 0; row < rows; row += 1) {
            const rowData = glyph.matrix[row] || [];
            for (let col = 0; col < glyph.width; col += 1) {
              if (rowData[col]) {
                grid[row][offsetX + col] = 1;
              }
            }
          }
          offsetX += glyph.width;
        }
        if (i < glyphs.length - 1) {
          offsetX += gap;
        }
      }

      const pixels = new Uint8Array(totalWidth * rows);
      for (let row = 0; row < rows; row += 1) {
        const rowData = grid[row];
        for (let col = 0; col < totalWidth; col += 1) {
          if (rowData[col]) {
            pixels[row * totalWidth + col] = 255;
          }
        }
      }

      return { width: totalWidth, height: rows, pixels };
    }

    function buildNoiseAtlas(data: GlyphData, chars: string[]) {
      const glyphMap = new Map<string, GlyphRecord>();
      for (const glyph of data.glyphs) {
        glyphMap.set(glyph.char, glyph);
      }

      const rows = data.meta?.rows || 23;
      const glyphs = chars.map((char) => glyphMap.get(char));
      const tileWidth = Math.max(
        1,
        ...glyphs.map((glyph) => (glyph ? glyph.width : 0))
      );
      const width = tileWidth * glyphs.length;
      const pixels = new Uint8Array(width * rows);

      for (let i = 0; i < glyphs.length; i += 1) {
        const glyph = glyphs[i];
        if (!glyph || glyph.width === 0) continue;
        const offsetX = i * tileWidth + Math.floor((tileWidth - glyph.width) / 2);
        for (let row = 0; row < rows; row += 1) {
          const rowData = glyph.matrix[row] || [];
          for (let col = 0; col < glyph.width; col += 1) {
            if (rowData[col]) {
              pixels[row * width + offsetX + col] = 255;
            }
          }
        }
      }

      return { width, height: rows, pixels, count: glyphs.length };
    }

    async function loadTextTexture(message: string) {
      try {
        const res = await fetch(GLYPH_DATA_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} loading ${GLYPH_DATA_URL}`);
        }
        const data = (await res.json()) as GlyphData;
        const { width, height, pixels } = buildTextPixels(message, data);
        const noiseAtlas = buildNoiseAtlas(data, NOISE_CHARS);
        if (disposed) return;

        const nextTexture = new THREE.DataTexture(pixels, width, height, textureFormat);
        nextTexture.minFilter = THREE.NearestFilter;
        nextTexture.magFilter = THREE.NearestFilter;
        nextTexture.wrapS = THREE.ClampToEdgeWrapping;
        nextTexture.wrapT = THREE.ClampToEdgeWrapping;
        nextTexture.needsUpdate = true;

        textTexture.dispose();
        textTexture = nextTexture;
        textWidth = width;
        textHeight = height;
        textReady = true;

        uniforms.uTextTexture.value = textTexture;
        uniforms.uTextSize.value.set(textWidth, textHeight);
        uniforms.uTextReady.value = 1;
        centerTextIfReady();

        const nextNoise = new THREE.DataTexture(
          noiseAtlas.pixels,
          noiseAtlas.width,
          noiseAtlas.height,
          textureFormat
        );
        nextNoise.minFilter = THREE.NearestFilter;
        nextNoise.magFilter = THREE.NearestFilter;
        nextNoise.wrapS = THREE.ClampToEdgeWrapping;
        nextNoise.wrapT = THREE.ClampToEdgeWrapping;
        nextNoise.needsUpdate = true;

        noiseTexture.dispose();
        noiseTexture = nextNoise;
        noiseCount = noiseAtlas.count;
        uniforms.uNoiseAtlas.value = noiseTexture;
        uniforms.uNoiseCount.value = noiseCount;
      } catch (err) {
        console.warn("Failed to load glyph data:", err);
      }
    }

    loadTextTexture(DEFAULT_MESSAGE);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.cancelAnimationFrame(rafId);

      material.dispose();
      plane.geometry.dispose();
      textTexture.dispose();
      noiseTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
