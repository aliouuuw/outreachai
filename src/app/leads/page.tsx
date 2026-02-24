'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LeadsPage() {
  useEffect(() => {
    // ─────────────────────────────────────
    // STATE
    // ─────────────────────────────────────
    let allLeads: any[] = [];
    let visibleCount = 20;
    let activeFilter = 'nowebsite';
    let activeLead: any = null;
    let activeTone = 'direct';

    // ─────────────────────────────────────
    // UI HELPERS
    // ─────────────────────────────────────
    function showState(name: string) {
      ['empty','loading','error'].forEach(s => {
        document.getElementById('state-' + s)!.style.display = s === name ? 'flex' : 'none';
      });
      document.getElementById('leads-list')!.style.display = 'none';
      document.getElementById('load-more-wrap')!.style.display = 'none';
      document.getElementById('results-topbar')!.style.display = 'none';
    }

    function showResults() {
      document.getElementById('state-empty')!.style.display = 'none';
      document.getElementById('state-loading')!.style.display = 'none';
      document.getElementById('state-error')!.style.display = 'none';
      document.getElementById('leads-list')!.style.display = 'flex';
      document.getElementById('results-topbar')!.style.display = 'flex';
    }

    function escHtml(str: string) {
      return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ─────────────────────────────────────
    // CITY & FILTER CHIPS
    // ─────────────────────────────────────
    function setCity(el: HTMLElement, city: string) {
      (document.getElementById('inp-location') as HTMLInputElement).value = city;
      document.querySelectorAll('#city-chips .chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    }

    function setFilter(el: HTMLElement, filter: string) {
      activeFilter = filter;
      document.querySelectorAll('.sidebar .filter-chips .chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    }

    // ─────────────────────────────────────
    // SEARCH
    // ─────────────────────────────────────
    async function runSearch() {
      const location = (document.getElementById('inp-location') as HTMLInputElement).value.trim();
      const industry = (document.getElementById('inp-industry') as HTMLSelectElement).value;

      if (!location) {
        const el = document.getElementById('inp-location')!;
        el.style.borderColor = 'rgba(239,68,68,0.6)';
        el.focus();
        setTimeout(() => el.style.borderColor = '', 1500);
        return;
      }
      if (!industry) {
        const el = document.getElementById('inp-industry')!;
        el.style.borderColor = 'rgba(239,68,68,0.6)';
        setTimeout(() => el.style.borderColor = '', 1500);
        return;
      }

      showState('loading');
      (document.getElementById('search-btn') as HTMLButtonElement).disabled = true;
      document.getElementById('btn-text')!.textContent = 'Searching...';

      const steps = ['ls1','ls2','ls3','ls4','ls5'];
      const labels = [
        'Connecting to Apify...',
        `Scraping ${industry} in ${location}...`,
        'Filtering — no website only...',
        'Pulling contact details...',
        'Almost done...',
      ];
      steps.forEach((id, i) => {
        setTimeout(() => {
          if (i > 0) {
            document.getElementById(steps[i-1])!.classList.remove('active');
            document.getElementById(steps[i-1])!.classList.add('done');
          }
          document.getElementById(id)!.classList.add('active');
          document.getElementById('loading-label')!.textContent = labels[i];
        }, i * 900);
      });

      try {
        const params = new URLSearchParams({ location, industry, filter: activeFilter });
        const res = await fetch(`/api/leads?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Request failed');

        allLeads = data.leads || [];
        visibleCount = 20;

        document.getElementById('stats-box')!.style.display = 'flex';
        document.getElementById('stat-total')!.textContent = allLeads.length + ' leads';
        document.getElementById('stat-phone')!.textContent = allLeads.filter((l: any) => l.phone).length + ' / ' + allLeads.length;
        document.getElementById('stat-scraped')!.textContent = (data.scraped || 0) + ' businesses';
        document.getElementById('stat-time')!.textContent = 'Just now';

        renderLeads();

      } catch (err: any) {
        showState('error');
        document.getElementById('error-msg')!.textContent = err.message || 'Something went wrong. Check your Apify token and try again.';
      } finally {
        (document.getElementById('search-btn') as HTMLButtonElement).disabled = false;
        document.getElementById('btn-text')!.textContent = '🔍 Find Leads';
        steps.forEach(id => {
          document.getElementById(id)!.classList.remove('active','done');
        });
      }
    }

    // ─────────────────────────────────────
    // RENDER LEADS
    // ─────────────────────────────────────
    function renderLeads() {
      const list = document.getElementById('leads-list')!;
      const visible = allLeads.slice(0, visibleCount);

      if (visible.length === 0) {
        showState('empty');
        document.querySelector('#state-empty .state-title')!.textContent = 'No leads found';
        document.querySelector('#state-empty .state-sub')!.textContent = 'Try a different location or industry.';
        return;
      }

      list.innerHTML = visible.map((lead: any, i: number) => renderCard(lead, i)).join('');
      showResults();

      document.getElementById('count-label')!.innerHTML =
        `Showing <strong>${visible.length}</strong> of <strong>${allLeads.length}</strong> leads`;

      document.getElementById('load-more-wrap')!.style.display =
        allLeads.length > visibleCount ? 'flex' : 'none';

      requestAnimationFrame(() => {
        document.querySelectorAll('.lead-card').forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 60);
        });
      });
    }

    function renderCard(lead: any, index: number) {
      const badge = activeFilter === 'nowebsite'
        ? `<span class="lead-badge badge-nosite">🌐 No Website</span>`
        : activeFilter === 'noreviews'
        ? `<span class="lead-badge badge-noreviews">⭐ No Reviews</span>`
        : '';

      const stars = lead.rating ? `⭐ ${lead.rating}` : '⭐ No rating';
      const reviews = lead.reviews ? `(${lead.reviews} reviews)` : '(0 reviews)';
      const phone = lead.phone || 'No phone listed';
      const mapsLink = lead.mapsUrl ? `href="${lead.mapsUrl}" target="_blank"` : 'href="#"';

      return `
        <div class="lead-card" id="card-${index}">
          <div>
            <div class="lead-top">
              <div class="lead-name">${escHtml(lead.name)}</div>
              ${badge}
            </div>
            <div class="lead-meta">
              ${lead.address ? `<div class="lead-meta-item">📍 <span>${escHtml(lead.address)}</span></div>` : ''}
              <div class="lead-meta-item">📞 <span>${escHtml(phone)}</span></div>
              <div class="lead-meta-item"><span style="color:#fbbf24">${stars}</span> <span style="color:var(--muted)">${reviews}</span></div>
              ${lead.category ? `<div class="lead-meta-item">🏢 <span>${escHtml(lead.category)}</span></div>` : ''}
            </div>
            <div class="lead-tags">
              <span class="lead-tag tag-opp">💡 Web Design Opportunity</span>
            </div>
          </div>
          <div class="lead-actions">
            <button class="lead-btn lead-btn-primary" data-open-modal="${index}">✉️ Generate Email</button>
            <a class="lead-btn lead-btn-outline" ${mapsLink}>🗺 View on Maps</a>
            <button class="lead-btn lead-btn-ghost" data-save="${index}">🔖 Save Lead</button>
          </div>
        </div>`;
    }

    // ─────────────────────────────────────
    // SORT & LOAD MORE
    // ─────────────────────────────────────
    function sortLeads(val: string) {
      if (val === 'rating-desc') allLeads.sort((a,b) => (b.rating||0) - (a.rating||0));
      else if (val === 'rating-asc') allLeads.sort((a,b) => (a.rating||0) - (b.rating||0));
      else if (val === 'reviews-desc') allLeads.sort((a,b) => (b.reviews||0) - (a.reviews||0));
      renderLeads();
    }

    function loadMore() {
      visibleCount += 20;
      renderLeads();
    }

    // ─────────────────────────────────────
    // EXPORT CSV
    // ─────────────────────────────────────
    function exportCSV() {
      const headers = ['Name','Address','Phone','Rating','Reviews','Category','Maps URL'];
      const rows = allLeads.map((l: any) => [
        l.name, l.address, l.phone||'', l.rating||'', l.reviews||'', l.category||'', l.mapsUrl||''
      ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'outreachai-leads.csv';
      a.click();
    }

    // ─────────────────────────────────────
    // EMAIL TEMPLATES
    // ─────────────────────────────────────
    const emailTpl: Record<string, { subject: (n: string) => string; body: (n: string, cat: string) => string }> = {
      direct: {
        subject: (n) => `${n} — your business is invisible online`,
        body: (n, cat) =>
`Hi there,

I searched for ${(cat||'businesses').toLowerCase()} in your area and found ${n} on Google Maps — but you have no website.

That means when customers Google "${(cat||'your service').toLowerCase()} near me," they find your competitors instead of you.

A simple, clean website would:
• Put you in front of customers actively searching
• Show your hours, location, and services instantly
• Start generating leads while you sleep

I build websites for local businesses starting at $499, live in 7 days.

Worth a 10-minute call?

[Your Name]`
      },
      casual: {
        subject: (n) => `Quick question about ${n}`,
        body: (n, cat) =>
`Hey!

Found ${n} on Google Maps while looking at local ${(cat||'businesses').toLowerCase()} — love what you've got going on.

One thing I noticed: no website. In 2025 that's honestly leaving a ton of customers on the table, especially people searching on their phones.

I help local businesses get a fast, clean site up — usually under a week. Nothing complicated, just something that works and ranks on Google.

Got 10 minutes this week to chat?

[Your Name]`
      },
      bold: {
        subject: (n) => `${n} is losing customers every day`,
        body: (n, cat) =>
`Let me be straight with you:

${n} has no website. Every day, customers searching for ${(cat||'your service').toLowerCase()} online find your competitors — not you.

I build websites specifically for local businesses. Most of my clients start getting new inquiries within 2 weeks of going live.

No bloated agency fees. No 3-month timelines. Just a fast, focused site that gets you found.

If you want to see what I'd build for ${n}, reply and I'll send a free mockup.

[Your Name]`
      }
    };

    // ─────────────────────────────────────
    // EMAIL MODAL
    // ─────────────────────────────────────
    function openModal(index: number) {
      activeLead = allLeads[index];
      activeTone = 'direct';
      document.querySelectorAll('.tone-btn').forEach((b,i) => b.classList.toggle('active', i===0));
      populateModal();
      document.getElementById('modal')!.classList.add('open');
    }

    function populateModal() {
      const lead = activeLead;
      const tpl = emailTpl[activeTone];
      document.getElementById('modal-title')!.textContent = lead.name;
      document.getElementById('modal-sub')!.textContent = `${activeTone} tone · no website pitch · ready to send`;
      document.getElementById('modal-subject')!.textContent = tpl.subject(lead.name);
      const body = tpl.body(lead.name, lead.category);
      document.getElementById('modal-body')!.innerHTML = body
        .replace(/\n/g,'<br>')
        .replace(new RegExp(escHtml(lead.name),'g'), `<span class="hi">${escHtml(lead.name)}</span>`);
    }

    function setTone(btn: HTMLElement, tone: string) {
      activeTone = tone;
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      populateModal();
    }

    function regenerate() {
      const btn = document.getElementById('copy-btn') as HTMLButtonElement;
      btn.textContent = '↺ Regenerating...';
      btn.disabled = true;
      setTimeout(() => {
        populateModal();
        btn.textContent = '📋 Copy Email';
        btn.disabled = false;
      }, 700);
    }

    function closeModal() {
      document.getElementById('modal')!.classList.remove('open');
    }

    function copyEmail() {
      const subject = document.getElementById('modal-subject')!.textContent;
      const body = document.getElementById('modal-body')!.innerText;
      navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => {
        const btn = document.getElementById('copy-btn')!;
        btn.textContent = '✓ Copied!';
        btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
        setTimeout(() => {
          btn.textContent = '📋 Copy Email';
          btn.style.background = '';
        }, 2000);
      });
    }

    // ─────────────────────────────────────
    // EVENT DELEGATION
    // ─────────────────────────────────────
    // Search button
    document.getElementById('search-btn')!.addEventListener('click', runSearch);

    // City chips
    document.querySelectorAll('#city-chips .chip').forEach(chip => {
      chip.addEventListener('click', function(this: HTMLElement) {
        setCity(this, this.dataset.city!);
      });
    });

    // Filter chips
    document.querySelectorAll('[data-filter]').forEach(chip => {
      chip.addEventListener('click', function(this: HTMLElement) {
        setFilter(this, this.dataset.filter!);
      });
    });

    // Sort select
    document.querySelector('.sort-select')?.addEventListener('change', function(this: HTMLSelectElement) {
      sortLeads(this.value);
    });

    // Export button
    document.querySelector('.export-btn')?.addEventListener('click', exportCSV);

    // Load more
    document.querySelector('.load-more-btn')?.addEventListener('click', loadMore);

    // Modal close
    document.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    // Tone buttons
    document.querySelectorAll('.tone-btn').forEach(btn => {
      btn.addEventListener('click', function(this: HTMLElement) {
        setTone(this, this.dataset.tone!);
      });
    });

    // Regenerate
    document.getElementById('regen-btn')?.addEventListener('click', regenerate);

    // Copy email
    document.getElementById('copy-btn')?.addEventListener('click', copyEmail);

    // Modal overlay click
    document.getElementById('modal')!.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Escape key
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKeyDown);

    // Enter key on location input
    document.getElementById('inp-location')!.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') runSearch();
    });

    // Delegated events for dynamically rendered lead cards
    document.getElementById('leads-list')!.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const modalBtn = target.closest('[data-open-modal]') as HTMLElement;
      if (modalBtn) {
        openModal(parseInt(modalBtn.dataset.openModal!));
        return;
      }
      const saveBtn = target.closest('[data-save]') as HTMLElement;
      if (saveBtn) {
        saveBtn.textContent = '✓ Saved';
        saveBtn.classList.add('saved');
        (saveBtn as HTMLButtonElement).disabled = true;
      }
    });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #060910; --bg2: #0b0f1a; --bg3: #0f1520; --bg4: #131927;
          --border: #1a2235; --accent: #6366f1; --accent2: #8b5cf6;
          --text: #f0f2f8; --muted: #5a6480; --muted2: #8892aa;
          --green: #10b981; --red: #ef4444; --amber: #f59e0b;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; font-weight: 300; line-height: 1.6; min-height: 100vh; }
        h1, h2, h3, .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; }
        nav { padding: 1.1rem 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); background: rgba(6,9,16,0.95); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 100; }
        .nav-left { display: flex; align-items: center; gap: 1rem; }
        .nav-logo { font-size: 1.15rem; letter-spacing: -0.02em; background: linear-gradient(135deg,#6366f1,#a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; }
        .nav-divider { width: 1px; height: 18px; background: var(--border); }
        .nav-page { font-size: 0.88rem; color: var(--muted2); font-weight: 400; }
        .nav-right { display: flex; align-items: center; gap: 0.75rem; }
        .nav-btn { padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .nav-btn-ghost { background: transparent; color: var(--muted2); border: 1px solid var(--border); }
        .nav-btn-ghost:hover { color: var(--text); border-color: var(--accent); }
        .nav-btn-primary { background: var(--accent); color: white; border: 1px solid transparent; }
        .nav-btn-primary:hover { background: var(--accent2); }
        .app-layout { display: grid; grid-template-columns: 320px 1fr; min-height: calc(100vh - 57px); }
        .sidebar { border-right: 1px solid var(--border); padding: 1.75rem 1.5rem; background: var(--bg2); display: flex; flex-direction: column; gap: 1.5rem; }
        .sidebar-title { font-size: 1.05rem; letter-spacing: -0.02em; margin-bottom: 0.2rem; }
        .sidebar-sub { font-size: 0.8rem; color: var(--muted2); font-weight: 300; line-height: 1.5; }
        .field-group { display: flex; flex-direction: column; gap: 0.45rem; }
        .field-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted2); }
        .field-input { background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 0.7rem 1rem; font-size: 0.88rem; font-weight: 400; color: var(--text); font-family: 'Inter', sans-serif; width: 100%; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: rgba(99,102,241,0.6); }
        .field-input::placeholder { color: var(--muted); }
        select.field-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235a6480' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; cursor: pointer; }
        select.field-input option { background: #0f1520; }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .chip { padding: 0.35rem 0.85rem; border-radius: 100px; font-size: 0.73rem; font-weight: 500; cursor: pointer; border: 1px solid var(--border); color: var(--muted2); transition: all 0.15s; background: transparent; font-family: 'Inter', sans-serif; }
        .chip:hover { border-color: rgba(99,102,241,0.4); color: var(--text); }
        .chip.active { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.4); color: #a78bfa; }
        .divider { height: 1px; background: var(--border); }
        .stats-box { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .stats-row { display: flex; justify-content: space-between; align-items: center; }
        .stats-label { font-size: 0.73rem; color: var(--muted2); }
        .stats-val { font-size: 0.8rem; font-weight: 600; }
        .stats-val.green { color: #34d399; }
        .stats-val.amber { color: #fbbf24; }
        .stats-val.dim { color: var(--muted2); }
        .btn-search { width: 100%; padding: 0.875rem; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 28px rgba(99,102,241,0.35); display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-search:hover { transform: translateY(-2px); box-shadow: 0 0 42px rgba(99,102,241,0.55); }
        .btn-search:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
        .results-panel { display: flex; flex-direction: column; background: var(--bg); }
        .results-topbar { padding: 1.1rem 1.75rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg2); flex-wrap: wrap; gap: 0.75rem; }
        .results-count { font-size: 0.82rem; color: var(--muted2); }
        .results-count strong { color: var(--text); font-weight: 600; }
        .results-actions { display: flex; gap: 0.65rem; align-items: center; }
        .sort-select { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 0.42rem 0.8rem; font-size: 0.76rem; color: var(--muted2); font-family: 'Inter', sans-serif; cursor: pointer; outline: none; }
        .export-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.42rem 0.95rem; border-radius: 8px; background: transparent; border: 1px solid var(--border); font-size: 0.76rem; color: var(--muted2); cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
        .export-btn:hover { border-color: var(--accent); color: var(--text); }
        .state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 5rem 2rem; gap: 1rem; }
        .state-icon { font-size: 3.5rem; opacity: 0.35; }
        .state-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--muted2); }
        .state-sub { font-size: 0.85rem; color: var(--muted); font-weight: 300; max-width: 300px; line-height: 1.6; }
        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.75rem; }
        .spinner { width: 52px; height: 52px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent); animation: spin 0.75s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-label { font-size: 0.92rem; font-weight: 500; color: var(--muted2); }
        .loading-steps { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; }
        .lstep { display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; font-weight: 300; color: var(--muted); opacity: 0.3; transition: all 0.4s; }
        .lstep.active { color: var(--muted2); opacity: 1; }
        .lstep.done { color: #34d399; opacity: 1; }
        .lstep-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
        .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 14px; padding: 1.25rem 1.5rem; max-width: 400px; text-align: left; }
        .error-title { font-size: 0.88rem; font-weight: 600; color: #f87171; margin-bottom: 0.35rem; }
        .error-msg { font-size: 0.78rem; color: var(--muted2); font-weight: 300; line-height: 1.6; }
        .leads-list { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 0.9rem; }
        .lead-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem 1.4rem; display: grid; grid-template-columns: 1fr auto; gap: 1.25rem; align-items: start; transition: border-color 0.2s, transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s; position: relative; overflow: hidden; opacity: 0; transform: translateY(14px); }
        .lead-card.visible { opacity: 1; transform: translateY(0); transition: opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, box-shadow 0.28s; }
        .lead-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent); opacity: 0; transition: opacity 0.25s; }
        .lead-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .lead-card:hover::before { opacity: 1; }
        .lead-top { display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
        .lead-name { font-family: 'Syne', sans-serif; font-size: 0.98rem; font-weight: 700; letter-spacing: -0.01em; }
        .lead-badge { display: flex; align-items: center; gap: 0.28rem; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; padding: 0.18rem 0.55rem; border-radius: 100px; flex-shrink: 0; }
        .badge-nosite { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; }
        .badge-noreviews { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); color: #fbbf24; }
        .lead-meta { display: flex; flex-wrap: wrap; gap: 0.5rem 1.1rem; margin-bottom: 0.75rem; }
        .lead-meta-item { display: flex; align-items: center; gap: 0.38rem; font-size: 0.76rem; color: var(--muted2); font-weight: 400; }
        .lead-tags { display: flex; flex-wrap: wrap; gap: 0.38rem; }
        .lead-tag { font-size: 0.65rem; font-weight: 500; padding: 0.16rem 0.55rem; border-radius: 100px; border: 1px solid var(--border); color: var(--muted2); }
        .tag-opp { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); color: #a78bfa; }
        .lead-actions { display: flex; flex-direction: column; gap: 0.5rem; min-width: 140px; }
        .lead-btn { padding: 0.52rem 0.88rem; border-radius: 9px; font-size: 0.76rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 0.38rem; white-space: nowrap; text-decoration: none; }
        .lead-btn-primary { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; box-shadow: 0 0 14px rgba(99,102,241,0.3); }
        .lead-btn-primary:hover { box-shadow: 0 0 22px rgba(99,102,241,0.5); transform: translateY(-1px); }
        .lead-btn-outline { background: transparent; color: var(--muted2); border: 1px solid var(--border); }
        .lead-btn-outline:hover { border-color: rgba(99,102,241,0.4); color: var(--text); }
        .lead-btn-ghost { background: transparent; color: var(--muted); border: 1px solid transparent; font-size: 0.7rem; }
        .lead-btn-ghost:hover { color: var(--muted2); }
        .lead-btn-ghost.saved { color: #34d399; }
        .load-more-wrap { padding: 0.5rem 1.75rem 2.5rem; display: flex; justify-content: center; }
        .load-more-btn { padding: 0.7rem 2rem; border-radius: 10px; background: transparent; border: 1px solid var(--border); color: var(--muted2); font-size: 0.82rem; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s; }
        .load-more-btn:hover { border-color: var(--accent); color: var(--text); }
        .modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); display: none; align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-overlay.open { display: flex; }
        .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; width: 100%; max-width: 600px; max-height: 88vh; overflow-y: auto; animation: modalIn 0.25s cubic-bezier(.22,.68,0,1.2); }
        @keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-header { padding: 1.4rem 1.65rem 1.2rem; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
        .modal-title { font-size: 1rem; font-weight: 700; letter-spacing: -0.01em; }
        .modal-sub { font-size: 0.75rem; color: var(--muted2); font-weight: 300; margin-top: 0.15rem; }
        .modal-close { width: 30px; height: 30px; border-radius: 7px; background: var(--bg3); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem; color: var(--muted2); transition: all 0.15s; flex-shrink: 0; }
        .modal-close:hover { color: var(--text); border-color: var(--accent); }
        .modal-body { padding: 1.4rem 1.65rem; }
        .tone-row { display: flex; gap: 0.45rem; margin-bottom: 1.25rem; }
        .tone-btn { padding: 0.32rem 0.8rem; border-radius: 100px; font-size: 0.73rem; font-weight: 500; border: 1px solid var(--border); color: var(--muted2); background: transparent; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s; }
        .tone-btn.active { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.4); color: #a78bfa; }
        .email-section { margin-bottom: 1rem; }
        .email-section-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 0.45rem; }
        .email-subject { background: var(--bg3); border: 1px solid var(--border); border-radius: 9px; padding: 0.7rem 0.9rem; font-size: 0.88rem; font-weight: 500; color: var(--text); }
        .email-body { background: var(--bg3); border: 1px solid var(--border); border-radius: 9px; padding: 0.9rem; font-size: 0.82rem; color: var(--muted2); font-weight: 300; line-height: 1.8; white-space: pre-line; }
        .email-body .hi { color: #a78bfa; font-weight: 500; }
        .modal-footer { padding: 1.2rem 1.65rem; border-top: 1px solid var(--border); display: flex; gap: 0.65rem; justify-content: flex-end; }
        .modal-btn { padding: 0.62rem 1.2rem; border-radius: 9px; font-size: 0.82rem; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s; }
        .modal-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted2); }
        .modal-btn-ghost:hover { border-color: var(--accent); color: var(--text); }
        .modal-btn-copy { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; box-shadow: 0 0 18px rgba(99,102,241,0.35); }
        .modal-btn-copy:hover { box-shadow: 0 0 28px rgba(99,102,241,0.55); transform: translateY(-1px); }
        @media (max-width: 900px) { .app-layout { grid-template-columns: 1fr; } .sidebar { border-right: none; border-bottom: 1px solid var(--border); } }
        @media (max-width: 600px) { .lead-card { grid-template-columns: 1fr; } .lead-actions { flex-direction: row; flex-wrap: wrap; } .results-topbar { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <nav>
        <div className="nav-left">
          <Link href="/" className="nav-logo">OutreachAI</Link>
          <div className="nav-divider"></div>
          <span className="nav-page">Lead Finder</span>
        </div>
        <div className="nav-right">
          <a href="#" className="nav-btn nav-btn-ghost">My Saved Leads</a>
          <a href="#" className="nav-btn nav-btn-primary">Upgrade →</a>
        </div>
      </nav>

      <div className="app-layout">
        <aside className="sidebar">
          <div>
            <h2 className="sidebar-title">Find Leads</h2>
            <p className="sidebar-sub">Enter a location and industry to find businesses missing a website — instant personalized outreach included.</p>
          </div>

          <div className="field-group">
            <label className="field-label">📍 Location</label>
            <input id="inp-location" type="text" className="field-input" placeholder="e.g. Chicago, IL" />
          </div>

          <div className="field-group">
            <label className="field-label">🏢 Industry</label>
            <select id="inp-industry" className="field-input">
              <option value="">Select an industry...</option>
              <option>Restaurants</option>
              <option>Dental Clinics</option>
              <option>Law Firms</option>
              <option>Auto Repair Shops</option>
              <option>Hair Salons</option>
              <option>Plumbers</option>
              <option>Gyms</option>
              <option>Real Estate Agents</option>
              <option>Accountants</option>
              <option>Retail Stores</option>
              <option>Cleaning Services</option>
              <option>Photographers</option>
              <option>Landscaping</option>
              <option>Pet Grooming</option>
            </select>
          </div>

          <div className="field-group">
            <label className="field-label">Quick Cities</label>
            <div className="filter-chips" id="city-chips">
              <button className="chip" data-city="New York, NY">New York</button>
              <button className="chip" data-city="Los Angeles, CA">LA</button>
              <button className="chip" data-city="Chicago, IL">Chicago</button>
              <button className="chip" data-city="Houston, TX">Houston</button>
              <button className="chip" data-city="Miami, FL">Miami</button>
              <button className="chip" data-city="Toronto, ON">Toronto</button>
            </div>
          </div>

          <div className="divider"></div>

          <div className="field-group">
            <label className="field-label">Filter by</label>
            <div className="filter-chips">
              <button className="chip active" data-filter="nowebsite">🌐 No Website</button>
              <button className="chip" data-filter="noreviews">⭐ No Reviews</button>
              <button className="chip" data-filter="lowrating">📉 Low Rating</button>
            </div>
          </div>

          <div className="stats-box" id="stats-box" style={{display:'none'}}>
            <div className="stats-row"><span className="stats-label">Leads found</span><span className="stats-val green" id="stat-total">—</span></div>
            <div className="stats-row"><span className="stats-label">With phone number</span><span className="stats-val dim" id="stat-phone">—</span></div>
            <div className="stats-row"><span className="stats-label">Scraped from Google</span><span className="stats-val dim" id="stat-scraped">—</span></div>
            <div className="stats-row"><span className="stats-label">Last run</span><span className="stats-val amber" id="stat-time">—</span></div>
          </div>

          <button className="btn-search" id="search-btn">
            <span id="btn-text">🔍 Find Leads</span>
          </button>
        </aside>

        <main className="results-panel" id="results-panel">
          <div className="results-topbar" id="results-topbar" style={{display:'none'}}>
            <span className="results-count" id="count-label">0 leads</span>
            <div className="results-actions">
              <select className="sort-select">
                <option value="default">Sort: No Website First</option>
                <option value="rating-desc">Highest Rating</option>
                <option value="rating-asc">Lowest Rating</option>
                <option value="reviews-desc">Most Reviews</option>
              </select>
              <button className="export-btn">⬇ Export CSV</button>
            </div>
          </div>

          <div className="state" id="state-empty">
            <div className="state-icon">🗺️</div>
            <div className="state-title">No search yet</div>
            <div className="state-sub">Enter a location and industry to find businesses with no website — ready to outreach.</div>
          </div>

          <div className="state" id="state-loading" style={{display:'none'}}>
            <div className="loading-wrap">
              <div className="spinner"></div>
              <div className="loading-label" id="loading-label">Starting scraper...</div>
              <div className="loading-steps">
                <div className="lstep" id="ls1"><div className="lstep-dot"></div>Connecting to Apify</div>
                <div className="lstep" id="ls2"><div className="lstep-dot"></div>Scraping Google Maps</div>
                <div className="lstep" id="ls3"><div className="lstep-dot"></div>Filtering results</div>
                <div className="lstep" id="ls4"><div className="lstep-dot"></div>Pulling contact details</div>
                <div className="lstep" id="ls5"><div className="lstep-dot"></div>Building your lead list</div>
              </div>
            </div>
          </div>

          <div className="state" id="state-error" style={{display:'none'}}>
            <div className="state-icon">⚠️</div>
            <div className="error-box">
              <div className="error-title">Something went wrong</div>
              <div className="error-msg" id="error-msg">Unknown error. Please try again.</div>
            </div>
          </div>

          <div id="leads-list" className="leads-list" style={{display:'none'}}></div>
          <div className="load-more-wrap" id="load-more-wrap" style={{display:'none'}}>
            <button className="load-more-btn">Load more leads</button>
          </div>
        </main>
      </div>

      <div className="modal-overlay" id="modal">
        <div className="modal">
          <div className="modal-header">
            <div>
              <div className="modal-title" id="modal-title">Outreach Email</div>
              <div className="modal-sub" id="modal-sub">AI-generated · personalized outreach</div>
            </div>
            <button className="modal-close" data-close-modal>✕</button>
          </div>
          <div className="modal-body">
            <div className="tone-row">
              <button className="tone-btn active" data-tone="direct">Direct</button>
              <button className="tone-btn" data-tone="casual">Casual</button>
              <button className="tone-btn" data-tone="bold">Bold</button>
            </div>
            <div className="email-section">
              <div className="email-section-label">Subject Line</div>
              <div className="email-subject" id="modal-subject"></div>
            </div>
            <div className="email-section">
              <div className="email-section-label">Email Body</div>
              <div className="email-body" id="modal-body"></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn modal-btn-ghost" data-close-modal>Close</button>
            <button className="modal-btn modal-btn-ghost" id="regen-btn">↺ Regenerate</button>
            <button className="modal-btn modal-btn-copy" id="copy-btn">📋 Copy Email</button>
          </div>
        </div>
      </div>
    </>
  );
}
