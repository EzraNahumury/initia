"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colorIdx: number;
  alpha: number;
  alphaSpeed: number;
  alphaDir: number;
}

const COLORS = [
  "159,41,255",   // purple
  "180,77,255",   // purple-light
  "99,102,241",   // indigo
  "139,92,246",   // violet
  "0,180,220",    // cyan accent (rare)
];

const PARTICLE_COUNT = 65;
const CONNECT_DIST = 110;

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Resize ──
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Init particles ──
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.4,
      colorIdx: Math.random() < 0.15 ? 4 : Math.floor(Math.random() * 4), // cyan rare
      alpha: Math.random() * 0.4 + 0.1,
      alphaSpeed: Math.random() * 0.004 + 0.001,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // A handful of slightly larger "star" particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 2.2,
        colorIdx: Math.floor(Math.random() * 2),
        alpha: Math.random() * 0.3 + 0.2,
        alphaSpeed: Math.random() * 0.006 + 0.002,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      // ── Update + draw dots ──
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -2) p.x = W + 2;
        else if (p.x > W + 2) p.x = -2;
        if (p.y < -2) p.y = H + 2;
        else if (p.y > H + 2) p.y = -2;

        // Pulse alpha
        p.alpha += p.alphaSpeed * p.alphaDir;
        if (p.alpha >= 0.75) { p.alpha = 0.75; p.alphaDir = -1; }
        else if (p.alpha <= 0.05) { p.alpha = 0.05; p.alphaDir = 1; }

        const c = COLORS[p.colorIdx];

        // Soft glow for larger stars
        if (p.size > 2) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grd.addColorStop(0, `rgba(${c},${p.alpha * 0.9})`);
          grd.addColorStop(1, `rgba(${c},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${p.alpha})`;
        ctx.fill();
      }

      // ── Draw connections ──
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const strength = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(159,41,255,${strength})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
