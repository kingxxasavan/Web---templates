"use client";

import { useEffect, useRef } from "react";

/**
 * The Helix double helix, drawn on a 2D canvas: two strands of glowing
 * particles joined by faint rungs, turning slowly in perspective. It borrows
 * the look of the Helix template's WebGL hero without shipping three.js to
 * every visitor of the store.
 *
 * Stops drawing while off screen, and holds a still frame for anyone who
 * prefers reduced motion.
 */
const VIOLET = [124, 92, 255];
const CYAN = [34, 211, 238];
const EMBER = [255, 138, 92];

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export default function HelixField({ className = "", density = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TURNS = 3.2;
    const COUNT = Math.round(150 * density);

    // Fixed per-particle jitter, so the strands shimmer rather than flicker.
    const seeds = Array.from({ length: COUNT * 2 }, () => Math.random() * 100);
    const dust = Array.from({ length: Math.round(70 * density) }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.2,
      s: Math.random() * 100,
      c: Math.random() > 0.85 ? EMBER : Math.random() > 0.5 ? CYAN : VIOLET,
    }));

    // One soft glow sprite per colour, drawn once and stamped every frame,
    // which is far cheaper than a gradient per particle per frame.
    const sprites = new Map();
    function sprite(color) {
      const key = color.join(",");
      if (!sprites.has(key)) {
        const c = document.createElement("canvas");
        c.width = c.height = 32;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, `rgba(${key},1)`);
        grad.addColorStop(0.35, `rgba(${key},0.45)`);
        grad.addColorStop(1, `rgba(${key},0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, 32, 32);
        sprites.set(key, c);
      }
      return sprites.get(key);
    }
    const colors = Array.from({ length: COUNT }, (_, i) => {
      const p = i / (COUNT - 1);
      return [mix(VIOLET, CYAN, p), mix(CYAN, p > 0.6 ? EMBER : VIOLET, p)].map(sprite);
    });

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time) {
      const t = time / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const d of dust) {
        const a = 0.15 + 0.25 * (Math.sin(t * 0.8 + d.s) * 0.5 + 0.5);
        ctx.fillStyle = `rgba(${d.c.join(",")},${a})`;
        ctx.beginPath();
        ctx.arc(d.x * width, ((d.y + t * 0.004) % 1) * height, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // The helix runs corner to corner, tilted, so it reads as a form.
      const cx = width * 0.5;
      const cy = height * 0.5;
      const length = Math.hypot(width, height) * 0.95;
      const radius = Math.min(width, height) * 0.2;
      const tilt = -0.62;
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);
      const spin = t * 0.35;

      const points = [];
      for (let i = 0; i < COUNT; i++) {
        const p = i / (COUNT - 1);
        const along = (p - 0.5) * length;
        const angle = p * Math.PI * 2 * TURNS + spin;
        const r = radius * (0.8 + 0.2 * Math.cos(p * Math.PI * 2));
        for (const strand of [0, 1]) {
          const a = angle + strand * Math.PI;
          const seed = seeds[i * 2 + strand];
          const across = Math.cos(a) * r + Math.sin(t * 0.6 + seed) * 1.5;
          const depth = Math.sin(a); // -1 back … 1 front
          const x = cx + along * cos - across * sin;
          const y = cy + along * sin + across * cos;
          points.push({ x, y, depth, seed, glow: colors[i][strand], color: strand ? CYAN : VIOLET });
        }
      }

      // Rungs first, so the particles sit on top of them.
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i += 10) {
        const a = points[i];
        const b = points[i + 1];
        ctx.strokeStyle = `rgba(${a.color.join(",")},${0.08 + 0.1 * (a.depth + 1) / 2})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const pt of points) {
        const front = (pt.depth + 1) / 2;
        const pulse = Math.sin(t * 1.4 + pt.seed) * 0.5 + 0.5;
        const size = 1.1 + front * 2.4 + pulse * 0.6;
        ctx.globalAlpha = (0.25 + 0.75 * front) * (0.55 + 0.45 * pulse);
        const d = size * 6.4;
        ctx.drawImage(pt.glow, pt.x - d / 2, pt.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function loop(time) {
      if (visible) draw(time);
      frame = requestAnimationFrame(loop);
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw(4000);
    });
    observer.observe(canvas);
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    onScreen.observe(canvas);

    if (reduced) draw(4000);
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      onScreen.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
