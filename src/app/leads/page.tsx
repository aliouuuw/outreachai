"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// ----------------------------------------------------------------------
// Types & Constants
// ----------------------------------------------------------------------
interface Lead {
  name: string;
  address: string;
  city: string;
  phone: string | null;
  rating: number | null;
  reviews: number;
  category: string;
  website: string | null;
  mapsUrl: string | null;
  placeId: string | null;
}

type FilterType = "nowebsite" | "noreviews" | "lowrating" | "all";
type ToneType = "direct" | "casual" | "bold";

const INDUSTRY_OPTIONS = [
  { value: "Restaurants", label: "Restaurants" },
  { value: "Dental Clinics", label: "Dental Clinics" },
  { value: "Law Firms", label: "Law Firms" },
  { value: "Auto Repair Shops", label: "Auto Repair Shops" },
  { value: "Hair Salons", label: "Hair Salons" },
  { value: "Plumbers", label: "Plumbers" },
  { value: "Gyms", label: "Gyms" },
  { value: "Real Estate Agents", label: "Real Estate Agents" },
  { value: "Accountants", label: "Accountants" },
  { value: "Retail Stores", label: "Retail Stores" },
  { value: "Cleaning Services", label: "Cleaning Services" },
  { value: "Photographers", label: "Photographers" },
  { value: "Landscaping", label: "Landscaping" },
  { value: "Pet Grooming", label: "Pet Grooming" },
];

const emailTemplates: Record<ToneType, { subject: (n: string) => string; body: (n: string, cat: string) => string }> = {
  direct: {
    subject: (n) => `${n} — your business is invisible online`,
    body: (n, cat) => `Hi there,\n\nI searched for ${(cat || "businesses").toLowerCase()} in your area and found ${n} on Google Maps — but you have no website.\n\nThat means when customers Google "${(cat || "your service").toLowerCase()} near me," they find your competitors instead of you.\n\nA simple, clean website would:\n• Put you in front of customers actively searching\n• Show your hours, location, and services instantly\n• Start generating leads while you sleep\n\nI build websites for local businesses starting at $499, live in 7 days.\n\nWorth a 10-minute call?\n\n[Your Name]`,
  },
  casual: {
    subject: (n) => `Quick question about ${n}`,
    body: (n, cat) => `Hey!\n\nFound ${n} on Google Maps while looking at local ${(cat || "businesses").toLowerCase()} — love what you've got going on.\n\nOne thing I noticed: no website. In 2025 that's honestly leaving a ton of customers on the table, especially people searching on their phones.\n\nI help local businesses get a fast, clean site up — usually under a week. Nothing complicated, just something that works and ranks on Google.\n\nGot 10 minutes this week to chat?\n\n[Your Name]`,
  },
  bold: {
    subject: (n) => `${n} is losing customers every day`,
    body: (n, cat) => `Let me be straight with you:\n\n${n} has no website. Every day, customers searching for ${(cat || "your service").toLowerCase()} online find your competitors — not you.\n\nI build websites specifically for local businesses. Most of my clients start getting new inquiries within 2 weeks of going live.\n\nNo bloated agency fees. No 3-month timelines. Just a fast, focused site that gets you found.\n\nIf you want to see what I'd build for ${n}, reply and I'll send a free mockup.\n\n[Your Name]`,
  },
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
export default function LeadsPage() {
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [filter, setFilter] = useState<FilterType>("nowebsite");
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(50);
  const [scrapedCount, setScrapedCount] = useState(0);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [tone, setTone] = useState<ToneType>("direct");
  const [savedLeads, setSavedLeads] = useState<Set<number>>(new Set());

  // Data processing
  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (filter === "nowebsite") {
      result = result.filter((l) => !l.website || l.website.trim() === "");
    } else if (filter === "noreviews") {
      result = result.filter((l) => !l.reviews || l.reviews === 0);
    } else if (filter === "lowrating") {
      result = result.filter((l) => l.rating && l.rating < 3.5);
    }
    return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [leads, filter]);

  const visibleLeads = filteredLeads.slice(0, visibleCount);
  const hasMore = visibleCount < filteredLeads.length;

  const loadMore = () => setVisibleCount((c) => c + 50);

  // Handlers
  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Location parameter is required.");
      return;
    }
    if (!industry) {
      setError("Industry parameter is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setLeads([]);
    setVisibleCount(50);

    try {
      const params = new URLSearchParams({ location, industry, filter });
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Network request failed");

      setLeads(data.leads || []);
      setScrapedCount(data.scraped || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "System fault");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Address", "Phone", "Rating", "Reviews", "Category", "Maps URL"];
    const rows = filteredLeads.map((l) => [
      l.name, l.address, l.phone || "", l.rating || "", l.reviews || "", l.category || "", l.mapsUrl || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `outreachai-target-data-${new Date().getTime()}.csv`;
    a.click();
  };

  const toggleSave = (index: number) => {
    setSavedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Email derived state
  const currentEmail = modalLead ? emailTemplates[tone] : null;
  const emailSubject = currentEmail && modalLead ? currentEmail.subject(modalLead.name) : "";
  const emailBody = currentEmail && modalLead ? currentEmail.body(modalLead.name, modalLead.category) : "";

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-inter">
      {/* GLOBAL NAVBAR */}
      <nav className="h-14 px-6 border-b border-border bg-bg2 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[15px] tracking-tight text-white font-syne font-extrabold hover:text-accent transition-colors">
            OutreachAI
          </Link>
          <div className="w-px h-4 bg-border" />
          <span className="text-[11px] font-semibold text-muted uppercase tracking-widest">
            Data Matrix Terminal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-muted2">SYS.OK</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-green">Online</span>
          </div>
        </div>
      </nav>

      {/* COMMAND RIBBON (Top Control Bar) */}
      <div className="bg-bg border-b border-border shrink-0 z-40">
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex items-end gap-3">
            
            {/* Input Group: Location */}
            <div className="flex flex-col gap-1.5 flex-1 max-w-[300px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Location Vector</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  📍
                </div>
                <input
                  type="text"
                  placeholder="e.g. Austin, TX"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-bg3 border border-border rounded-none px-3 py-2 pl-9 text-[13px] text-text outline-none focus:border-accent transition-colors font-mono"
                />
              </div>
            </div>

            {/* Input Group: Industry */}
            <div className="flex flex-col gap-1.5 flex-1 max-w-[250px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Industry Segment</label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-bg3 border border-border rounded-none px-3 py-2 text-[13px] text-text outline-none focus:border-accent transition-colors font-mono appearance-none"
                >
                  <option value="" disabled>Select sector...</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted2">
                  ▼
                </div>
              </div>
            </div>

            {/* Input Group: Signal Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Signal Strictness</label>
              <div className="flex h-[38px] bg-bg3 border border-border rounded-none p-1">
                {[
                  { id: "all", label: "ALL" },
                  { id: "nowebsite", label: "NO WEB" },
                  { id: "noreviews", label: "NO REV" },
                  { id: "lowrating", label: "LOW RTG" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as FilterType)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      filter === f.id
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-muted hover:text-text border border-transparent"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="h-[38px] px-6 bg-text text-bg text-[11px] font-extrabold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border border-bg border-t-transparent rounded-full animate-spin" />
                    Scanning
                  </>
                ) : (
                  "Execute Scan"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Data summary bar (only if searched) */}
        {hasSearched && !loading && !error && leads.length > 0 && (
          <div className="px-6 py-2 border-t border-border bg-bg3 flex items-center justify-between">
            <div className="flex items-center gap-6 text-[11px] font-mono text-muted2">
              <span>Targets Extracted: <strong className="text-text font-semibold">{leads.length}</strong></span>
              <span>Scrape Depth: <strong className="text-text font-semibold">{scrapedCount}</strong> nodes</span>
              <span>Filtered View: <strong className="text-accent font-semibold">{visibleLeads.length}</strong></span>
            </div>
            <div>
              <button 
                onClick={exportCSV}
                className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text transition-colors flex items-center gap-1.5"
              >
                ↓ Export Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DATA WORKSPACE (Table/Grid) */}
      <div className="flex-1 overflow-auto bg-bg relative">
        
        {/* Empty State */}
        {!hasSearched && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 border border-border/50 bg-bg2 flex items-center justify-center mb-4 text-muted/30 text-2xl font-mono">
                [ ]
              </div>
              <div className="text-[13px] font-mono text-muted">Awaiting scan parameters...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border border-red/30 bg-red/5 px-6 py-4 max-w-md">
              <div className="text-[11px] font-bold uppercase tracking-widest text-red mb-1">System Error</div>
              <div className="text-[13px] font-mono text-red/80">{error}</div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/80 backdrop-blur-[2px] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border border-border border-t-accent rounded-full animate-spin" />
              <div className="text-[10px] font-mono text-accent uppercase tracking-widest animate-pulse">Processing Nodes...</div>
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !loading && !error && visibleLeads.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-[13px] font-mono text-muted text-center">
                Query returned 0 viable targets.<br/>
                Adjust vectors and retry.
             </div>
          </div>
        )}

        {/* Dense Table Layout */}
        {hasSearched && !loading && !error && visibleLeads.length > 0 && (
          <div className="min-w-[1000px] w-full pb-10">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_2.5fr_2fr_1.5fr_180px] gap-4 px-6 py-2.5 border-b border-border bg-bg2 sticky top-0 z-20">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted w-[80px]">Signals</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Target Entity</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Coordinates</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Metrics</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted text-right">Terminal Action</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col">
              {visibleLeads.map((lead, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-[auto_2.5fr_2fr_1.5fr_180px] gap-4 px-6 py-3 border-b border-border/40 hover:bg-bg3/50 transition-colors items-center group"
                >
                  {/* Signals */}
                  <div className="w-[80px] flex flex-col gap-1">
                    {!lead.website && (
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red/10 text-red border border-red/20 w-fit">No Web</span>
                    )}
                    {!lead.reviews && (
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber/10 text-amber border border-amber/20 w-fit">No Rev</span>
                    )}
                    {lead.rating && lead.rating < 3.5 && (
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 w-fit">Low Rtg</span>
                    )}
                    {lead.website && lead.reviews > 0 && (!lead.rating || lead.rating >= 3.5) && (
                      <span className="inline-block text-[10px] text-muted">--</span>
                    )}
                  </div>

                  {/* Target Entity */}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-semibold text-text truncate" title={lead.name}>{lead.name}</span>
                    <span className="text-[11px] text-muted truncate">{lead.category || "Uncategorized"}</span>
                  </div>

                  {/* Coordinates */}
                  <div className="flex flex-col overflow-hidden text-[12px] font-mono">
                    <span className="text-muted2 truncate" title={lead.address}>{lead.address || "Unknown Loc"}</span>
                    <span className="text-muted truncate">{lead.phone || "No Phone"}</span>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col text-[12px] font-mono">
                    {lead.rating ? (
                      <span className="text-text">
                        ★ {lead.rating} <span className="text-muted">({lead.reviews})</span>
                      </span>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </div>

                  {/* Terminal Actions */}
                  <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleSave(idx)}
                      className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                        savedLeads.has(idx)
                          ? "bg-green/10 border-green/30 text-green"
                          : "bg-bg border-border text-muted hover:text-text hover:border-muted"
                      }`}
                      title="Save Target"
                    >
                      {savedLeads.has(idx) ? "★" : "☆"}
                    </button>
                    {lead.mapsUrl && (
                      <a
                        href={lead.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 flex items-center justify-center bg-bg border border-border text-muted hover:text-text hover:border-muted transition-colors"
                        title="View Maps Data"
                      >
                        ↗
                      </a>
                    )}
                    <button
                      onClick={() => setModalLead(lead)}
                      className="h-7 px-3 bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors"
                    >
                      Pitch
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button 
                  onClick={loadMore}
                  className="px-6 py-2 border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text hover:border-muted transition-colors"
                >
                  Load Next Batch
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Pitch Generator */}
      <Modal
        isOpen={!!modalLead}
        onClose={() => setModalLead(null)}
        title="Outreach Synthesizer"
        subtitle={`Target: ${modalLead?.name}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-mono text-muted">Awaiting copy action...</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setModalLead(null)} 
                className="px-4 py-2 border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:text-text"
              >
                Close
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)}
                className="px-4 py-2 bg-text text-bg border border-text text-[11px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-text transition-colors"
              >
                Copy Data
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Tone selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Linguistic Tone</label>
            <div className="flex h-8 bg-bg3 border border-border rounded-none p-1 w-fit">
              {(["direct", "casual", "bold"] as ToneType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    tone === t 
                      ? "bg-bg border border-border text-text" 
                      : "text-muted hover:text-text border border-transparent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Subject Line</label>
            <div className="bg-bg border border-border px-3 py-2 text-[13px] font-mono text-text">
              {emailSubject}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Body Content</label>
              <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">
                Regenerate
              </button>
            </div>
            <div className="bg-bg border border-border px-3 py-3 text-[13px] font-mono text-muted2 whitespace-pre-wrap leading-relaxed min-h-[150px]">
              {emailBody}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
