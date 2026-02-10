"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const CELL_SIZE_PX = 18;
const NOISE_CHARS = ["0", "1", "+", "-", "·"];
const BLOCK_CHAR = "█";
const TARGET_CHARS = [BLOCK_CHAR];
const CHARS = [...NOISE_CHARS, ...TARGET_CHARS];
const DEFAULT_TEXT = "ABANDON, INC.";

export default function MatrixBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getPixelSquareFontFamily = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-geist-pixel-square")
        .trim();
      return value || "monospace";
    };

    let fontFamily = getPixelSquareFontFamily();

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

    // ------------------------------------------------------------
    // Glyph atlas texture (characters packed into a single row)
    // ------------------------------------------------------------
    function createGlyphAtlas(chars: string[], cellSize = 64, family = "monospace") {
      const canvas = document.createElement("canvas");
      canvas.width = chars.length * cellSize;
      canvas.height = cellSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to create glyph atlas context");

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.floor(cellSize * 0.7)}px ${family}`;

      for (let i = 0; i < chars.length; i += 1) {
        const x = i * cellSize + cellSize / 2;
        const y = cellSize / 2;
        ctx.fillText(chars[i], x, y);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      return { canvas, texture };
    }

    let glyphAtlas = createGlyphAtlas(CHARS, 64, fontFamily);

    // ------------------------------------------------------------
    // Offscreen text mask (Canvas2D -> CanvasTexture)
    // ------------------------------------------------------------
    let gridX = 1;
    let gridY = 1;

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!maskCtx) throw new Error("Failed to create mask context");

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    if (!textCtx) throw new Error("Failed to create text context");

    const maskTexture = new THREE.CanvasTexture(maskCanvas);
    maskTexture.minFilter = THREE.NearestFilter;
    maskTexture.magFilter = THREE.NearestFilter;
    maskTexture.wrapS = THREE.ClampToEdgeWrapping;
    maskTexture.wrapT = THREE.ClampToEdgeWrapping;

    function setGridFromViewport(width: number, height: number) {
      const nextGridX = Math.max(1, Math.floor(width / CELL_SIZE_PX));
      const nextGridY = Math.max(1, Math.floor(height / CELL_SIZE_PX));
      if (nextGridX === gridX && nextGridY === gridY) return false;

      gridX = nextGridX;
      gridY = nextGridY;
      maskCanvas.width = gridX;
      maskCanvas.height = gridY;
      textCanvas.width = gridX * 8;
      textCanvas.height = gridY * 8;
      maskTexture.needsUpdate = true;
      return true;
    }

    function updateTextMask(text: string) {
      if (!textCtx || !maskCtx) return;
      const w = textCanvas.width;
      const h = textCanvas.height;

      textCtx.clearRect(0, 0, w, h);
      textCtx.fillStyle = "black";
      textCtx.fillRect(0, 0, w, h);
      textCtx.fillStyle = "white";
      textCtx.textAlign = "center";
      textCtx.textBaseline = "middle";

      let fontSize = Math.floor(h * 0.65);
      textCtx.font = `bold ${fontSize}px ${fontFamily}`;
      const metrics = textCtx.measureText(text);
      if (metrics.width > w * 0.9) {
        fontSize = Math.floor(fontSize * (w * 0.9 / metrics.width));
        textCtx.font = `bold ${fontSize}px ${fontFamily}`;
      }

      textCtx.fillText(text, w / 2, h / 2);

      // Downsample to grid resolution
      maskCtx.clearRect(0, 0, gridX, gridY);
      maskCtx.imageSmoothingEnabled = true;
      maskCtx.drawImage(textCanvas, 0, 0, gridX, gridY);

      // Threshold for a crisp mask
      const img = maskCtx.getImageData(0, 0, gridX, gridY);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = img.data[i];
        const b = v > 30 ? 255 : 0;
        img.data[i] = b;
        img.data[i + 1] = b;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
      maskCtx.putImageData(img, 0, 0);
      maskTexture.needsUpdate = true;
    }

    setGridFromViewport(window.innerWidth, window.innerHeight);
    updateTextMask(DEFAULT_TEXT);
    let activeText = DEFAULT_TEXT;

    // ------------------------------------------------------------
    // Shader setup (noise + grid + text mask blend)
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

      uniform sampler2D uGlyphAtlas;
      uniform sampler2D uTextMask;
      uniform vec2 uGrid;
      uniform float uTime;
      uniform float uTransition;
      uniform float uCharCount;
      uniform float uNoiseCharCount;
      uniform float uTargetCharOffset;
      uniform float uTargetCharCount;
      uniform float uBlockCharIndex;
      uniform float uNoiseScale;
      uniform float uNoiseSpeed;
      uniform float uTargetBrightness;

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
        // Grid addressing
        vec2 gridUV = vUv * uGrid;
        vec2 cell = floor(gridUV);
        vec2 cellUV = (cell + 0.5) / uGrid;
        vec2 local = fract(gridUV);

        // Sample text mask (1 inside, 0 outside)
        float mask = texture2D(uTextMask, cellUV).r;
        mask = smoothstep(0.1, 0.9, mask);

        // Animated noise driving character choice + brightness
        float n = snoise(vec3(cell / uGrid * uNoiseScale, uTime * uNoiseSpeed));
        float n01 = n * 0.5 + 0.5;

        float flicker = snoise(vec3(cell / uGrid * (uNoiseScale * 1.7), uTime * (uNoiseSpeed * 1.4)));
        float flicker01 = flicker * 0.5 + 0.5;

        float noiseIdx = floor(min(n01, 0.9999) * uNoiseCharCount);
        float noiseBrightness = mix(0.2, 1.0, n01) * mix(0.7, 1.1, flicker01);

        // Per-cell stagger for the transition
        float cellJitter = snoise(vec3(cell / uGrid * (uNoiseScale * 0.6), 0.0));
        float t = clamp(uTransition + (cellJitter * 0.2), 0.0, 1.0);
        t = smoothstep(0.0, 1.0, t) * mask;

        // Stable per-cell target character (picked from the target set)
        float targetNoise = snoise(vec3(cell / uGrid * (uNoiseScale * 0.9), 1.234));
        float target01 = targetNoise * 0.5 + 0.5;
        float targetLocal = floor(min(target01, 0.9999) * uTargetCharCount);
        float targetIdx = uTargetCharOffset + targetLocal;

        // Interpolate between noise and target character
        float charIdx = floor(mix(noiseIdx, targetIdx, t) + 0.5);
        float finalBrightness = mix(noiseBrightness, uTargetBrightness, t);

        // Sample the glyph atlas (or draw a solid block for the block char)
        vec2 glyphUV = vec2((charIdx + local.x) / uCharCount, 1.0 - local.y);
        float glyph = texture2D(uGlyphAtlas, glyphUV).r;

        float isBlock = 1.0 - step(0.5, abs(charIdx - uBlockCharIndex));
        float margin = 0.02;
        float block = step(margin, local.x) * step(margin, local.y)
          * step(local.x, 1.0 - margin) * step(local.y, 1.0 - margin);
        glyph = mix(glyph, block, isBlock);

        vec3 color = vec3(finalBrightness) * glyph;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const uniforms = {
      uGlyphAtlas: { value: glyphAtlas.texture },
      uTextMask: { value: maskTexture },
      uGrid: { value: new THREE.Vector2(gridX, gridY) },
      uTime: { value: 0 },
      uTransition: { value: 0 },
      uCharCount: { value: CHARS.length },
      uNoiseCharCount: { value: NOISE_CHARS.length },
      uTargetCharOffset: { value: NOISE_CHARS.length },
      uTargetCharCount: { value: TARGET_CHARS.length },
      uBlockCharIndex: { value: CHARS.indexOf(BLOCK_CHAR) },
      uNoiseScale: { value: 4.0 },
      uNoiseSpeed: { value: 0.7 },
      uTargetBrightness: { value: 0.95 },
    };

    // Ensure the pixel-square font is used once loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => {
          const nextFamily = getPixelSquareFontFamily();
          fontFamily = nextFamily;
          const nextAtlas = createGlyphAtlas(CHARS, 64, fontFamily);
          glyphAtlas.texture.dispose();
          glyphAtlas = nextAtlas;
          uniforms.uGlyphAtlas.value = glyphAtlas.texture;
          updateTextMask(activeText);
        })
        .catch(() => {});
    }

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
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const gridChanged = setGridFromViewport(w, h);
      uniforms.uGrid.value.set(gridX, gridY);
      if (gridChanged) {
        updateTextMask(activeText);
      }

      // Scale the plane to fill the view at z=0
      const distance = camera.position.z;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const planeHeight = 2 * Math.tan(vFov / 2) * distance;
      const planeWidth = planeHeight * camera.aspect;
      plane.scale.set(planeWidth, planeHeight, 1);
    }

    window.addEventListener("resize", resize);
    resize();

    // ------------------------------------------------------------
    // Text triggering logic (press any key to emerge text)
    // ------------------------------------------------------------
    let transitioning = false;
    let inputBuffer = "";

    function triggerText(text: string) {
      const safeText = (text || DEFAULT_TEXT).toUpperCase().slice(0, 32);
      activeText = safeText;
      updateTextMask(safeText);
      uniforms.uTransition.value = 0;
      transitioning = true;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Backspace") {
        inputBuffer = inputBuffer.slice(0, -1);
        return;
      }

      if (event.key === "Enter") {
        triggerText(inputBuffer || DEFAULT_TEXT);
        inputBuffer = "";
        return;
      }

      if (event.key.length === 1) {
        inputBuffer += event.key;
        triggerText(inputBuffer);
        return;
      }

      // Any other key triggers the default word
      triggerText(DEFAULT_TEXT);
    }

    window.addEventListener("keydown", onKeyDown);

    // ------------------------------------------------------------
    // Animation loop
    // ------------------------------------------------------------
    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = window.requestAnimationFrame(animate);

      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      // Drive the transition from noise -> text
      if (transitioning) {
        uniforms.uTransition.value = Math.min(1.0, uniforms.uTransition.value + delta * 0.6);
        if (uniforms.uTransition.value >= 1.0) {
          transitioning = false;
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(rafId);

      material.dispose();
      plane.geometry.dispose();
      glyphAtlas.texture.dispose();
      maskTexture.dispose();
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
