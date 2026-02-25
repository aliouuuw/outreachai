"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { 
  MapPin, 
  Building2, 
  Globe, 
  Star, 
  TrendingDown, 
  Search, 
  Phone, 
  Mail, 
  Map, 
  Bookmark, 
  BookmarkCheck,
  AlertTriangle,
  RotateCcw,
  Copy,
  X
} from "lucide-react";

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
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\\n");
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
    <div className="h-screen bg-bg text-text flex flex-col font-inter selection:bg-accent/30 overflow-hidden">
      {/* Navbar -> Header to avoid global nav fixed positioning issues */}
      <header className="flex-none flex items-center justify-between px-8 py-5 border-b border-border bg-bg/80 backdrop-blur-xl z-50 relative">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl tracking-tight bg-gradient-to-r from-accent to-a78bfa bg-clip-text text-transparent font-syne font-bold">
            OutreachAI
          </Link>
          <div className="w-px h-5 bg-border" />
          <span className="text-sm font-medium text-muted2 uppercase tracking-widest">Lead Matrix</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="font-medium text-xs uppercase tracking-wider">Saved Leads</Button>
          <Button variant="primary" size="sm" className="font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.2)]">Upgrade Pro</Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Command Panel (Sidebar) */}
        <aside className="w-[340px] flex-none border-r border-border bg-bg2 flex flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.2)] h-full">
          <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
            <div className="space-y-5">
              <Input
                label="Location Vector"
                placeholder="City, State (e.g. Austin, TX)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />

              <Select
                label="Industry Vertical"
                options={INDUSTRY_OPTIONS}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Quick Deploy</label>
                <div className="flex flex-wrap gap-1.5">
                  {CITIES.map((city) => (
                    <button
                      key={city.value}
                      onClick={() => setLocation(city.value)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        location === city.value
                          ? "bg-accent/15 text-a78bfa border border-accent/30"
                          : "bg-bg3 border border-border text-muted2 hover:border-accent/40 hover:text-text"
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border flex-none" />

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted2">Signal Filters</label>
              <div className="flex flex-col gap-2">
                {[
                  { id: "nowebsite", icon: <Globe size={14} />, label: "No Website" },
                  { id: "noreviews", icon: <Star size={14} />, label: "No Reviews" },
                  { id: "lowrating", icon: <TrendingDown size={14} />, label: "Low Rating" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as FilterType)}
                    className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 ${
                      filter === f.id
                        ? "bg-gradient-to-r from-accent to-a78bfa text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-accent/50"
                        : "bg-bg3 border border-border text-muted2 hover:border-accent/50 hover:text-text"
                    }`}
                  >
                    <span className={filter === f.id ? "text-white" : "text-accent/70"}>{f.icon}</span> 
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {hasSearched && !loading && leads.length > 0 && (
              <div className="bg-bg border border-border rounded-xl p-4 flex flex-col gap-2.5 relative overflow-hidden mt-2 flex-none">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted2">Total Signals</span>
                  <span className="text-xs font-bold text-text">{leads.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted2">Contactable</span>
                  <span className="text-xs font-bold text-text">{leads.filter((l) => l.phone).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted2">Scrape Depth</span>
                  <span className="text-xs font-bold text-text">{scrapedCount}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-none p-6 border-t border-border bg-bg2/95 backdrop-blur-md z-10">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-br from-accent to-accent2 text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none border border-accent/50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Initiate Scan
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 relative overflow-y-auto bg-bg h-full">
          {/* Engineered Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }} 
          />

          <div className="relative z-10 max-w-6xl mx-auto min-h-full flex flex-col">
            {/* Top Bar */}
            {hasSearched && !loading && leads.length > 0 && (
              <div className="flex items-center justify-between px-10 py-4 border-b border-border/50 bg-bg/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  <span className="text-xs font-medium text-muted2 uppercase tracking-widest">
                    Displaying <strong className="text-text">{visibleLeads.length}</strong> / {filteredLeads.length} results
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <select className="bg-bg3 border border-border rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted2 cursor-pointer outline-none focus:border-accent/50 transition-colors">
                    <option>Sort: Relevance</option>
                    <option>Highest Rating</option>
                    <option>Lowest Rating</option>
                    <option>Most Reviews</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={exportCSV} className="text-[10px] font-bold uppercase tracking-widest h-[34px]">
                    Export CSV
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 p-8 md:p-12">
              {/* Empty State */}
              {!hasSearched && (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto pt-20">
                  <div className="w-20 h-20 rounded-full bg-bg3 border border-border flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(99,102,241,0.05)]">
                    <Search className="w-8 h-8 text-muted opacity-50" />
                  </div>
                  <h3 className="text-xl font-syne font-bold text-text mb-3 tracking-wide">Awaiting Parameters</h3>
                  <p className="text-sm text-muted2 font-light leading-relaxed">
                    Input a location and industry vector in the command panel to begin scanning for high-probability targets.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center h-full gap-6 mt-32">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-border border-t-accent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-border border-b-a78bfa rounded-full animate-spin-reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">
                    Scanning Network...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex flex-col items-center justify-center h-full mt-20">
                  <div className="bg-red/5 border border-red/20 rounded-2xl p-8 max-w-sm text-center backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red/50" />
                    <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-6 h-6 text-red" />
                    </div>
                    <div className="text-base font-syne font-bold text-red mb-2">Scan Failed</div>
                    <div className="text-xs text-red/70 font-light leading-relaxed">{error}</div>
                  </div>
                </div>
              )}

              {/* No Results */}
              {hasSearched && !loading && !error && visibleLeads.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto mt-20">
                  <div className="w-20 h-20 rounded-full bg-bg3 border border-border flex items-center justify-center mb-6">
                    <X className="w-8 h-8 text-muted opacity-50" />
                  </div>
                  <h3 className="text-xl font-syne font-bold text-text mb-3 tracking-tight">Zero Signals Found</h3>
                  <p className="text-sm text-muted2 font-light leading-relaxed">
                    The current parameters yielded no targets. Adjust your location or filter vectors.
                  </p>
                </div>
              )}

              {/* Results Grid */}
              {visibleLeads.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {visibleLeads.map((lead, idx) => (
                    <div
                      key={idx}
                      className="group bg-bg2 border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-accent/40 hover:bg-bg3 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Hover Gradient Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                      
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-base font-syne font-bold text-text tracking-tight">{lead.name}</h4>
                          {filter === "nowebsite" && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-red/10 text-red border border-red/20 rounded flex items-center gap-1">
                              <Globe size={10} /> No Site
                            </span>
                          )}
                          {filter === "noreviews" && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-amber/10 text-amber border border-amber/20 rounded flex items-center gap-1">
                              <Star size={10} /> No Reviews
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-muted2 font-light">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-accent/70" />
                            <span className="truncate" title={lead.address}>{lead.address || "Unknown location"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-accent/70" />
                            {lead.phone ? <span className="font-mono text-text/90">{lead.phone}</span> : <span className="italic opacity-50">No phone listed</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Star size={12} className="text-accent/70" />
                            {lead.rating ? (
                              <span><strong className="text-text/90 font-medium">{lead.rating}</strong> ({lead.reviews} reviews)</span>
                            ) : (
                              <span className="italic opacity-50">No rating data</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 size={12} className="text-accent/70" />
                            <span className="truncate" title={lead.category}>{lead.category || "Uncategorized"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 min-w-[150px] relative z-10">
                        <button
                          onClick={() => setModalLead(lead)}
                          className="w-full py-2 px-4 bg-accent/10 hover:bg-accent hover:text-white border border-accent/30 text-accent rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                          <Mail size={12} /> Generate Pitch
                        </button>
                        
                        <div className="flex items-center gap-2.5 w-full">
                          {lead.mapsUrl ? (
                            <a
                              href={lead.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider border border-border rounded-lg text-muted2 hover:border-text/30 hover:text-text transition-colors"
                            >
                              <Map size={12} /> Maps
                            </a>
                          ) : (
                            <div className="flex-1" />
                          )}
                          <button
                            onClick={() => toggleSave(idx)}
                            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider border rounded-lg transition-colors ${
                              savedLeads.has(idx)
                                ? "bg-green/10 border-green/30 text-green"
                                : "border-border text-muted2 hover:border-text/30 hover:text-text"
                            }`}
                          >
                            {savedLeads.has(idx) ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                            {savedLeads.has(idx) ? "Saved" : "Save"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="flex justify-center pt-8 pb-4">
                      <Button variant="outline" onClick={loadMore} className="font-semibold uppercase tracking-widest text-[10px] px-8 py-2.5">
                        Load Additional Targets
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Engineered Email Modal */}
      <Modal
        isOpen={!!modalLead}
        onClose={() => setModalLead(null)}
        title="Outreach Synthesis"
        subtitle={`Target: ${modalLead?.name} // Tone: ${tone.toUpperCase()}`}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={() => setModalLead(null)} className="flex-1 text-[10px] font-bold uppercase tracking-widest py-2">Abort</Button>
            <Button 
              className="flex-[2] text-[10px] font-bold uppercase tracking-widest py-2 bg-gradient-to-r from-accent to-a78bfa text-white border-none shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
              onClick={() => {
                navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
              }}
            >
              <Copy size={14} /> Copy to Clipboard
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted2">Tone Selector</span>
            <div className="flex gap-1.5 bg-bg3 p-1 rounded-lg border border-border w-fit">
              {(["direct", "casual", "bold"] as ToneType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    tone === t 
                      ? "bg-bg border border-border text-text shadow-sm" 
                      : "text-muted hover:text-muted2"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-bg2 border border-border p-4 rounded-xl shadow-inner">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Subject</div>
              <div className="bg-bg border border-border rounded-lg px-4 py-2.5 text-xs font-medium text-text">{emailSubject}</div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 flex justify-between items-center">
                <span>Body</span>
                <button className="text-muted font-bold uppercase tracking-wider flex items-center gap-1 hover:text-accent transition-colors text-[9px]">
                  <RotateCcw size={10} /> Regenerate
                </button>
              </div>
              <div className="bg-bg border border-border rounded-lg px-4 py-3.5 text-xs text-muted2 font-light leading-relaxed whitespace-pre-wrap">
                {emailBody.split(modalLead?.name || "").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="text-a78bfa font-medium bg-a78bfa/10 px-1 rounded">{modalLead?.name}</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

