"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";

// Ported from the React Bits <Silk /> shader to ogl so it shares the same
// lightweight WebGL stack as Grainient — no three.js / react-three-fiber.

export type SilkProps = {
  /** Animation speed of the silk flow. */
  speed?: number;
  /** Scale of the silk pattern. */
  scale?: number;
  /** Hex color of the silk. */
  color?: string;
  /** Intensity of the grain/noise. */
  noiseIntensity?: number;
  /** Rotation of the pattern, in radians. */
  rotation?: number;
  className?: string;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    Number.parseInt(result[1], 16) / 255,
    Number.parseInt(result[2], 16) / 255,
    Number.parseInt(result[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
out vec4 fragColor;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  vec2 vUv = gl_FragCoord.xy / iResolution.xy;
  float rnd     = noise(gl_FragCoord.xy);
  vec2  uv      = rotateUvs(vUv * uScale, uRotation);
  vec2  tex     = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                            sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  fragColor = col;
}
`;

type SilkCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  mesh: InstanceType<typeof Mesh>;
};
const ctxMap = new WeakMap<HTMLDivElement, SilkCtx>();

export function Silk({
  speed = 5,
  scale = 1,
  color = "#7B7481",
  noiseIntensity = 1.5,
  rotation = 0,
  className = "",
}: SilkProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Build the WebGL context once; pause when offscreen / tab hidden.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: new Float32Array([1, 1]) },
        uTime: { value: 0 },
        uColor: { value: new Float32Array([1, 1, 1]) },
        uSpeed: { value: 5 },
        uScale: { value: 1 },
        uRotation: { value: 0 },
        uNoiseIntensity: { value: 1.5 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = (program.uniforms.iResolution as { value: Float32Array })
        .value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      // Matches the original component's ~0.1 * elapsed time accumulation.
      (program.uniforms.uTime as { value: number }).value =
        (t - t0) * 0.001 * 0.1;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) {
        raf = requestAnimationFrame(loop);
      }
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) tryStart();
        else tryStop();
      },
      { threshold: 0 },
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) tryStart();
      else tryStop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ctxMap.delete(container);
      try {
        container.removeChild(canvas);
      } catch {
        /* ignore */
      }
    };
  }, []);

  // Sync props to uniforms — no GPU rebuild.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const u = ctx.program.uniforms as Record<string, { value: unknown }>;
    u.uSpeed.value = speed;
    u.uScale.value = scale;
    u.uRotation.value = rotation;
    u.uNoiseIntensity.value = noiseIntensity;
    u.uColor.value = new Float32Array(hexToRgb(color));
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <div
      ref={containerRef}
      className={cn("size-full overflow-hidden", className)}
    />
  );
}
