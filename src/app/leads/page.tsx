"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

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

type FilterType = "nowebsite" | "noreviews" | "lowrating";
type ToneType = "direct" | "casual" | "bold";

const INDUSTRY_OPTIONS = [
  { value: "", label: "Select an industry..." },
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

const CITIES = [
  { value: "New York, NY", label: "New York" },
  { value: "Los Angeles, CA", label: "LA" },
  { value: "Chicago, IL", label: "Chicago" },
  { value: "Houston, TX", label: "Houston" },
  { value: "Miami, FL", label: "Miami" },
  { value: "Toronto, ON", label: "Toronto" },
];

const emailTemplates: Record<ToneType, { subject: (n: string) => string; body: (n: string, cat: string) => string }> = {
  direct: {
    subject: (n) => `${n} — your business is invisible online`,
    body: (n, cat) => `Hi there,

I searched for ${(cat || "businesses").toLowerCase()} in your area and found ${n} on Google Maps — but you have no website.

That means when customers Google "${(cat || "your service").toLowerCase()} near me," they find your competitors instead of you.

A simple, clean website would:
• Put you in front of customers actively searching
• Show your hours, location, and services instantly
• Start generating leads while you sleep

I build websites for local businesses starting at $499, live in 7 days.

Worth a 10-minute call?

[Your Name]`,
  },
  casual: {
    subject: (n) => `Quick question about ${n}`,
    body: (n, cat) => `Hey!

Found ${n} on Google Maps while looking at local ${(cat || "businesses").toLowerCase()} — love what you've got going on.

One thing I noticed: no website. In 2025 that's honestly leaving a ton of customers on the table, especially people searching on their phones.

I help local businesses get a fast, clean site up — usually under a week. Nothing complicated, just something that works and ranks on Google.

Got 10 minutes this week to chat?

[Your Name]`,
  },
  bold: {
    subject: (n) => `${n} is losing customers every day`,
    body: (n, cat) => `Let me be straight with you:

${n} has no website. Every day, customers searching for ${(cat || "your service").toLowerCase()} online find your competitors — not you.

I build websites specifically for local businesses. Most of my clients start getting new inquiries within 2 weeks of going live.

No bloated agency fees. No 3-month timelines. Just a fast, focused site that gets you found.

If you want to see what I'd build for ${n}, reply and I'll send a free mockup.

[Your Name]`,
  },
};

export default function LeadsPage() {
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [filter, setFilter] = useState<FilterType>("nowebsite");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [scrapedCount, setScrapedCount] = useState(0);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [tone, setTone] = useState<ToneType>("direct");
  const [savedLeads, setSavedLeads] = useState<Set<number>>(new Set());

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

  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }
    if (!industry) {
      setError("Please select an industry");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setLeads([]);
    setVisibleCount(20);

    try {
      const params = new URLSearchParams({ location, industry, filter });
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setLeads(data.leads || []);
      setScrapedCount(data.scraped || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => setVisibleCount((c) => c + 20);

  const exportCSV = () => {
    const headers = ["Name", "Address", "Phone", "Rating", "Reviews", "Category", "Maps URL"];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.address,
      l.phone || "",
      l.rating || "",
      l.reviews || "",
      l.category || "",
      l.mapsUrl || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "outreachai-leads.csv";
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

  const currentEmail = modalLead ? emailTemplates[tone] : null;
  const emailSubject = currentEmail && modalLead ? currentEmail.subject(modalLead.name) : "";
  const emailBody = currentEmail && modalLead ? currentEmail.body(modalLead.name, modalLead.category) : "";

  return (
    <>
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg tracking-tight bg-gradient-to-r from-accent to-a78bfa bg-clip-text text-transparent font-syne font-extrabold">
            OutreachAI
          </Link>
          <div className="w-px h-4 bg-border" />
          <span className="text-sm text-muted2">Lead Finder</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">My Saved Leads</Button>
          <Button variant="primary" size="sm">Upgrade →</Button>
        </div>
      </nav>

      <div className="grid grid-cols-[320px_1fr] min-h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <aside className="border-r border-border py-7 px-6 bg-bg2 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-syne font-extrabold mb-2">Find Leads</h2>
            <p className="text-xs text-muted2 font-light leading-relaxed">
              Enter a location and industry to find businesses missing a website — instant personalized outreach included.
            </p>
          </div>

          <Input
            label="📍 Location"
            placeholder="e.g. Chicago, IL"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <Select
            label="🏢 Industry"
            options={INDUSTRY_OPTIONS}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted2">Quick Cities</label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <Chip
                  key={city.value}
                  active={location === city.value}
                  onClick={() => setLocation(city.value)}
                >
                  {city.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-border" />

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted2">Filter by</label>
            <div className="flex flex-wrap gap-2">
              <Chip active={filter === "nowebsite"} onClick={() => setFilter("nowebsite")}>
                🌐 No Website
              </Chip>
              <Chip active={filter === "noreviews"} onClick={() => setFilter("noreviews")}>
                ⭐ No Reviews
              </Chip>
              <Chip active={filter === "lowrating"} onClick={() => setFilter("lowrating")}>
                📉 Low Rating
              </Chip>
            </div>
          </div>

          {hasSearched && !loading && leads.length > 0 && (
            <div className="bg-bg3 border border-border rounded-xl p-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[0.73rem] text-muted2">Leads found</span>
                <span className="text-[0.8rem] font-semibold text-[#34d399]">{leads.length} leads</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.73rem] text-muted2">With phone number</span>
                <span className="text-[0.8rem] font-semibold text-muted2">{leads.filter((l) => l.phone).length} / {leads.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.73rem] text-muted2">Scraped from Google</span>
                <span className="text-[0.8rem] font-semibold text-muted2">{scrapedCount} businesses</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.73rem] text-muted2">Last run</span>
                <span className="text-[0.8rem] font-semibold text-amber">Just now</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-br from-accent to-accent2 text-white border-none rounded-xl text-[0.95rem] font-semibold font-inter cursor-pointer transition-all duration-200 shadow-[0_0_28px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(99,102,241,0.55)] disabled:opacity-55 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? "Searching..." : "🔍 Find Leads"}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar */}
          {hasSearched && !loading && leads.length > 0 && (
            <div className="flex items-center justify-between px-7 py-4 border-b border-border bg-bg2">
              <span className="text-xs text-muted2">
                Showing <strong className="text-text">{visibleLeads.length}</strong> of <strong className="text-text">{filteredLeads.length}</strong> leads
              </span>
              <div className="flex items-center gap-3">
                <select className="bg-bg3 border border-border rounded-lg px-3 py-2 text-xs text-muted2 cursor-pointer">
                  <option>Sort: No Website First</option>
                  <option>Highest Rating</option>
                  <option>Lowest Rating</option>
                  <option>Most Reviews</option>
                </select>
                <Button variant="secondary" size="sm" onClick={exportCSV}>
                  ⬇ Export CSV
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center h-full text-center p-20">
              <div className="text-5xl opacity-35 mb-4">🗺️</div>
              <h3 className="text-lg font-syne font-bold text-muted2 mb-2">No search yet</h3>
              <p className="text-sm text-muted font-light max-w-xs">
                Enter a location and industry to find businesses with no website — ready to outreach.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-14 h-14 border-2 border-border border-t-accent rounded-full animate-spin" />
              <div className="text-sm text-muted2 font-medium">Searching for leads...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center h-full p-20">
              <div className="text-5xl opacity-35 mb-4">⚠️</div>
              <div className="bg-red/10 border border-red/25 rounded-xl p-5 max-w-md text-left">
                <div className="text-sm font-semibold text-red mb-1">Something went wrong</div>
                <div className="text-xs text-muted2 font-light">{error}</div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasSearched && !loading && !error && visibleLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-20">
              <div className="text-5xl opacity-35 mb-4">🔍</div>
              <h3 className="text-lg font-syne font-bold text-muted2 mb-2">No leads found</h3>
              <p className="text-sm text-muted font-light">Try a different location or industry.</p>
            </div>
          )}

          {/* Leads List */}
          {visibleLeads.length > 0 && (
            <div className="p-6 flex flex-col gap-4">
              {visibleLeads.map((lead, idx) => (
                <div
                  key={idx}
                  className="bg-bg2 border border-border rounded-2xl p-5 flex justify-between gap-5 hover:border-accent/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-syne font-bold">{lead.name}</h4>
                      {filter === "nowebsite" && <Badge variant="nosite">🌐 No Website</Badge>}
                      {filter === "noreviews" && <Badge variant="noreviews">⭐ No Reviews</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted2">
                      {lead.address && <span>📍 {lead.address}</span>}
                      <span>📞 {lead.phone || "No phone listed"}</span>
                      <span>
                        {lead.rating ? `⭐ ${lead.rating}` : "⭐ No rating"} ({lead.reviews || 0} reviews)
                      </span>
                      {lead.category && <span>🏢 {lead.category}</span>}
                    </div>
                    <div className="mt-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-accent/10 border-accent/25 text-[#a78bfa]">
                        💡 Web Design Opportunity
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Button size="sm" onClick={() => setModalLead(lead)}>
                      ✉️ Generate Email
                    </Button>
                    {lead.mapsUrl && (
                      <a
                        href={lead.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center px-3 py-2 text-xs font-medium border border-border rounded-lg text-muted2 hover:border-accent/50 hover:text-text transition-colors"
                      >
                        🗺 View on Maps
                      </a>
                    )}
                    <button
                      onClick={() => toggleSave(idx)}
                      className={`text-xs py-2 px-3 rounded-lg transition-colors ${
                        savedLeads.has(idx)
                          ? "text-green bg-green/10"
                          : "text-muted hover:text-muted2"
                      }`}
                    >
                      {savedLeads.has(idx) ? "✓ Saved" : "🔖 Save Lead"}
                    </button>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="secondary" onClick={loadMore}>
                    Load more leads
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Email Modal */}
      <Modal
        isOpen={!!modalLead}
        onClose={() => setModalLead(null)}
        title="Outreach Email"
        subtitle={`${tone} tone · no website pitch · ready to send`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalLead(null)}>Close</Button>
            <Button variant="ghost" onClick={() => {}}>↺ Regenerate</Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
              }}
            >
              📋 Copy Email
            </Button>
          </>
        }
      >
        <div className="flex gap-2 mb-5">
          {(["direct", "casual", "bold"] as ToneType[]).map((t) => (
            <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Chip>
          ))}
        </div>
        <div className="mb-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Subject Line</div>
          <div className="bg-bg3 border border-border rounded-lg px-4 py-3 text-sm">{emailSubject}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Email Body</div>
          <div className="bg-bg3 border border-border rounded-lg px-4 py-3 text-sm text-muted2 font-light whitespace-pre-line">
            {emailBody.split(modalLead?.name || "").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="text-[#a78bfa] font-medium">{modalLead?.name}</span>}
              </span>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
