'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
  useEffect(() => {
    // CUSTOM CURSOR
    const cursor = document.getElementById('cursor')!;
    const cursorGlow = document.getElementById('cursor-glow')!;
    let mx = 0, my = 0, gx = window.innerWidth / 2, gy = window.innerHeight / 2;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    };
    document.addEventListener('mousemove', onMouseMove);

    function animCursor() {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      cursorGlow.style.left = gx + 'px';
      cursorGlow.style.top = gy + 'px';
      requestAnimationFrame(animCursor);
    }
    animCursor();

    // ANIMATED BG CANVAS
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
        this.x = Math.random() * W; this.y = Math.random() * H;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - .5) * .3; this.speedY = (Math.random() - .5) * .3;
        this.opacity = Math.random() * .5 + .1; this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.speedX; this.y += this.speedY; this.pulse += .015;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        const a = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${a})`; ctx.fill();
      }
    }
    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function drawGrid() {
      const s = 80; ctx.strokeStyle = 'rgba(99,102,241,0.035)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    function drawConn() {
      const md = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < md) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d / md) * 0.12})`; ctx.lineWidth = .6; ctx.stroke();
          }
        }
      }
    }

    let animId: number;
    function animBg() {
      ctx.clearRect(0, 0, W, H); drawGrid(); drawConn();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animBg);
    }
    animBg();

    // NAV SCROLL
    const navbar = document.getElementById('navbar')!;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    // FADE UP
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      obs.disconnect();
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
        h1,h2,h3,.nav-logo,.footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; }
        #cursor { position: fixed; top: 0; left: 0; width: 12px; height: 12px; background: #6366f1; border-radius: 50%; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); mix-blend-mode: screen; transition: width 0.2s, height 0.2s; }
        #cursor-glow { position: fixed; top: 0; left: 0; width: 320px; height: 320px; background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%); border-radius: 50%; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); transition: transform 0.08s linear; }
        #bg-canvas { position: fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; }
        .fade-up { opacity:0; transform:translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .fade-up[data-delay="1"] { transition-delay:0.1s; }
        .fade-up[data-delay="2"] { transition-delay:0.2s; }
        .fade-up[data-delay="3"] { transition-delay:0.3s; }
        .fade-up[data-delay="4"] { transition-delay:0.4s; }
        .fade-up[data-delay="5"] { transition-delay:0.5s; }
        .fade-up[data-delay="6"] { transition-delay:0.6s; }
        nav { position: fixed; top:0; width:100%; z-index:500; padding: 1.25rem 2.5rem; display:flex; align-items:center; justify-content:space-between; border-bottom: 1px solid transparent; transition: all 0.3s; backdrop-filter: blur(20px); background: rgba(6,9,16,0.7); }
        nav.scrolled { border-bottom: 1px solid var(--border); }
        .nav-logo { font-size:1.3rem; letter-spacing:-0.02em; background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; text-decoration: none; }
        .nav-links { display:flex; gap:2rem; list-style:none; }
        .nav-links a { color:var(--muted2); text-decoration:none; font-size:0.875rem; font-weight:400; transition:color 0.2s; }
        .nav-links a:hover, .nav-links a.active { color:var(--text); }
        .nav-cta { background:var(--accent); color:white !important; padding:0.5rem 1.25rem; border-radius:8px; font-weight:500 !important; transition:background 0.2s, transform 0.15s !important; }
        .nav-cta:hover { background:var(--accent2) !important; transform:translateY(-1px); }
        .page-hero { position: relative; z-index:1; padding: 10rem 2rem 5rem; text-align: center; }
        .page-hero::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background: linear-gradient(90deg, transparent, var(--border), transparent); }
        .page-badge { display:inline-flex; align-items:center; gap:0.5rem; background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.28); color:#a78bfa; padding:0.4rem 1.1rem; border-radius:100px; font-size:0.78rem; font-weight:500; margin-bottom:2rem; letter-spacing:0.03em; }
        .page-hero h1 { font-size: clamp(2.5rem, 6vw, 5rem); letter-spacing: -0.04em; line-height: 1.05; max-width: 780px; margin: 0 auto 1.5rem; }
        .page-hero h1 span { background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #e879f9 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .page-hero p { font-size:1.15rem; font-weight:300; color:var(--muted2); max-width:520px; margin:0 auto; line-height:1.75; }
        .features-wrap { position:relative; z-index:1; max-width:1100px; margin:0 auto; padding:6rem 2rem; }
        .feature-deep { display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; padding:5rem 0; border-bottom:1px solid var(--border); }
        .feature-deep:last-child { border-bottom:none; }
        .feature-deep.reverse { direction:rtl; }
        .feature-deep.reverse > * { direction:ltr; }
        .feature-text .tag { display:inline-block; background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.25); color:#a78bfa; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; padding:0.3rem 0.85rem; border-radius:100px; margin-bottom:1.25rem; }
        .feature-text h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); letter-spacing:-0.035em; line-height:1.15; margin-bottom:1rem; }
        .feature-text p { color:var(--muted2); font-weight:300; line-height:1.75; font-size:1rem; margin-bottom:1.5rem; }
        .feature-bullets { list-style:none; display:flex; flex-direction:column; gap:0.6rem; }
        .feature-bullets li { display:flex; align-items:flex-start; gap:0.75rem; font-size:0.9rem; font-weight:300; color:var(--muted2); }
        .feature-bullets li::before { content:'✦'; color:#6366f1; font-size:0.7rem; margin-top:0.25rem; flex-shrink:0; }
        .feature-visual { background:var(--bg2); border:1px solid var(--border); border-radius:20px; overflow:hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.07); transition: transform 0.4s cubic-bezier(.22,.68,0,1.2), box-shadow 0.4s; }
        .feature-visual:hover { transform:translateY(-6px) scale(1.01); box-shadow:0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.12); }
        .visual-header { background:var(--bg3); padding:0.75rem 1.25rem; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:0.6rem; }
        .vis-dots { display:flex; gap:5px; }
        .vis-dots span { width:9px; height:9px; border-radius:50%; }
        .vis-dots span:nth-child(1){background:#ff5f57;}
        .vis-dots span:nth-child(2){background:#febc2e;}
        .vis-dots span:nth-child(3){background:#28c840;}
        .vis-title { font-size:0.72rem; color:var(--muted); font-weight:400; margin-left:0.5rem; }
        .visual-body { padding:1.5rem; }
        .email-preview { background:var(--bg3); border:1px solid var(--border); border-radius:10px; padding:1.25rem; margin-bottom:0.75rem; }
        .ep-subject { font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:0.5rem; }
        .ep-body { font-size:0.75rem; color:var(--muted2); font-weight:300; line-height:1.65; }
        .ep-body .hi { color:#a78bfa; font-weight:500; }
        .ep-tag { display:inline-block; font-size:0.62rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; padding:0.2rem 0.6rem; border-radius:100px; background:rgba(99,102,241,0.12); color:#a78bfa; margin-bottom:0.75rem; }
        .seq-timeline { display:flex; flex-direction:column; gap:0.6rem; }
        .seq-step { display:flex; align-items:center; gap:0.85rem; background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:0.75rem 1rem; font-size:0.78rem; font-weight:400; }
        .seq-step.active { border-color:rgba(99,102,241,0.4); background:rgba(99,102,241,0.07); }
        .seq-num { width:26px; height:26px; border-radius:50%; background:var(--bg2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:0.72rem; flex-shrink:0; color:var(--muted2); }
        .seq-step.active .seq-num { background:linear-gradient(135deg,#6366f1,#8b5cf6); border-color:transparent; color:white; }
        .seq-label { flex:1; color:var(--muted2); }
        .seq-step.active .seq-label { color:var(--text); }
        .seq-day { font-size:0.65rem; color:var(--muted); }
        .audit-row { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.6rem; }
        .audit-label { font-size:0.75rem; color:var(--muted2); width:140px; flex-shrink:0; }
        .audit-bar-wrap { flex:1; background:var(--bg3); border-radius:100px; height:6px; overflow:hidden; }
        .audit-bar { height:100%; border-radius:100px; }
        .audit-score { font-size:0.72rem; font-weight:600; color:var(--text); width:28px; text-align:right; }
        .crm-row { display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:1rem; padding:0.65rem 0; border-bottom:1px solid var(--border); font-size:0.78rem; }
        .crm-row:last-child { border-bottom:none; }
        .crm-name { font-weight:500; color:var(--text); }
        .crm-company { font-size:0.7rem; color:var(--muted); font-weight:300; }
        .crm-status { font-size:0.68rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; padding:0.2rem 0.6rem; border-radius:100px; }
        .crm-status.sent { background:rgba(99,102,241,0.12); color:#a78bfa; }
        .crm-status.replied { background:rgba(34,197,94,0.12); color:#4ade80; }
        .crm-status.booked { background:rgba(245,158,11,0.12); color:#fbbf24; }
        .crm-date { font-size:0.7rem; color:var(--muted); }
        .mini-features { padding:4rem 2rem 8rem; max-width:1100px; margin:0 auto; }
        .mini-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1.25rem; }
        .mini-card { background:var(--bg2); border:1px solid var(--border); border-radius:14px; padding:1.75rem; transition:transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s, border-color 0.3s; }
        .mini-card:hover { transform:translateY(-5px) scale(1.01); border-color:rgba(99,102,241,0.3); box-shadow:0 16px 48px rgba(0,0,0,0.4); }
        .mini-icon { font-size:1.5rem; margin-bottom:0.85rem; }
        .mini-card h3 { font-size:0.95rem; font-weight:700; margin-bottom:0.4rem; }
        .mini-card p { font-size:0.83rem; color:var(--muted2); font-weight:300; line-height:1.6; }
        .cta-strip { position:relative; z-index:1; text-align:center; padding:8rem 2rem; border-top:1px solid var(--border); }
        .cta-strip::before { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; height:700px; background:radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 68%); pointer-events:none; }
        .cta-strip h2 { font-size:clamp(2rem,5vw,3.5rem); letter-spacing:-0.04em; line-height:1.1; margin-bottom:1.25rem; }
        .cta-strip h2 span { background:linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .cta-strip p { color:var(--muted2); font-weight:300; margin-bottom:2.5rem; }
        .btn-primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; padding:1rem 2.25rem; border-radius:12px; font-size:1rem; font-weight:600; text-decoration:none; transition:transform 0.25s, box-shadow 0.25s; display:inline-block; box-shadow:0 0 0 1px rgba(99,102,241,0.4),0 0 40px rgba(99,102,241,0.5),0 0 80px rgba(99,102,241,0.2); }
        .btn-primary:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 0 0 1px rgba(99,102,241,0.7),0 0 60px rgba(99,102,241,0.7),0 0 120px rgba(99,102,241,0.35); }
        footer { position:relative; z-index:1; padding:3.5rem 2.5rem; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; max-width:1100px; margin:0 auto; }
        .footer-logo { font-size:1.15rem; letter-spacing:-0.02em; background:linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .footer-links { display:flex; gap:2rem; list-style:none; flex-wrap:wrap; }
        .footer-links a { color:var(--muted); text-decoration:none; font-size:0.82rem; font-weight:400; transition:color 0.2s; }
        .footer-links a:hover { color:var(--muted2); }
        .footer-copy { color:var(--muted); font-size:0.78rem; font-weight:300; }
        @media(max-width:768px) { .feature-deep { grid-template-columns:1fr; gap:2rem; } .feature-deep.reverse { direction:ltr; } }
        @media(max-width:640px) { .nav-links { display:none; } footer { flex-direction:column; text-align:center; } .footer-links { justify-content:center; } body { cursor:auto; } #cursor,#cursor-glow { display:none; } }
      `}</style>

      <div id="cursor"></div>
      <div id="cursor-glow"></div>
      <canvas id="bg-canvas"></canvas>

      <nav id="navbar">
        <Link href="/" className="nav-logo">OutreachAI</Link>
        <ul className="nav-links">
          <li><Link href="/features" className="active">Features</Link></li>
          <li><a href="#">How it Works</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#" className="nav-cta">Get Started</a></li>
        </ul>
      </nav>

      <section className="page-hero">
        <div className="page-badge">✦ Full Feature Breakdown</div>
        <h1>Every tool you need to<br /><span>book more clients.</span></h1>
        <p>Six powerful features built around one goal — turning cold strangers into paying clients, faster.</p>
      </section>

      <div className="features-wrap">
        {/* 1. Cold Email */}
        <div className="feature-deep fade-up">
          <div className="feature-text">
            <span className="tag">01 — Cold Email</span>
            <h2>Emails that actually get replies</h2>
            <p>Paste a prospect&apos;s URL and OutreachAI reads their website, identifies pain points, and writes a hyper-specific cold email in seconds. Not a template — a real message.</p>
            <ul className="feature-bullets">
              <li>Analyzes prospect&apos;s website copy, services, and gaps</li>
              <li>Writes subject line, opener, pitch, and CTA</li>
              <li>Adjustable tone: Professional, Casual, or Bold</li>
              <li>One-click regenerate for new variations</li>
            </ul>
          </div>
          <div className="feature-visual fade-up" data-delay="2">
            <div className="visual-header">
              <div className="vis-dots"><span></span><span></span><span></span></div>
              <span className="vis-title">Cold Email Generator</span>
            </div>
            <div className="visual-body">
              <div className="ep-tag">✦ AI Generated</div>
              <div className="email-preview">
                <div className="ep-subject">Quick idea for <span style={{color:'#a78bfa'}}>Bella&apos;s Bistro</span> 🍽️</div>
                <div className="ep-body">
                  Hey <span className="hi">Marco</span>, noticed Bella&apos;s Bistro has incredible reviews but your Google profile is missing photos of that famous truffle pasta — you&apos;re leaving serious bookings on the table.<br/><br/>
                  I help restaurants turn their existing reputation into a full dining room. Mind if I share what I&apos;d do for <span className="hi">Bella&apos;s</span> specifically?
                </div>
              </div>
              <div className="email-preview" style={{opacity:0.5}}>
                <div className="ep-tag">Variation 2</div>
                <div className="ep-body" style={{fontSize:'0.72rem'}}>Your competitor down the street has 2x the Google photos and 40% more monthly visits...</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sequences */}
        <div className="feature-deep reverse fade-up">
          <div className="feature-text">
            <span className="tag">02 — Follow-Up Sequences</span>
            <h2>5-touch sequences that close</h2>
            <p>Most deals are won on follow-up #4 or #5. OutreachAI builds the entire sequence for you — each email with a different angle so you never repeat yourself.</p>
            <ul className="feature-bullets">
              <li>Full 5-email sequence generated in one go</li>
              <li>Each email uses a different persuasion angle</li>
              <li>Includes subject lines + send-day suggestions</li>
              <li>Auto-adapts tone based on sequence position</li>
            </ul>
          </div>
          <div className="feature-visual fade-up" data-delay="2">
            <div className="visual-header">
              <div className="vis-dots"><span></span><span></span><span></span></div>
              <span className="vis-title">Sequence Builder</span>
            </div>
            <div className="visual-body">
              <div className="seq-timeline">
                <div className="seq-step active"><div className="seq-num">1</div><div className="seq-label">Cold intro — pain + hook</div><div className="seq-day">Day 0</div></div>
                <div className="seq-step active"><div className="seq-num">2</div><div className="seq-label">Value add — free tip</div><div className="seq-day">Day 2</div></div>
                <div className="seq-step"><div className="seq-num">3</div><div className="seq-label">Social proof — case study</div><div className="seq-day">Day 5</div></div>
                <div className="seq-step"><div className="seq-num">4</div><div className="seq-label">New angle — different pain</div><div className="seq-day">Day 9</div></div>
                <div className="seq-step"><div className="seq-num">5</div><div className="seq-label">Breakup email — urgency</div><div className="seq-day">Day 14</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Audit Outreach */}
        <div className="feature-deep fade-up">
          <div className="feature-text">
            <span className="tag">03 — Website Audit Outreach</span>
            <h2>Lead with insight, not a pitch</h2>
            <p>Paste a prospect&apos;s URL and OutreachAI scores their website across key areas — then writes an outreach email that leads with your findings. Prospects respond because it feels personal.</p>
            <ul className="feature-bullets">
              <li>Scores speed, SEO, trust signals, and copy clarity</li>
              <li>Generates outreach based on their weakest areas</li>
              <li>Positions you as an expert from line one</li>
              <li>Converts 3–5x higher than generic emails</li>
            </ul>
          </div>
          <div className="feature-visual fade-up" data-delay="2">
            <div className="visual-header">
              <div className="vis-dots"><span></span><span></span><span></span></div>
              <span className="vis-title">Site Audit — bella-bistro.com</span>
            </div>
            <div className="visual-body">
              <div style={{marginBottom:'1rem'}}>
                <div className="audit-row">
                  <div className="audit-label" style={{fontSize:'0.72rem',color:'var(--muted2)'}}>Page Speed</div>
                  <div className="audit-bar-wrap"><div className="audit-bar" style={{width:'28%',background:'#ef4444'}}></div></div>
                  <div className="audit-score" style={{color:'#ef4444'}}>28</div>
                </div>
                <div className="audit-row">
                  <div className="audit-label" style={{fontSize:'0.72rem',color:'var(--muted2)'}}>SEO Score</div>
                  <div className="audit-bar-wrap"><div className="audit-bar" style={{width:'45%',background:'#f59e0b'}}></div></div>
                  <div className="audit-score" style={{color:'#f59e0b'}}>45</div>
                </div>
                <div className="audit-row">
                  <div className="audit-label" style={{fontSize:'0.72rem',color:'var(--muted2)'}}>Trust Signals</div>
                  <div className="audit-bar-wrap"><div className="audit-bar" style={{width:'30%',background:'#ef4444'}}></div></div>
                  <div className="audit-score" style={{color:'#ef4444'}}>30</div>
                </div>
                <div className="audit-row">
                  <div className="audit-label" style={{fontSize:'0.72rem',color:'var(--muted2)'}}>Copy Clarity</div>
                  <div className="audit-bar-wrap"><div className="audit-bar" style={{width:'62%',background:'#6366f1'}}></div></div>
                  <div className="audit-score">62</div>
                </div>
              </div>
              <div className="email-preview">
                <div className="ep-tag">✦ Audit-Based Email</div>
                <div className="ep-body">&quot;Marco, ran a quick audit on Bella&apos;s Bistro — your site scored <span className="hi">28/100 on mobile speed</span> which is likely costing you 40% of visitors before they see your menu...&quot;</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. CRM */}
        <div className="feature-deep reverse fade-up">
          <div className="feature-text">
            <span className="tag">04 — Outreach CRM</span>
            <h2>Never lose track of a lead</h2>
            <p>A lightweight CRM built for solo operators and small teams. Track every prospect, see what stage they&apos;re at, and get reminded when to follow up — all in one clean view.</p>
            <ul className="feature-bullets">
              <li>Pipeline view with drag-and-drop stages</li>
              <li>Automatic follow-up reminders</li>
              <li>One-click access to every email sent</li>
              <li>Reply tracking and open rate visibility</li>
            </ul>
          </div>
          <div className="feature-visual fade-up" data-delay="2">
            <div className="visual-header">
              <div className="vis-dots"><span></span><span></span><span></span></div>
              <span className="vis-title">Outreach CRM</span>
            </div>
            <div className="visual-body">
              <div className="crm-row" style={{fontSize:'0.65rem',color:'var(--muted)',paddingBottom:'0.5rem',borderBottom:'1px solid var(--border)'}}>
                <div>PROSPECT</div><div>STATUS</div><div>LAST CONTACT</div>
              </div>
              <div className="crm-row">
                <div><div className="crm-name">Marco Rossi</div><div className="crm-company">Bella&apos;s Bistro</div></div>
                <div><span className="crm-status replied">Replied</span></div>
                <div className="crm-date">2h ago</div>
              </div>
              <div className="crm-row">
                <div><div className="crm-name">Sarah Chen</div><div className="crm-company">Chen Law Group</div></div>
                <div><span className="crm-status booked">Call Booked</span></div>
                <div className="crm-date">Yesterday</div>
              </div>
              <div className="crm-row">
                <div><div className="crm-name">Tom Walsh</div><div className="crm-company">Walsh Plumbing</div></div>
                <div><span className="crm-status sent">Sent</span></div>
                <div className="crm-date">3 days ago</div>
              </div>
              <div className="crm-row">
                <div><div className="crm-name">Amy Park</div><div className="crm-company">Park Yoga Studio</div></div>
                <div><span className="crm-status sent">Sent</span></div>
                <div className="crm-date">4 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MINI FEATURES GRID */}
      <div className="mini-features">
        <h2 className="fade-up" style={{textAlign:'center',fontSize:'clamp(1.5rem,3vw,2.25rem)',letterSpacing:'-0.03em',marginBottom:'3rem'}}>Plus everything else you need</h2>
        <div className="mini-grid">
          <div className="mini-card fade-up" data-delay="1"><div className="mini-icon">📱</div><h3>DM Scripts</h3><p>LinkedIn, Instagram, and Twitter DMs that feel human, not spammy.</p></div>
          <div className="mini-card fade-up" data-delay="2"><div className="mini-icon">📞</div><h3>Call Scripts</h3><p>Full opener-to-close cold call scripts tailored to your niche.</p></div>
          <div className="mini-card fade-up" data-delay="3"><div className="mini-icon">🎯</div><h3>Icebreaker Engine</h3><p>Unique first-line hooks based on the prospect&apos;s actual business.</p></div>
          <div className="mini-card fade-up" data-delay="4"><div className="mini-icon">📋</div><h3>Subject Line Generator</h3><p>10 subject line variations per email, scored for open rate potential.</p></div>
          <div className="mini-card fade-up" data-delay="5"><div className="mini-icon">🔬</div><h3>Review Pain Miner</h3><p>Scrapes Google reviews to find what customers are already complaining about.</p></div>
          <div className="mini-card fade-up" data-delay="6"><div className="mini-icon">🎬</div><h3>Loom Video Scripts</h3><p>60-second personalized video scripts that get 5x the reply rate.</p></div>
        </div>
      </div>

      {/* CTA */}
      <section className="cta-strip">
        <h2 className="fade-up">Ready to put these<br/><span>features to work?</span></h2>
        <p className="fade-up" data-delay="1">Start free. No credit card. Set up in 2 minutes.</p>
        <div className="fade-up" data-delay="2">
          <a href="#" className="btn-primary">Start for Free →</a>
        </div>
      </section>

      <footer>
        <div className="footer-logo">OutreachAI</div>
        <ul className="footer-links">
          <li><Link href="/features">Features</Link></li>
          <li><a href="#">How it Works</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
        <div className="footer-copy">© 2025 OutreachAI. All rights reserved.</div>
      </footer>
    </>
  );
}
