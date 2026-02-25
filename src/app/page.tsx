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
      <div id="cursor"></div>
      <div id="cursor-glow"></div>
      <canvas id="bg-canvas"></canvas>

      <nav id="navbar" className="landing-nav">
        <div className="nav-logo">OutreachAI</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it Works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><Link href="/login">Sign in</Link></li>
          <li><Link href="/signup" className="nav-cta">Get Started</Link></li>
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
          <Link href="/signup" className="btn-primary">Start for Free →</Link>
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
            <Link href="/signup" className="btn-plan btn-plan-outline">Get Started Free</Link>
          </div>
          <div className="pricing-card featured fade-up" data-delay="2">
            <div className="pricing-name">Pro</div>
            <div className="pricing-price">$49 <span>/ mo</span></div>
            <div className="pricing-desc">For agencies ready to scale outreach fast.</div>
            <ul className="pricing-features"><li>Unlimited AI messages</li><li>All message types (email, DM, call)</li><li>Full sequence builder</li><li>Outreach CRM included</li><li>Priority support</li></ul>
            <Link href="/signup" className="btn-plan btn-plan-filled">Start Pro Free</Link>
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
          <Link href="/signup" className="btn-primary">Start for Free — No Card Needed →</Link>
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
