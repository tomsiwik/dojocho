"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";

export interface LiquidLinesProps {
  /** Original liquid shading, optionally viewed through a fine dot mask. */
  variant?: "lines" | "dots" | "pixel-lift";
  /** Width of the component */
  width?: string | number;
  /** Height of the component */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Animation speed multiplier */
  speed?: number;
  /** Starting phase in animation seconds, independent of playback speed. */
  timeOffset?: number;
  /** Number of iterations for detail (higher = more detailed but slower) */
  iterations?: number;
  /** Wave frequency - controls how many waves appear */
  waveFrequency?: number;
  /** Depth progression - how much depth changes per iteration */
  depthStep?: number;
  /** Line thickness - controls the thickness of the lines */
  lineThickness?: number;
  /** Wave amplitude - how much the waves displace */
  waveAmplitude?: number;
  /** Primary line color */
  lineColor?: string;
  /** Background color for light mode */
  lightBackground?: string;
  /** Background color for dark mode */
  darkBackground?: string;
  /** Brightness multiplier */
  brightness?: number;
  /** Contrast adjustment */
  contrast?: number;
  /** Horizontal offset */
  offsetX?: number;
  /** Vertical offset */
  offsetY?: number;
  /** Pattern scale */
  scale?: number;
  /** Alpha/opacity of the effect */
  opacity?: number;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const liquidShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_timeOffset;
uniform int u_iterations;
uniform float u_waveFrequency;
uniform float u_depthStep;
uniform float u_lineThickness;
uniform float u_waveAmplitude;
uniform vec3 u_lineColor;
uniform vec3 u_backgroundColor;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_scale;
uniform float u_opacity;

vec3 liquidColor(vec2 sampleUv) {
  float time = u_time * u_speed + u_timeOffset;
  vec2 resolution = u_resolution;

  vec3 accumulator = vec3(0.0);
  float depth = time;
  float magnitude = 0.0;

  vec2 baseCoord = (sampleUv - 0.5) * 2.0;
  baseCoord.x *= resolution.x / resolution.y;
  baseCoord *= u_scale;
  baseCoord += vec2(u_offsetX, u_offsetY);

  for (int i = 0; i < 100; i++) {
    if (i >= u_iterations) break;

    vec2 coord = baseCoord;
    vec2 waveCoord = coord;

    coord -= waveCoord.x + 0.1;
    coord.x *= resolution.x / resolution.y;

    depth += u_depthStep;
    magnitude = length(coord);

    float phase1 = depth * 0.7;
    float phase2 = depth * 1.3;
    float wave1 = sin(phase1) * 0.5 + cos(phase2) * 0.5 + 1.5;
    float wave2 = sin(magnitude * u_waveFrequency - depth) * 0.7 + cos(magnitude * u_waveFrequency * 0.5 + depth * 0.3) * 0.3;
    waveCoord += coord / max(magnitude, 0.01) * wave1 * wave2 * u_waveAmplitude;

    vec2 gridPos = mod(waveCoord, 1.0) - 0.5;
    float lineIntensity = u_lineThickness / length(gridPos);

    if (i == 0) accumulator.r = lineIntensity;
    else if (i == 1) accumulator.g = lineIntensity;
    else if (i == 2) accumulator.b = lineIntensity;
    else {
      accumulator += vec3(lineIntensity) * 0.01;
    }
  }

  accumulator = accumulator / max(magnitude, 0.001);

  accumulator = (accumulator - 0.5) * u_contrast + 0.5;
  accumulator *= u_brightness;

  vec3 finalColor = accumulator * u_lineColor;

  float alpha = clamp(length(accumulator) * u_opacity, 0.0, 1.0);
  finalColor = mix(u_backgroundColor, finalColor, alpha);

  return finalColor;
}
`;

const fragmentShader = `${liquidShader}
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(liquidColor(vUv), 1.0);
}
`;

const liftedVertexShader = `${liquidShader}
uniform vec2 u_pixelSize;
uniform float u_pixelRatio;
varying vec3 vColor;
float elevation(vec3 color) {
  return dot(clamp(color, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
}
void main() {
  vec2 sampleUv = position.xy + 0.5;
  vec3 color = liquidColor(sampleUv);
  float height = elevation(color);
  vec2 stepUv = 3.0 / u_pixelSize;
  float dx = elevation(liquidColor(sampleUv + vec2(stepUv.x, 0.0))) - height;
  float dy = elevation(liquidColor(sampleUv + vec2(0.0, stepUv.y))) - height;
  vec3 normal = normalize(vec3(-dx * 4.0 / 3.0, -dy * 4.0 / 3.0, 1.0));
  vec3 light = normalize(vec3(-0.5, 0.7, 1.0));
  float shine = pow(max(dot(normal, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), 24.0);
  vColor = clamp(color, 0.0, 1.0) * (0.75 + 0.25 * max(dot(normal, light), 0.0)) + shine * height * 0.15;
  vec4 projected = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // Four CSS pixels of relief, projected upward at 45 degrees.
  projected.y += height * 4.0 * 0.70710678 * 2.0 / u_pixelSize.y * projected.w;
  projected.z -= height * 0.0001 * projected.w;
  gl_Position = projected;
  gl_PointSize = max(1.0, 0.75 * u_pixelRatio);
}
`;

const liftedFragmentShader = `
precision highp float;
varying vec3 vColor;
void main() { gl_FragColor = vec4(vColor, 1.0); }
`;

interface ShaderPlaneProps {
  variant: NonNullable<LiquidLinesProps["variant"]>;
  speed: number;
  timeOffset: number;
  iterations: number;
  waveFrequency: number;
  depthStep: number;
  lineThickness: number;
  waveAmplitude: number;
  lineColor: string;
  backgroundColor: string;
  brightness: number;
  contrast: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  opacity: number;
}

const ShaderPlane: React.FC<ShaderPlaneProps> = ({
  variant,
  speed,
  timeOffset,
  iterations,
  waveFrequency,
  depthStep,
  lineThickness,
  waveAmplitude,
  lineColor,
  backgroundColor,
  brightness,
  contrast,
  offsetX,
  offsetY,
  scale,
  opacity,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size, gl } = useThree();
  const points = useMemo(() => {
    if (variant !== "pixel-lift") return new Float32Array(0);
    const columns = Math.ceil(size.width / 3);
    const rows = Math.ceil(size.height / 3);
    const positions = new Float32Array(columns * rows * 3);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = (y * columns + x) * 3;
        positions[index] = (x * 3 + 1.5) / size.width - 0.5;
        positions[index + 1] = (y * 3 + 1.5) / size.height - 0.5;
      }
    }
    return positions;
  }, [variant, size.width, size.height]);

  const uniforms = useMemo(
    () => ({
      u_pixelSize: { value: new THREE.Vector2(size.width, size.height) },
      u_pixelRatio: { value: gl.getPixelRatio() },
      u_time: { value: 0 },
      u_resolution: {
        value: new THREE.Vector2(viewport.width * 100, viewport.height * 100),
      },
      u_speed: { value: speed },
      u_timeOffset: { value: timeOffset },
      u_iterations: { value: iterations },
      u_waveFrequency: { value: waveFrequency },
      u_depthStep: { value: depthStep },
      u_lineThickness: { value: lineThickness },
      u_waveAmplitude: { value: waveAmplitude },
      u_lineColor: { value: new THREE.Color(lineColor) },
      u_backgroundColor: { value: new THREE.Color(backgroundColor) },
      u_brightness: { value: brightness },
      u_contrast: { value: contrast },
      u_offsetX: { value: offsetX },
      u_offsetY: { value: offsetY },
      u_scale: { value: scale },
      u_opacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_pixelSize.value.set(size.width, size.height);
      materialRef.current.uniforms.u_pixelRatio.value = gl.getPixelRatio();
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.u_resolution.value.set(
        viewport.width * 100,
        viewport.height * 100,
      );
      materialRef.current.uniforms.u_speed.value = speed;
      materialRef.current.uniforms.u_timeOffset.value = timeOffset;
      materialRef.current.uniforms.u_iterations.value = iterations;
      materialRef.current.uniforms.u_waveFrequency.value = waveFrequency;
      materialRef.current.uniforms.u_depthStep.value = depthStep;
      materialRef.current.uniforms.u_lineThickness.value = lineThickness;
      materialRef.current.uniforms.u_waveAmplitude.value = waveAmplitude;
      materialRef.current.uniforms.u_lineColor.value.set(lineColor);
      materialRef.current.uniforms.u_backgroundColor.value.set(backgroundColor);
      materialRef.current.uniforms.u_brightness.value = brightness;
      materialRef.current.uniforms.u_contrast.value = contrast;
      materialRef.current.uniforms.u_offsetX.value = offsetX;
      materialRef.current.uniforms.u_offsetY.value = offsetY;
      materialRef.current.uniforms.u_scale.value = scale;
      materialRef.current.uniforms.u_opacity.value = opacity;
    }
  });

  if (variant === "pixel-lift") {
    return (
      <points scale={[viewport.width, viewport.height, 1]} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={liftedVertexShader}
          fragmentShader={liftedFragmentShader}
          uniforms={uniforms}
        />
      </points>
    );
  }

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const LiquidLines: React.FC<LiquidLinesProps> = ({
  variant = "lines",
  width = "100%",
  height = "100%",
  className = "",
  speed = 0.4,
  timeOffset = 0,
  iterations = 3,
  waveFrequency = 49,
  depthStep = 0.05,
  lineThickness = 0.009,
  waveAmplitude = 0.6,
  lineColor = "#ffffff",
  lightBackground = "#ffffff",
  darkBackground = "#000000",
  brightness = 2.5,
  contrast = 1.1,
  offsetX = 0,
  offsetY = 0,
  scale = 0.3,
  opacity = 1,
}) => {
  const { resolvedTheme } = useTheme();

  const backgroundColor =
    resolvedTheme === "dark" ? darkBackground : lightBackground;

  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        width: widthStyle,
        height: heightStyle,
        maskImage: variant === "dots"
          ? "radial-gradient(circle at 1.5px 1.5px, #000 0.5px, transparent 0.5px)"
          : undefined,
        maskSize: variant === "dots" ? "4px 4px" : undefined,
        maskPosition: variant === "dots" ? "0 0" : undefined,
        maskRepeat: variant === "dots" ? "repeat" : undefined,
      }}
    >
      <Canvas
        className="absolute inset-0 h-full w-full"
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        <ShaderPlane
          variant={variant}
          speed={speed}
          timeOffset={timeOffset}
          iterations={iterations}
          waveFrequency={waveFrequency}
          depthStep={depthStep}
          lineThickness={lineThickness}
          waveAmplitude={waveAmplitude}
          lineColor={lineColor}
          backgroundColor={backgroundColor}
          brightness={brightness}
          contrast={contrast}
          offsetX={offsetX}
          offsetY={offsetY}
          scale={scale}
          opacity={opacity}
        />
      </Canvas>
    </div>
  );
};

LiquidLines.displayName = "LiquidLines";

export default LiquidLines;
