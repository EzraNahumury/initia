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

interface ParticleBackgroundProps {
  global?: boolean;
}

const COLORS = [
  "159,41,255", // purple
  "180,77,255", // purple-light
  "99,102,241", // indigo
  "139,92,246", // violet
  "0,180,220", // cyan accent
];

const PARTICLE_COUNT = 65;
const CONNECT_DIST = 110;

export function ParticleBackground({ global: isGlobal = false }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const particleCount = isGlobal ? 130 : PARTICLE_COUNT;
  const connectDist = isGlobal ? 150 : CONNECT_DIST;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = isGlobal ? window.innerWidth : canvas.offsetWidth;
      canvas.height = isGlobal ? window.innerHeight : canvas.offsetHeight;
    };

    resize();

    if (isGlobal) {
      window.addEventListener("resize", resize);
    }

    const ro = !isGlobal ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.4,
      colorIdx: Math.random() < 0.15 ? 4 : Math.floor(Math.random() * 4),
      alpha: Math.random() * 0.4 + 0.1,
      alphaSpeed: Math.random() * 0.004 + 0.001,
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const glowParticleCount = isGlobal ? 16 : 8;
    for (let i = 0; i < glowParticleCount; i++) {
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

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -2) p.x = W + 2;
        else if (p.x > W + 2) p.x = -2;

        if (p.y < -2) p.y = H + 2;
        else if (p.y > H + 2) p.y = -2;

        p.alpha += p.alphaSpeed * p.alphaDir;
        if (p.alpha >= 0.75) {
          p.alpha = 0.75;
          p.alphaDir = -1;
        } else if (p.alpha <= 0.05) {
          p.alpha = 0.05;
          p.alphaDir = 1;
        }

        const c = COLORS[p.colorIdx];

        if (p.size > 2) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grd.addColorStop(0, `rgba(${c},${p.alpha * 0.9})`);
          grd.addColorStop(1, `rgba(${c},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectDist) {
            const strength = (1 - dist / connectDist) * (isGlobal ? 0.13 : 0.18);
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
      ro?.disconnect();

      if (isGlobal) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [connectDist, isGlobal, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={
        isGlobal
          ? "fixed inset-0 z-0 h-screen w-screen pointer-events-none"
          : "absolute inset-0 w-full h-full pointer-events-none"
      }
      aria-hidden="true"
    />
  );
}
