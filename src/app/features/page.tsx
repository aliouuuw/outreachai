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
      <div id="cursor"></div>
      <div id="cursor-glow"></div>
      <canvas id="bg-canvas"></canvas>

      <nav id="navbar" className="landing-nav">
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
