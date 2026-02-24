'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    // CUSTOM CURSOR
    const cursor = document.getElementById('cursor')!;
    const cursorGlow = document.getElementById('cursor-glow')!;
    let mx = 0, my = 0;
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    };
    document.addEventListener('mousemove', onMouseMove);

    function animateCursor() {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      cursorGlow.style.left = gx + 'px';
      cursorGlow.style.top = gy + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // ANIMATED PARTICLE GRID CANVAS
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    let W: number, H: number;
    const particles: any[] = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      x = 0; y = 0; size = 0; speedX = 0; speedY = 0; opacity = 0; pulse = 0;
      constructor() { this.reset(); }
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
        const alpha = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function drawGrid() {
      const spacing = 80;
      ctx.strokeStyle = 'rgba(99,102,241,0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    function drawConnections() {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    let animId: number;
    function animateBg() {
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animateBg);
    }
    animateBg();

    // NAVBAR SCROLL
    const navbar = document.getElementById('navbar')!;
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll);

    // MOCKUP TAB SWITCHING
    function switchMockTab(tab: string) {
      const emailPanel = document.getElementById('mock-panel-email')!;
      const leadsPanel = document.getElementById('mock-panel-leads')!;
      const allNavItems = document.querySelectorAll('.mock-nav-item');

      if (tab === 'leads') {
        emailPanel.style.display = 'none';
        leadsPanel.style.display = 'flex';
        leadsPanel.style.opacity = '0';
        leadsPanel.style.transform = 'translateY(8px)';
        leadsPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
          leadsPanel.style.opacity = '1';
          leadsPanel.style.transform = 'translateY(0)';
        }, 20);
        allNavItems.forEach(el => el.classList.remove('active'));
        document.getElementById('mock-lead-finder-tab')!.classList.add('active');
      } else {
        leadsPanel.style.display = 'none';
        emailPanel.style.display = 'flex';
        emailPanel.style.opacity = '0';
        emailPanel.style.transform = 'translateY(8px)';
        emailPanel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
          emailPanel.style.opacity = '1';
          emailPanel.style.transform = 'translateY(0)';
        }, 20);
        allNavItems.forEach(el => el.classList.remove('active'));
        allNavItems[0].classList.add('active');
      }
    }
    (window as any).switchMockTab = switchMockTab;

    document.querySelectorAll('.mock-nav-item').forEach((el) => {
      if (el.id !== 'mock-lead-finder-tab') {
        (el as HTMLElement).style.cursor = 'pointer';
        el.addEventListener('click', () => switchMockTab('email'));
      }
    });

    // SCROLL FADE-UP
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // TYPEWRITER
    const phrases = [
      'Without the Grind.',
      'On Autopilot.',
      'With AI.',
      'In Half the Time.',
    ];
    const tw = document.getElementById('typewriter')!;
    let pIdx = 0, cIdx = 0, deleting = false;

    function typeLoop() {
      const current = phrases[pIdx];
      if (!deleting) {
        tw.textContent = current.slice(0, cIdx + 1);
        cIdx++;
        if (cIdx === current.length) {
          deleting = true;
          setTimeout(typeLoop, 2000);
          return;
        }
        setTimeout(typeLoop, 70);
      } else {
        tw.textContent = current.slice(0, cIdx - 1);
        cIdx--;
        if (cIdx === 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
        }
        setTimeout(typeLoop, 40);
      }
    }
    setTimeout(typeLoop, 1200);

    // ANIMATED COUNTER
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target.querySelector('[data-target]') as HTMLElement;
          if (!el) return;
          const target = parseInt(el.dataset.target!);
          const duration = 1800;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            const display = target >= 1000000
              ? (current / 1000000).toFixed(1) + 'M+'
              : target >= 1000
              ? (current / 1000).toFixed(0) + 'K+'
              : Math.round(current) + (target < 101 ? '%' : '');
            el.textContent = display;
            if (current >= target) clearInterval(timer);
          }, 16);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stats-grid > .fade-up').forEach(el => counterObserver.observe(el));

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #060910; --bg2: #0b0f1a; --bg3: #0f1520;
          --border: #1a2235; --accent: #6366f1; --accent2: #8b5cf6;
          --text: #f0f2f8; --muted: #5a6480; --muted2: #8892aa;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; font-weight: 300; line-height: 1.6; overflow-x: hidden; cursor: none; }
        h1, h2, h3, .nav-logo, .footer-logo, .pricing-price { font-family: 'Syne', sans-serif; font-weight: 800; }
        #cursor { position: fixed; top: 0; left: 0; width: 12px; height: 12px; background: #6366f1; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease, opacity 0.2s ease; mix-blend-mode: screen; }
        #cursor-glow { position: fixed; top: 0; left: 0; width: 320px; height: 320px; background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%, -50%); transition: transform 0.08s linear; }
        body:has(a:hover) #cursor, body:has(button:hover) #cursor { width: 24px; height: 24px; background: rgba(99,102,241,0.6); }
        #bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
        .fade-up { opacity: 0; transform: translateY(36px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-up[data-delay="1"] { transition-delay: 0.1s; }
        .fade-up[data-delay="2"] { transition-delay: 0.2s; }
        .fade-up[data-delay="3"] { transition-delay: 0.3s; }
        .fade-up[data-delay="4"] { transition-delay: 0.4s; }
        .fade-up[data-delay="5"] { transition-delay: 0.5s; }
        .fade-up[data-delay="6"] { transition-delay: 0.6s; }
        .hero-animate { opacity: 0; transform: translateY(28px); animation: heroIn 0.8s cubic-bezier(.22,.68,0,1) forwards; }
        .hero-animate:nth-child(1) { animation-delay: 0.2s; }
        .hero-animate:nth-child(2) { animation-delay: 0.4s; }
        .hero-animate:nth-child(3) { animation-delay: 0.6s; }
        .hero-animate:nth-child(4) { animation-delay: 0.75s; }
        .hero-animate:nth-child(5) { animation-delay: 0.9s; }
        @keyframes heroIn { to { opacity: 1; transform: translateY(0); } }
        nav { position: fixed; top: 0; width: 100%; z-index: 500; padding: 1.25rem 2.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid transparent; transition: all 0.3s ease; backdrop-filter: blur(20px); background: rgba(6, 9, 16, 0.7); }
        nav.scrolled { border-bottom: 1px solid var(--border); }
        .nav-logo { font-size: 1.3rem; letter-spacing: -0.02em; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { color: var(--muted2); text-decoration: none; font-size: 0.875rem; font-weight: 400; transition: color 0.2s; }
        .nav-links a:hover { color: var(--text); }
        .nav-cta { background: var(--accent); color: white !important; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 500 !important; transition: background 0.2s, transform 0.15s !important; }
        .nav-cta:hover { background: var(--accent2) !important; transform: translateY(-1px); }
        .hero { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 9rem 2rem 4rem; overflow: hidden; }
        .hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); }
        .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.28); color: #a78bfa; padding: 0.4rem 1.1rem; border-radius: 100px; font-size: 0.78rem; font-weight: 500; margin-bottom: 2.25rem; letter-spacing: 0.03em; }
        .badge-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
        .hero h1 { font-size: clamp(3rem, 7vw, 6rem); letter-spacing: -0.04em; line-height: 1.02; max-width: 880px; margin-bottom: 0.5rem; }
        .hero h1 .line2 { display: block; background: linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #e879f9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .typewriter-wrap { display: inline-block; min-width: 320px; }
        #typewriter { border-right: 3px solid #a78bfa; padding-right: 4px; }
        .hero p { font-size: 1.15rem; font-weight: 300; color: var(--muted2); max-width: 520px; margin: 1.5rem auto 2.75rem; line-height: 1.75; }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 1rem 2.25rem; border-radius: 12px; font-size: 1rem; font-weight: 600; text-decoration: none; transition: transform 0.25s, box-shadow 0.25s; box-shadow: 0 0 0 1px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2); }
        .btn-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 0 0 1px rgba(99,102,241,0.7), 0 0 60px rgba(99,102,241,0.7), 0 0 120px rgba(99,102,241,0.35); }
        .btn-secondary { background: transparent; color: var(--muted2); padding: 1rem 2.25rem; border-radius: 12px; font-size: 1rem; font-weight: 400; text-decoration: none; border: 1px solid var(--border); transition: all 0.2s; }
        .btn-secondary:hover { border-color: rgba(99,102,241,0.5); color: var(--text); background: rgba(99,102,241,0.04); }
        .hero-meta { margin-top: 3.25rem; color: var(--muted); font-size: 0.82rem; font-weight: 400; display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap; justify-content: center; }
        .hero-meta span { display: flex; align-items: center; gap: 0.4rem; }
        .hero-meta .check { color: #6366f1; }
        .mockup-wrap { position: relative; z-index: 1; width: 100%; max-width: 900px; margin: 5rem auto 0; padding: 0 2rem; }
        .mockup-outer { border-radius: 20px; padding: 3px; background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.3), rgba(99,102,241,0.1)); box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 40px 100px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.12); animation: floatMockup 6s ease-in-out infinite; }
        @keyframes floatMockup { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .mockup-inner { background: var(--bg2); border-radius: 18px; overflow: hidden; }
        .mockup-bar { background: var(--bg3); padding: 0.75rem 1.25rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); }
        .mockup-dots { display: flex; gap: 6px; }
        .mockup-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-dots span:nth-child(1) { background: #ff5f57; }
        .mockup-dots span:nth-child(2) { background: #febc2e; }
        .mockup-dots span:nth-child(3) { background: #28c840; }
        .mockup-url { flex: 1; background: var(--bg); border-radius: 6px; padding: 0.3rem 0.9rem; font-size: 0.75rem; color: var(--muted); font-weight: 400; border: 1px solid var(--border); }
        .mockup-content { padding: 1.75rem; display: grid; grid-template-columns: 200px 1fr; gap: 1.25rem; min-height: 380px; }
        .mock-sidebar { display: flex; flex-direction: column; gap: 0.5rem; }
        .mock-nav-item { padding: 0.6rem 0.9rem; border-radius: 8px; font-size: 0.78rem; font-weight: 400; color: var(--muted2); display: flex; align-items: center; gap: 0.6rem; cursor: default; }
        .mock-nav-item.active { background: rgba(99,102,241,0.12); color: #a78bfa; border: 1px solid rgba(99,102,241,0.2); }
        .mock-main { display: flex; flex-direction: column; gap: 1rem; }
        .mock-header { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
        .mock-email-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 1.1rem 1.25rem; }
        .mock-email-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); font-weight: 600; margin-bottom: 0.5rem; }
        .mock-email-subject { font-size: 0.82rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
        .mock-email-body { font-size: 0.75rem; color: var(--muted2); font-weight: 300; line-height: 1.6; }
        .mock-email-body .highlight { color: #a78bfa; font-weight: 500; }
        .mock-actions { display: flex; gap: 0.6rem; margin-top: 0.85rem; }
        .mock-btn { padding: 0.35rem 0.9rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; cursor: default; }
        .mock-btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
        .mock-btn-outline { background: transparent; color: var(--muted2); border: 1px solid var(--border); }
        .mock-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .mock-stat { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; text-align: center; }
        .mock-stat-num { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .mock-stat-label { font-size: 0.65rem; color: var(--muted); font-weight: 400; text-transform: uppercase; letter-spacing: 0.08em; }
        .mock-typing::after { content: '|'; animation: blink 1s infinite; color: #a78bfa; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .logos { position: relative; z-index: 1; padding: 5rem 2rem; text-align: center; border-bottom: 1px solid var(--border); }
        .logos p { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 2.75rem; }
        .logo-grid { display: flex; align-items: center; justify-content: center; gap: 3.5rem; flex-wrap: wrap; opacity: 0.3; }
        .logo-item { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: var(--muted2); }
        section { position: relative; z-index: 1; }
        .section-label { text-align: center; color: var(--accent); font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 1rem; }
        .section-title { text-align: center; font-size: clamp(2rem, 4.5vw, 3.25rem); letter-spacing: -0.035em; margin-bottom: 1rem; line-height: 1.12; }
        .section-sub { text-align: center; color: var(--muted2); font-size: 1.05rem; font-weight: 300; max-width: 480px; margin: 0 auto 5rem; line-height: 1.7; }
        .features { padding: 8rem 2rem; max-width: 1100px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .feature-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 18px; padding: 2.25rem; transition: border-color 0.3s, transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s; position: relative; overflow: hidden; cursor: default; }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent); opacity: 0; transition: opacity 0.3s; }
        .feature-card:hover { border-color: rgba(99,102,241,0.35); transform: translateY(-8px) scale(1.015); box-shadow: 0 24px 70px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon { width: 52px; height: 52px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 1.5rem; }
        .feature-card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.6rem; letter-spacing: -0.01em; }
        .feature-card p { color: var(--muted2); font-size: 0.92rem; font-weight: 300; line-height: 1.65; }
        .stats-strip { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--bg2); padding: 4rem 2rem; }
        .stats-grid { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem; text-align: center; }
        .stat-num { font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800; letter-spacing: -0.04em; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
        .stat-label { color: var(--muted2); font-size: 0.88rem; font-weight: 300; margin-top: 0.4rem; }
        .how { padding: 8rem 2rem; background: var(--bg2); border-bottom: 1px solid var(--border); }
        .how-inner { max-width: 900px; margin: 0 auto; }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2.5rem; margin-top: 5rem; }
        .step { text-align: center; padding: 2rem; border-radius: 18px; border: 1px solid transparent; transition: border-color 0.3s, transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s; cursor: default; }
        .step:hover { border-color: rgba(99,102,241,0.25); transform: translateY(-6px) scale(1.025); box-shadow: 0 20px 56px rgba(0,0,0,0.4); }
        .step-num { width: 58px; height: 58px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; margin: 0 auto 1.5rem; box-shadow: 0 0 28px rgba(99,102,241,0.5); }
        .step h3 { font-size: 1.05rem; margin-bottom: 0.6rem; }
        .step p { color: var(--muted2); font-size: 0.9rem; font-weight: 300; line-height: 1.65; }
        .pricing { padding: 8rem 2rem; max-width: 1050px; margin: 0 auto; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 1.5rem; margin-top: 5rem; }
        .pricing-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 22px; padding: 2.75rem 2.25rem; position: relative; transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s; cursor: default; }
        .pricing-card:hover { transform: translateY(-8px) scale(1.015); box-shadow: 0 28px 70px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08); }
        .pricing-card.featured { border-color: rgba(99,102,241,0.45); background: linear-gradient(145deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05)); }
        .pricing-card.featured:hover { box-shadow: 0 28px 70px rgba(0,0,0,0.5), 0 0 50px rgba(99,102,241,0.18); }
        .pricing-card.featured::before { content: 'Most Popular'; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 0.72rem; font-weight: 600; padding: 0.28rem 1rem; border-radius: 100px; white-space: nowrap; letter-spacing: 0.04em; }
        .pricing-name { font-size: 0.78rem; font-weight: 600; color: var(--muted2); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.85rem; }
        .pricing-price { font-size: 3.25rem; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.3rem; }
        .pricing-price span { font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 300; color: var(--muted); }
        .pricing-desc { color: var(--muted2); font-size: 0.88rem; font-weight: 300; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); line-height: 1.6; }
        .pricing-features { list-style: none; margin-bottom: 2.25rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .pricing-features li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.88rem; font-weight: 300; color: var(--muted2); }
        .pricing-features li::before { content: '✓'; color: #6366f1; font-weight: 700; flex-shrink: 0; }
        .btn-plan { display: block; text-align: center; padding: 0.9rem; border-radius: 11px; font-weight: 600; font-size: 0.92rem; text-decoration: none; transition: all 0.2s; }
        .btn-plan-outline { border: 1px solid var(--border); color: var(--muted2); }
        .btn-plan-outline:hover { border-color: rgba(99,102,241,0.5); color: var(--text); background: rgba(99,102,241,0.04); }
        .btn-plan-filled { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; box-shadow: 0 0 24px rgba(99,102,241,0.35); }
        .btn-plan-filled:hover { box-shadow: 0 0 40px rgba(99,102,241,0.6); transform: translateY(-2px); }
        .testimonials { padding: 8rem 2rem; background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .testimonials-inner { max-width: 1100px; margin: 0 auto; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 5rem; }
        .testimonial-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 18px; padding: 2.25rem; transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s, border-color 0.3s; cursor: default; }
        .testimonial-card:hover { transform: translateY(-6px) scale(1.015); box-shadow: 0 20px 56px rgba(0,0,0,0.45); border-color: rgba(99,102,241,0.22); }
        .stars { color: #f59e0b; font-size: 0.88rem; margin-bottom: 1.1rem; letter-spacing: 0.1em; }
        .testimonial-card p { color: var(--muted2); font-size: 0.93rem; font-weight: 300; line-height: 1.75; margin-bottom: 1.75rem; }
        .testimonial-author { display: flex; align-items: center; gap: 0.85rem; }
        .avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
        .author-info strong { display: block; font-size: 0.88rem; font-weight: 600; }
        .author-info span { font-size: 0.78rem; font-weight: 300; color: var(--muted); }
        .cta { padding: 10rem 2rem; text-align: center; position: relative; overflow: hidden; }
        .cta::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 68%); pointer-events: none; }
        .cta h2 { font-size: clamp(2.5rem, 6vw, 4.5rem); letter-spacing: -0.04em; line-height: 1.08; margin-bottom: 1.5rem; }
        .cta h2 span { background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cta p { color: var(--muted2); font-size: 1.05rem; font-weight: 300; margin-bottom: 2.75rem; }
        footer { padding: 3.5rem 2.5rem; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; max-width: 1100px; margin: 0 auto; }
        .footer-logo { font-size: 1.15rem; letter-spacing: -0.02em; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-links { display: flex; gap: 2rem; list-style: none; flex-wrap: wrap; }
        .footer-links a { color: var(--muted); text-decoration: none; font-size: 0.82rem; font-weight: 400; transition: color 0.2s; }
        .footer-links a:hover { color: var(--muted2); }
        .footer-copy { color: var(--muted); font-size: 0.78rem; font-weight: 300; }
        @media (max-width: 768px) { .mockup-content { grid-template-columns: 1fr; } .mock-sidebar { display: none; } }
        @media (max-width: 640px) { .nav-links { display: none; } .hero-actions { flex-direction: column; align-items: center; } footer { flex-direction: column; text-align: center; } .footer-links { justify-content: center; } body { cursor: auto; } #cursor, #cursor-glow { display: none; } }
      `}</style>

      <div id="cursor"></div>
      <div id="cursor-glow"></div>
      <canvas id="bg-canvas"></canvas>

      <nav id="navbar">
        <div className="nav-logo">OutreachAI</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#" className="nav-cta">Get Started</a></li>
        </ul>
      </nav>

      <section className="hero">
        <div className="badge hero-animate">
          <span className="badge-dot"></span>
          AI-Powered Outreach for Agencies &amp; Freelancers
        </div>
        <h1 className="hero-animate">
          Close More Clients.<br />
          <span className="line2"><span className="typewriter-wrap"><span id="typewriter"></span></span></span>
        </h1>
        <p className="hero-animate">OutreachAI writes hyper-personalized cold emails, DMs, and follow-up sequences so you can focus on delivering — not prospecting.</p>
        <div className="hero-actions hero-animate">
          <a href="#" className="btn-primary">Start for Free →</a>
          <a href="#how" className="btn-secondary">See How It Works</a>
        </div>
        <div className="hero-meta hero-animate">
          <span><span className="check">✓</span> No credit card required</span>
          <span><span className="check">✓</span> Setup in 2 minutes</span>
          <span><span className="check">✓</span> Cancel anytime</span>
        </div>
      </section>

      <div className="mockup-wrap fade-up">
        <div className="mockup-outer">
          <div className="mockup-inner">
            <div className="mockup-bar">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="mockup-url">app.outreachai.co/generate</div>
            </div>
            <div className="mockup-content">
              <div className="mock-sidebar">
                <div className="mock-nav-item active">✉️ &nbsp;Email Generator</div>
                <div className="mock-nav-item">🔁 &nbsp;Sequences</div>
                <div className="mock-nav-item">📱 &nbsp;DM Scripts</div>
                <div className="mock-nav-item">📞 &nbsp;Call Scripts</div>
                <div className="mock-nav-item">📊 &nbsp;CRM</div>
                <div className="mock-nav-item" id="mock-lead-finder-tab" onClick={() => (window as any).switchMockTab('leads')} style={{cursor:'pointer'}}>🗺️ &nbsp;Lead Finder</div>
                <div className="mock-nav-item">⚙️ &nbsp;Settings</div>
              </div>
              <div style={{position:'relative',minWidth:0,overflow:'hidden'}}>
                <div className="mock-main" id="mock-panel-email">
                  <div className="mock-stats">
                    <div className="mock-stat"><div className="mock-stat-num">847</div><div className="mock-stat-label">Emails Sent</div></div>
                    <div className="mock-stat"><div className="mock-stat-num">34%</div><div className="mock-stat-label">Reply Rate</div></div>
                    <div className="mock-stat"><div className="mock-stat-num">12</div><div className="mock-stat-label">Calls Booked</div></div>
                  </div>
                  <div className="mock-email-card">
                    <div className="mock-email-label">✦ AI Generated — Cold Email #1</div>
                    <div className="mock-email-subject">Quick idea for <span style={{color:'#a78bfa'}}>Bella&apos;s Bistro</span> 🍽️</div>
                    <div className="mock-email-body">
                      Hey <span className="highlight">Marco</span>, noticed <span className="highlight">Bella&apos;s Bistro</span> has incredible reviews but your Google profile is missing photos of that famous truffle pasta — you&apos;re leaving serious bookings on the table.<br/><br/>
                      I help restaurants like yours <span className="highlight mock-typing">turn browsers into</span>
                    </div>
                    <div className="mock-actions">
                      <div className="mock-btn mock-btn-primary">Copy Email</div>
                      <div className="mock-btn mock-btn-outline">Regenerate</div>
                      <div className="mock-btn mock-btn-outline">+ Follow-up</div>
                    </div>
                  </div>
                </div>

                <div className="mock-main" id="mock-panel-leads" style={{display:'none'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'0.5rem',alignItems:'center'}}>
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'7px',padding:'0.45rem 0.75rem',fontSize:'0.72rem',color:'var(--muted2)'}}>📍 Chicago, IL</div>
                    <div style={{background:'var(--bg3)',border:'1px solid rgba(99,102,241,0.4)',borderRadius:'7px',padding:'0.45rem 0.75rem',fontSize:'0.72rem',color:'#a78bfa'}}>🏢 Restaurants &amp; Cafes</div>
                    <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'7px',padding:'0.45rem 0.9rem',fontSize:'0.72rem',fontWeight:600,color:'white',cursor:'default'}}>Find</div>
                  </div>
                  <div style={{display:'flex',gap:'0.4rem',marginTop:'-0.25rem'}}>
                    <span style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',fontSize:'0.62rem',fontWeight:600,padding:'0.18rem 0.6rem',borderRadius:'100px'}}>🌐 No Website</span>
                    <span style={{background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--muted2)',fontSize:'0.62rem',fontWeight:600,padding:'0.18rem 0.6rem',borderRadius:'100px'}}>⭐ No Reviews</span>
                    <span style={{background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--muted2)',fontSize:'0.62rem',fontWeight:500,padding:'0.18rem 0.6rem',borderRadius:'100px'}}>📉 Low Rating</span>
                    <span style={{marginLeft:'auto',fontSize:'0.65rem',color:'#34d399',fontWeight:600,alignSelf:'center'}}>23 leads found</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                    <div style={{background:'var(--bg3)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'10px',padding:'0.7rem 0.9rem',display:'grid',gridTemplateColumns:'1fr auto',gap:'0.75rem',alignItems:'center'}}>
                      <div>
                        <div style={{fontSize:'0.8rem',fontWeight:600,display:'flex',alignItems:'center',gap:'0.5rem'}}>Angelo&apos;s Trattoria <span style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',fontSize:'0.58rem',fontWeight:700,padding:'0.1rem 0.45rem',borderRadius:'100px'}}>NO SITE</span></div>
                        <div style={{fontSize:'0.68rem',color:'var(--muted2)',marginTop:'0.15rem'}}>📍 1842 N Clark St &nbsp;·&nbsp; ⭐ 4.2 (38 reviews)</div>
                      </div>
                      <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'7px',padding:'0.35rem 0.7rem',fontSize:'0.68rem',fontWeight:600,color:'white',cursor:'default',whiteSpace:'nowrap'}}>✉️ Email</div>
                    </div>
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'10px',padding:'0.7rem 0.9rem',display:'grid',gridTemplateColumns:'1fr auto',gap:'0.75rem',alignItems:'center',opacity:0.75}}>
                      <div>
                        <div style={{fontSize:'0.8rem',fontWeight:600,display:'flex',alignItems:'center',gap:'0.5rem'}}>Golden Dragon Palace <span style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',fontSize:'0.58rem',fontWeight:700,padding:'0.1rem 0.45rem',borderRadius:'100px'}}>NO SITE</span></div>
                        <div style={{fontSize:'0.68rem',color:'var(--muted2)',marginTop:'0.15rem'}}>📍 2310 S Wentworth Ave &nbsp;·&nbsp; ⭐ 3.8 (22 reviews)</div>
                      </div>
                      <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'7px',padding:'0.35rem 0.7rem',fontSize:'0.68rem',fontWeight:600,color:'white',cursor:'default',whiteSpace:'nowrap'}}>✉️ Email</div>
                    </div>
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'10px',padding:'0.7rem 0.9rem',display:'grid',gridTemplateColumns:'1fr auto',gap:'0.75rem',alignItems:'center',opacity:0.5}}>
                      <div>
                        <div style={{fontSize:'0.8rem',fontWeight:600,display:'flex',alignItems:'center',gap:'0.5rem'}}>Maria&apos;s Taqueria <span style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',color:'#f87171',fontSize:'0.58rem',fontWeight:700,padding:'0.1rem 0.45rem',borderRadius:'100px'}}>NO SITE</span></div>
                        <div style={{fontSize:'0.68rem',color:'var(--muted2)',marginTop:'0.15rem'}}>📍 4521 W Fullerton Ave &nbsp;·&nbsp; ⭐ 4.5 (61 reviews)</div>
                      </div>
                      <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:'7px',padding:'0.35rem 0.7rem',fontSize:'0.68rem',fontWeight:600,color:'white',cursor:'default',whiteSpace:'nowrap'}}>✉️ Email</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="logos">
        <p className="fade-up">Trusted by agencies and freelancers worldwide</p>
        <div className="logo-grid fade-up" data-delay="2">
          <div className="logo-item">NovaBrand</div>
          <div className="logo-item">PixelCraft</div>
          <div className="logo-item">GrowthLab</div>
          <div className="logo-item">SproutAgency</div>
          <div className="logo-item">CoreMedia</div>
          <div className="logo-item">LaunchPad</div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stats-grid">
          <div className="fade-up" data-delay="1"><div className="stat-num" data-target="12400">0</div><div className="stat-label">Active Users</div></div>
          <div className="fade-up" data-delay="2"><div className="stat-num" data-target="3200000">0</div><div className="stat-label">Emails Generated</div></div>
          <div className="fade-up" data-delay="3"><div className="stat-num" data-target="34">0</div><div className="stat-label">Avg. Reply Rate %</div></div>
          <div className="fade-up" data-delay="4"><div className="stat-num" data-target="98">0</div><div className="stat-label">Customer Satisfaction %</div></div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-label fade-up">Features</div>
        <h2 className="section-title fade-up" data-delay="1">Everything you need to land clients</h2>
        <p className="section-sub fade-up" data-delay="2">Built specifically for agencies and freelancers who want results, not busywork.</p>
        <div className="features-grid">
          <div className="feature-card fade-up" data-delay="1"><div className="feature-icon">✉️</div><h3>Cold Email Generator</h3><p>Paste in a prospect&apos;s website and get a fully personalized cold email in seconds. No more staring at a blank screen.</p></div>
          <div className="feature-card fade-up" data-delay="2"><div className="feature-icon">🧠</div><h3>AI Icebreaker Engine</h3><p>Automatically crafts a unique opening line for every prospect based on their business, recent news, or social activity.</p></div>
          <div className="feature-card fade-up" data-delay="3"><div className="feature-icon">🔁</div><h3>Follow-Up Sequences</h3><p>Build complete multi-touch sequences — email 1, 2, 3, and beyond — all written and ready to copy-paste.</p></div>
          <div className="feature-card fade-up" data-delay="4"><div className="feature-icon">📱</div><h3>DM &amp; LinkedIn Scripts</h3><p>Turn any offer into a short, sharp LinkedIn message or Instagram DM that doesn&apos;t feel like spam.</p></div>
          <div className="feature-card fade-up" data-delay="5"><div className="feature-icon">📞</div><h3>Cold Call Scripts</h3><p>Get a full call script with opener, pitch, objection handling, and close — tailored to your niche.</p></div>
          <div className="feature-card fade-up" data-delay="6"><div className="feature-icon">📊</div><h3>Outreach CRM</h3><p>Track every prospect, follow-up reminder, and deal stage in a clean, minimal dashboard built for movers.</p></div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="how-inner">
          <div className="section-label fade-up">How It Works</div>
          <h2 className="section-title fade-up" data-delay="1">From zero to outreach in minutes</h2>
          <p className="section-sub fade-up" data-delay="2">Three simple steps to start landing clients with AI.</p>
          <div className="steps">
            <div className="step fade-up" data-delay="1"><div className="step-num">1</div><h3>Define Your Offer</h3><p>Tell OutreachAI what you do, who you help, and what makes you different. One-time setup.</p></div>
            <div className="step fade-up" data-delay="2"><div className="step-num">2</div><h3>Add Your Prospects</h3><p>Paste a URL, upload a list, or search by niche. OutreachAI gathers the context it needs.</p></div>
            <div className="step fade-up" data-delay="3"><div className="step-num">3</div><h3>Send &amp; Close</h3><p>Copy your AI-written messages, hit send, and watch replies roll in. It&apos;s that simple.</p></div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="section-label fade-up">Pricing</div>
        <h2 className="section-title fade-up" data-delay="1">Simple, honest pricing</h2>
        <p className="section-sub fade-up" data-delay="2">Start free, scale when you&apos;re ready. No hidden fees.</p>
        <div className="pricing-grid">
          <div className="pricing-card fade-up" data-delay="1">
            <div className="pricing-name">Starter</div>
            <div className="pricing-price">$0 <span>/ mo</span></div>
            <div className="pricing-desc">Perfect for freelancers just getting started.</div>
            <ul className="pricing-features"><li>25 AI-generated messages/month</li><li>Cold email generator</li><li>Basic icebreakers</li><li>1 active sequence</li></ul>
            <a href="#" className="btn-plan btn-plan-outline">Get Started Free</a>
          </div>
          <div className="pricing-card featured fade-up" data-delay="2">
            <div className="pricing-name">Pro</div>
            <div className="pricing-price">$49 <span>/ mo</span></div>
            <div className="pricing-desc">For agencies ready to scale outreach fast.</div>
            <ul className="pricing-features"><li>Unlimited AI messages</li><li>All message types (email, DM, call)</li><li>Full sequence builder</li><li>Outreach CRM included</li><li>Priority support</li></ul>
            <a href="#" className="btn-plan btn-plan-filled">Start Pro Free</a>
          </div>
          <div className="pricing-card fade-up" data-delay="3">
            <div className="pricing-name">Agency</div>
            <div className="pricing-price">$149 <span>/ mo</span></div>
            <div className="pricing-desc">For teams running outreach at volume.</div>
            <ul className="pricing-features"><li>Everything in Pro</li><li>Up to 10 team seats</li><li>Client workspaces</li><li>White-label exports</li><li>Dedicated account manager</li></ul>
            <a href="#" className="btn-plan btn-plan-outline">Contact Sales</a>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="testimonials-inner">
          <div className="section-label fade-up">Testimonials</div>
          <h2 className="section-title fade-up" data-delay="1">Agencies love OutreachAI</h2>
          <p className="section-sub fade-up" data-delay="2">Real results from real users.</p>
          <div className="testimonials-grid">
            <div className="testimonial-card fade-up" data-delay="1">
              <div className="stars">★★★★★</div>
              <p>&quot;I went from spending 3 hours a day on cold outreach to 20 minutes. Booked 4 discovery calls in my first week using OutreachAI.&quot;</p>
              <div className="testimonial-author"><div className="avatar">JM</div><div className="author-info"><strong>Jake M.</strong><span>Freelance Web Designer</span></div></div>
            </div>
            <div className="testimonial-card fade-up" data-delay="2">
              <div className="stars">★★★★★</div>
              <p>&quot;Our agency doubled its pipeline in 60 days. The icebreaker feature alone is worth the subscription — prospects actually reply.&quot;</p>
              <div className="testimonial-author"><div className="avatar">SR</div><div className="author-info"><strong>Sarah R.</strong><span>Founder, Pixel &amp; Co Agency</span></div></div>
            </div>
            <div className="testimonial-card fade-up" data-delay="3">
              <div className="stars">★★★★★</div>
              <p>&quot;I was skeptical about AI writing my outreach. Now I can&apos;t imagine doing it any other way. Every message feels personal and on-brand.&quot;</p>
              <div className="testimonial-author"><div className="avatar">DT</div><div className="author-info"><strong>David T.</strong><span>Social Media Consultant</span></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2 className="fade-up">Ready to fill your calendar<br /><span>with qualified leads?</span></h2>
        <p className="fade-up" data-delay="1">Join thousands of agencies and freelancers already using OutreachAI.</p>
        <div className="fade-up" data-delay="2">
          <a href="#" className="btn-primary">Start for Free — No Card Needed →</a>
        </div>
      </section>

      <footer>
        <div className="footer-logo">OutreachAI</div>
        <ul className="footer-links">
          <li><Link href="/features">Features</Link></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
        <div className="footer-copy">© 2025 OutreachAI. All rights reserved.</div>
      </footer>
    </>
  );
}
