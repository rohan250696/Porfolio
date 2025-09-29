"use client";

import { useEffect, useRef } from "react";

export function GlowCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const positions: { x: number; y: number }[] = [];
    const maxTrail = 24;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMove(e: MouseEvent) {
      positions.push({ x: e.clientX, y: e.clientY });
      if (positions.length > maxTrail) positions.shift();
    }
    window.addEventListener("mousemove", onMove, { passive: true });

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const t = i / positions.length;
        const radius = 18 * t + 4;
        const alpha = 0.1 + t * 0.4;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grad.addColorStop(0, `rgba(0,247,255,${alpha})`);
        grad.addColorStop(1, `rgba(0,247,255,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100] mix-blend-screen"
      aria-hidden
    />
  );
}


