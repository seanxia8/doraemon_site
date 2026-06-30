'use client';

import { useEffect, useRef } from 'react';

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reducedMotion: boolean,
) => void;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function AnimatedCanvas({
  className = '',
  draw,
}: {
  className?: string;
  draw: DrawFn;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let reduced = prefersReducedMotion();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      reduced = media.matches;
    };

    media.addEventListener('change', onMotionChange);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, time / 1000, reduced);
      if (!reduced) {
        frameRef.current = requestAnimationFrame(render);
      }
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      media.removeEventListener('change', onMotionChange);
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [draw]);

  return <canvas aria-hidden="true" className={className} ref={canvasRef} />;
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i += 1) {
    const y = (height / 17) * i;
    const phase = reduced ? 0 : time * 0.75;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 6) {
      const a = Math.sin(x * 0.025 + i * 0.72 + phase) * 10;
      const b = Math.cos(x * 0.015 - i * 0.55 - phase * 0.8) * 7;
      const pointY = y + a + b;
      if (x === 0) ctx.moveTo(x, pointY);
      else ctx.lineTo(x, pointY);
    }
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(140,21,21,.13)' : 'rgba(0,124,146,.11)';
    ctx.stroke();
  }
}

function drawVoronoi(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, width, height);
  const points = Array.from({ length: 24 }, (_, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const drift = reduced ? 0 : Math.sin(time * 0.5 + i) * 6;
    return {
      x: (col + 0.5) * (width / 6) + drift,
      y: (row + 0.55) * (height / 4) + Math.cos(time * 0.4 + i * 1.7) * 5,
    };
  });

  ctx.lineWidth = 1;
  points.forEach((point, i) => {
    for (let j = i + 1; j < points.length; j += 1) {
      const other = points[j];
      const dx = point.x - other.x;
      const dy = point.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 145) {
        ctx.strokeStyle = `rgba(0, 124, 146, ${0.1 - dist / 2200})`;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  points.forEach((point, i) => {
    ctx.fillStyle = i % 5 === 0 ? 'rgba(140,21,21,.22)' : 'rgba(23,94,84,.18)';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawForce(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, width, height);
  const labels = ['validity', 'IRT', 'rubrics', 'sampling', 'DIF', 'bias', 'theta', 'SEM', 'CAT', 'Rasch', 'equating'];
  const nodes = labels.map((label, i) => {
    const angle = (i / labels.length) * Math.PI * 2 + (reduced ? 0 : time * 0.12);
    const radius = Math.min(width, height) * (0.23 + (i % 3) * 0.055);
    return {
      label,
      x: width * 0.5 + Math.cos(angle) * radius + Math.sin(time + i) * 8,
      y: height * 0.48 + Math.sin(angle * 1.13) * radius * 0.72,
    };
  });

  ctx.lineWidth = 0.8;
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    const b = nodes[(i * 3 + 4) % nodes.length];
    ctx.strokeStyle = 'rgba(46,45,41,.10)';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  nodes.forEach((node, i) => {
    ctx.fillStyle = i % 3 === 0 ? 'rgba(140,21,21,.25)' : i % 3 === 1 ? 'rgba(0,124,146,.24)' : 'rgba(23,94,84,.22)';
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '9px "Roboto Mono", ui-monospace, monospace';
    ctx.fillStyle = 'rgba(83,86,90,.35)';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x, node.y + 14);
  });
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, width, height);
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const r = size * 0.36;
  const spin = reduced ? 0.7 : time * 0.25 + 0.7;

  const gradient = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 4, cx, cy, r * 1.1);
  gradient.addColorStop(0, 'rgba(255,255,255,.95)');
  gradient.addColorStop(1, 'rgba(0,124,146,.09)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,124,146,.20)';
  ctx.lineWidth = 1;
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = cy + Math.sin((lat * Math.PI) / 180) * r;
    const w = Math.cos((lat * Math.PI) / 180) * r;
    ctx.beginPath();
    ctx.ellipse(cx, y, w, r * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let lon = 0; lon < 180; lon += 30) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * Math.abs(Math.cos(spin + lon)), r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const markerAngle = spin + 2.1;
  const markerX = cx + Math.cos(markerAngle) * r * 0.62;
  const markerY = cy - r * 0.18 + Math.sin(markerAngle) * r * 0.2;
  ctx.fillStyle = 'rgba(140,21,21,.82)';
  ctx.beginPath();
  ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function WaveInterferenceBackground() {
  return <AnimatedCanvas className="visual-canvas" draw={drawWaves} />;
}

export function VoronoiTessellationBackground() {
  return <AnimatedCanvas className="visual-canvas" draw={drawVoronoi} />;
}

export function ForceGraphBackground() {
  return <AnimatedCanvas className="visual-canvas" draw={drawForce} />;
}

export function CobeGlobe({ className = '' }: { className?: string }) {
  return <AnimatedCanvas className={`globe-canvas ${className}`.trim()} draw={drawGlobe} />;
}
