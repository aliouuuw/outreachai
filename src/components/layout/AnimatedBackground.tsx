"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const c = ctx;

    let W: number, H: number;
    const initSize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    initSize();

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    class Particle {
      x = Math.random() * W;
      y = Math.random() * H;
      size = Math.random() * 1.5 + 0.3;
      speedX = (Math.random() - 0.5) * 0.3;
      speedY = (Math.random() - 0.5) * 0.3;
      opacity = Math.random() * 0.5 + 0.1;
      pulse = Math.random() * Math.PI * 2;

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.015;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }

      draw() {
        const a = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(99,102,241,${a})`;
        c.fill();
      }
    }

    const particles = Array.from({ length: 120 }, () => new Particle());

    const drawGrid = () => {
      const spacing = 80;
      c.strokeStyle = "rgba(99,102,241,0.035)";
      c.lineWidth = 1;
      for (let x = 0; x < W; x += spacing) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, H);
        c.stroke();
      }
      for (let y = 0; y < H; y += spacing) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(W, y);
        c.stroke();
      }
    };

    const drawConnections = () => {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            c.beginPath();
            c.moveTo(particles[i].x, particles[i].y);
            c.lineTo(particles[j].x, particles[j].y);
            c.strokeStyle = `rgba(99,102,241,${(1 - d / maxDist) * 0.12})`;
            c.lineWidth = 0.6;
            c.stroke();
          }
        }
      }
    };

    let animId: number;
    const animate = () => {
      c.clearRect(0, 0, W, H);
      drawGrid();
      drawConnections();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
