"use client";

import { useEffect, useRef } from "react";
import { createRenderer } from "./renderer";

// Adapted from vGPU's MIT-licensed FFT Ocean example.
export function FftOcean() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !("gpu" in navigator)) return;
    const renderer = createRenderer({ canvas });
    void renderer.ready;
    return () => renderer.dispose();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[color-mix(in_srgb,var(--surface-1)_40%,black)]">
      <canvas
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full touch-none"
        ref={canvasRef}
      />
    </div>
  );
}

export default FftOcean;
