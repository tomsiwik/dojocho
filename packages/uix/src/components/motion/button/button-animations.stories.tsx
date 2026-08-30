import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./base";

const COLORS = [
  { angle: -90, curvature: 28, label: "Red", radius: 72, rotate: "none", shape: "circle", spins: 0, surface: "#e5484d", text: "#fff" },
  { angle: -45, curvature: -28, label: "Amber", radius: 72, rotate: "none", shape: "circle-outline", spins: 1, surface: "#ffb224", text: "#4e2009" },
  { angle: 0, curvature: 24, label: "Green", radius: 72, rotate: "none", shape: "square", spins: 1, surface: "#45a557", text: "#fff" },
  { angle: 90, curvature: -24, label: "Teal", radius: 72, rotate: "none", shape: "square-outline", spins: -1, surface: "#12a594", text: "#fff" },
  { angle: 135, curvature: 32, label: "Blue", radius: 72, rotate: "none", shape: "plus", spins: 1.5, surface: "#0072f5", text: "#fff" },
  { angle: 180, curvature: -32, label: "Purple", radius: 72, rotate: "auto", shape: "triangle", spins: 0, surface: "#8e4ec6", text: "#fff" },
] as const;

type ParticleShape =
  | "circle"
  | "circle-outline"
  | "cross"
  | "plus"
  | "square"
  | "square-outline"
  | "triangle"
  | "triangle-outline";

const PARTICLE_SHAPES: readonly ParticleShape[] = [
  "circle",
  "circle-outline",
  "square",
  "square-outline",
  "plus",
  "cross",
  "triangle",
  "triangle-outline",
];

const PARTICLE_RADIUS = 4;
const PARTICLE_POOL_SIZE = 16;
const COMPOSED_BURST_CAPACITY = 6;
type CompositionControls = {
  angleSpread: number;
  curvatureMax: number;
  curvatureMin: number;
  durationMax: number;
  durationMin: number;
  direction: number;
  particleCount: number;
  radiusMax: number;
  radiusMin: number;
};

type ParticleGeometry = {
  centerX: number;
  centerY: number;
  insetHalfHeight: number;
  insetHalfWidth: number;
};

type ParticleMotion = {
  angle: number;
  curvature: number;
  duration: number;
  radius: number;
  rotate: "auto" | "auto-reverse" | "none";
  shape: ParticleShape;
  spins: number;
};

function randomBetween(minimum: number, maximum: number) {
  const lower = Math.min(minimum, maximum);
  const upper = Math.max(minimum, maximum);
  return lower + Math.random() * (upper - lower);
}

function particlePath(
  geometry: ParticleGeometry,
  { angle, curvature, radius }: Pick<ParticleMotion, "angle" | "curvature" | "radius">,
) {
  const radians = angle * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const rectangleScale = Math.max(Math.abs(cosine), Math.abs(sine));
  const projectedX = geometry.insetHalfWidth * cosine / rectangleScale;
  const projectedY = geometry.insetHalfHeight * sine / rectangleScale;
  const projectedLength = Math.hypot(projectedX, projectedY);
  const outwardX = projectedLength === 0 ? 0 : projectedX / projectedLength;
  const outwardY = projectedLength === 0 ? 0 : projectedY / projectedLength;
  const startX = geometry.centerX + projectedX;
  const startY = geometry.centerY + projectedY;
  const endX = startX + outwardX * radius;
  const endY = startY + outwardY * radius;
  const midpointX = (startX + endX) / 2;
  const midpointY = (startY + endY) / 2;
  const controlX = midpointX - outwardY * curvature;
  const controlY = midpointY + outwardX * curvature;
  return curvature === 0
    ? `M ${startX} ${startY} L ${endX} ${endY}`
    : `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

function buttonStyle(surface: string, text: string): CSSProperties {
  return {
    "--primary": surface,
    "--primary-foreground": text,
    "--button-primary-hover":
      "color-mix(in oklch, var(--primary) 90%, white 10%)",
    "--button-primary-depth":
      "oklch(from var(--primary) calc(0.96 * pow(l, 1.25)) c h)",
  } as CSSProperties;
}

function CenterOutButton({
  angle,
  children,
  composed = false,
  composition,
  curvature,
  radius,
  rotate,
  shape,
  spins,
}: {
  angle: number;
  children: string;
  composed?: boolean;
  composition: CompositionControls;
  curvature: number;
  radius: number;
  rotate: "auto" | "auto-reverse" | "none";
  shape: ParticleShape;
  spins: number;
}) {
  const glyphPrefix = `particle-${useId().replaceAll(":", "")}`;
  const container = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const groups = useRef<Array<SVGGElement | null>>([]);
  const motionAnimations = useRef<Array<SVGAnimationElement | null>>([]);
  const scaleAnimations = useRef<Array<SVGAnimationElement | null>>([]);
  const spinAnimations = useRef<Array<SVGAnimationElement | null>>([]);
  const particleUses = useRef<Array<SVGUseElement | null>>([]);
  const activeSlots = useRef<boolean[]>([]);
  const generations = useRef<number[]>([]);
  const nextParticle = useRef(0);
  const nextSlot = useRef(0);
  const geometry = useRef<ParticleGeometry | null>(null);
  const path = useRef("M 0 0 L 0 0");
  const [viewport, setViewport] = useState({ height: 0, width: 0 });

  const calculatePath = useCallback(() => {
    const wrapperBounds = container.current?.getBoundingClientRect();
    const targetBounds = button.current?.parentElement?.getBoundingClientRect();
    if (!wrapperBounds || !targetBounds) return path.current;

    geometry.current = {
      centerX: targetBounds.left - wrapperBounds.left + targetBounds.width / 2,
      centerY: targetBounds.top - wrapperBounds.top + targetBounds.height / 2,
      insetHalfHeight: Math.max(0, targetBounds.height / 2 - PARTICLE_RADIUS),
      insetHalfWidth: Math.max(0, targetBounds.width / 2 - PARTICLE_RADIUS),
    };
    path.current = particlePath(geometry.current, { angle, curvature, radius });
    setViewport({ height: wrapperBounds.height, width: wrapperBounds.width });
    return path.current;
  }, [angle, curvature, radius]);

  useLayoutEffect(() => {
    calculatePath();
    const observer = new ResizeObserver(calculatePath);
    if (container.current) observer.observe(container.current);
    const target = button.current?.parentElement;
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, [calculatePath]);

  const emit = (particle: ParticleMotion) => {
    const emission = nextParticle.current++;
    const poolSize = composed
      ? Math.max(
          PARTICLE_POOL_SIZE,
          composition.particleCount * COMPOSED_BURST_CAPACITY,
        )
      : PARTICLE_POOL_SIZE;
    let slot: number | undefined;
    for (let offset = 0; offset < poolSize; offset += 1) {
      const candidate = (nextSlot.current + offset) % poolSize;
      if (activeSlots.current[candidate]) continue;
      slot = candidate;
      activeSlots.current[candidate] = true;
      nextSlot.current = (candidate + 1) % poolSize;
      break;
    }
    if (slot === undefined) return;
    const motionAnimation = motionAnimations.current[slot];
    const scaleAnimation = scaleAnimations.current[slot];
    const spinAnimation = spinAnimations.current[slot];
    const particleUse = particleUses.current[slot];
    const group = groups.current[slot];
    if (!motionAnimation || !scaleAnimation || !particleUse || !group) {
      activeSlots.current[slot] = false;
      return;
    }
    const generation = (generations.current[slot] ?? 0) + 1;
    generations.current[slot] = generation;
    particleUse.setAttribute("href", `#${glyphPrefix}-${particle.shape}`);
    motionAnimation.setAttribute("dur", `${particle.duration}ms`);
    motionAnimation.setAttribute("path", particlePath(geometry.current!, particle));
    motionAnimation.setAttribute("rotate", particle.rotate === "none" ? "0" : particle.rotate);
    scaleAnimation.setAttribute("dur", `${particle.duration}ms`);
    spinAnimation?.setAttribute("dur", `${particle.duration}ms`);
    spinAnimation?.setAttribute("to", String(particle.spins * 360));
    group.setAttribute("visibility", "visible");
    motionAnimation.addEventListener("endEvent", () => {
      if (generations.current[slot] === generation) {
        activeSlots.current[slot] = false;
        group.setAttribute("visibility", "hidden");
      }
    }, { once: true });
    motionAnimation.beginElement();
    scaleAnimation.beginElement();
    spinAnimation?.beginElement();
  };

  const animate = () => {
    if (!geometry.current) return;
    const initialShape = PARTICLE_SHAPES.indexOf(shape);
    if (!composed) {
      const emission = nextParticle.current;
      emit({
        angle,
        curvature,
        duration: 650,
        radius,
        rotate,
        shape: PARTICLE_SHAPES[(initialShape + emission) % PARTICLE_SHAPES.length],
        spins,
      });
      return;
    }

    const angleStep = composition.angleSpread / composition.particleCount;
    const angleStart = composition.direction - composition.angleSpread / 2;
    for (let index = 0; index < composition.particleCount; index += 1) {
      const emittedShape = PARTICLE_SHAPES[
        Math.floor(Math.random() * PARTICLE_SHAPES.length)
      ];
      emit({
        // Randomize within evenly distributed sectors. Every burst changes while
        // retaining coverage across the requested spread instead of clustering.
        angle: composition.angleSpread === 0
          ? composition.direction
          : angleStart + (index + Math.random()) * angleStep,
        curvature: randomBetween(composition.curvatureMin, composition.curvatureMax),
        duration: randomBetween(composition.durationMin, composition.durationMax),
        radius: randomBetween(composition.radiusMin, composition.radiusMax),
        rotate: emittedShape.startsWith("triangle") ? "auto" : "none",
        shape: emittedShape,
        spins: randomBetween(-1.5, 1.5),
      });
    }
  };

  return (
    <span
      className="relative isolate inline-flex"
      ref={container}
      style={{ color: "var(--primary)" }}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
        height={viewport.height}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        width={viewport.width}
      >
        <defs>
          <g id={`${glyphPrefix}-circle`}>
            <circle fill="currentColor" r="4" />
          </g>
          <g id={`${glyphPrefix}-circle-outline`}>
            <circle fill="none" r="3.25" stroke="currentColor" strokeWidth="1.5" />
          </g>
          <g id={`${glyphPrefix}-square`}>
            <rect fill="currentColor" height="8" width="8" x="-4" y="-4" />
          </g>
          <g id={`${glyphPrefix}-square-outline`}>
            <rect fill="none" height="6.5" stroke="currentColor" strokeWidth="1.5" width="6.5" x="-3.25" y="-3.25" />
          </g>
          <g id={`${glyphPrefix}-plus`}>
            <path d="M-4 0H4M0-4V4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
          <g id={`${glyphPrefix}-cross`}>
            <path d="M-3-3 3 3M3-3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
          <g id={`${glyphPrefix}-triangle`}>
            <path d="M0-4 4 3.5H-4Z" fill="currentColor" />
          </g>
          <g id={`${glyphPrefix}-triangle-outline`}>
            <path d="M0-3.25 3.25 2.75H-3.25Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </g>
        </defs>
        {Array.from({
          length: composed
            ? Math.max(
                PARTICLE_POOL_SIZE,
                composition.particleCount * COMPOSED_BURST_CAPACITY,
              )
            : PARTICLE_POOL_SIZE,
        }, (_, slot) => {
          const motionId = `${glyphPrefix}-motion-${slot}`;
          return (
          <g
            key={slot}
            ref={(node) => {
              groups.current[slot] = node;
            }}
            visibility="hidden"
          >
            <animateMotion
              begin="indefinite"
              calcMode="linear"
              dur="650ms"
              fill="freeze"
              id={motionId}
              path={path.current}
              ref={(node) => {
                motionAnimations.current[slot] = node as SVGAnimationElement | null;
              }}
              restart="always"
              rotate={rotate === "none" ? 0 : rotate}
            />
            <g>
              <animateTransform
                attributeName="transform"
                begin="indefinite"
                calcMode="linear"
                dur="650ms"
                fill="freeze"
                from="0"
                ref={(node) => {
                  spinAnimations.current[slot] = node as SVGAnimationElement | null;
                }}
                restart="always"
                to={String(spins * 360)}
                type="rotate"
              />
              <g>
                <use
                  href={`#${glyphPrefix}-${shape}`}
                  ref={(node) => {
                    particleUses.current[slot] = node;
                  }}
                />
                <animateTransform
                  attributeName="transform"
                  begin="indefinite"
                  calcMode="linear"
                  dur="650ms"
                  fill="freeze"
                  from="1"
                  ref={(node) => {
                    scaleAnimations.current[slot] = node as SVGAnimationElement | null;
                  }}
                  restart="always"
                  to="0.125"
                  type="scale"
                />
              </g>
            </g>
          </g>
          );
        })}
      </svg>
      <span className="relative z-10 inline-flex">
        <Button ref={button} ripple onClick={animate}>
          {children}
        </Button>
      </span>
    </span>
  );
}

const meta = {
  title: "Motion/Button Animations",
  args: {
    angleSpread: 56,
    curvatureMax: 18,
    curvatureMin: -18,
    durationMax: 440,
    durationMin: 260,
    direction: -90,
    particleCount: 8,
    radiusMax: 58,
    radiusMin: 40,
  },
  argTypes: {
    angleSpread: {
      control: { max: 360, min: 0, step: 5, type: "range" },
      description: "Symmetric angular coverage around the selected direction.",
    },
    curvatureMax: { control: { max: 64, min: 0, step: 2, type: "range" } },
    curvatureMin: { control: { max: 0, min: -64, step: 2, type: "range" } },
    durationMax: { control: { max: 1000, min: 160, step: 20, type: "range" } },
    durationMin: { control: { max: 800, min: 80, step: 20, type: "range" } },
    direction: {
      control: { max: 180, min: -180, step: 5, type: "range" },
      description: "Central direction of the composed burst in degrees.",
    },
    particleCount: {
      control: { max: 32, min: 1, step: 1, type: "range" },
      description: "Particles emitted by each composed click.",
    },
    radiusMax: { control: { max: 120, min: 24, step: 4, type: "range" } },
    radiusMin: { control: { max: 96, min: 8, step: 4, type: "range" } },
  },
  parameters: { layout: "centered" },
} satisfies Meta<CompositionControls>;

export default meta;

type Story = StoryObj<CompositionControls>;

export const ColoredButtons: Story = {
  render: (composition) => (
    <main className="bg-background p-16 text-foreground">
      <div className="grid gap-12">
        {[
          { id: "single", title: "Single animation" },
          { id: "composed", title: "Composed animation" },
        ].map(({ id, title }) => (
          <section className="grid gap-4" key={id}>
            <h2 className="text-sm font-medium">{title}</h2>
            <div className="flex items-center gap-10">
              {COLORS.map(({ angle, curvature, label, radius, rotate, shape, spins, surface, text }) => (
                <div key={label} style={buttonStyle(surface, text)}>
                  <CenterOutButton angle={angle} composed={id === "composed"} composition={composition} curvature={curvature} radius={radius} rotate={rotate} shape={shape} spins={spins}>{label}</CenterOutButton>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  ),
};
