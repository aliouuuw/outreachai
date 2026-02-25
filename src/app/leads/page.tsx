"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, ChevronDown, Download, ExternalLink, Star, Bookmark, Zap, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
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

const INITIAL_VISIBLE_COUNT = 50;

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

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "nowebsite", label: "No website" },
  { id: "noreviews", label: "No reviews" },
  { id: "lowrating", label: "Low rating" },
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
// Shared input styles (token-based)
// ----------------------------------------------------------------------
const INPUT_BASE =
  "w-full bg-[var(--color-surface-overlay)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-neutral-50)] placeholder:text-[var(--color-neutral-500)] outline-none transition-colors duration-150 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary-subtle)]";

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

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
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

  const loadMore = () => setVisibleCount((c) => c + INITIAL_VISIBLE_COUNT);

  // Handlers
  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Enter a location to search.");
      return;
    }
    if (!industry) {
      setError("Select an industry to search.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setLeads([]);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    try {
      const params = new URLSearchParams({ location, industry, filter });
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Network request failed");

      setLeads(data.leads || []);
      setScrapedCount(data.scraped || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
    a.download = `outreachai-leads-${new Date().getTime()}.csv`;
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
    <div className="flex flex-col h-full min-h-0">
      {/* ── Page header ── */}
      <div className="mb-[var(--space-6)]">
        <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-50)]">
          Lead Finder
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-[var(--space-1)]">
          Search for businesses by location and industry, then filter by opportunity signals.
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-4)] mb-[var(--space-6)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-[var(--space-4)]">
          {/* Location input */}
          <div className="flex flex-col gap-[var(--space-1)] flex-1 max-w-xs">
            <label className="text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)] pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="e.g. Austin, TX"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className={`${INPUT_BASE} pl-[var(--space-8)]`}
              />
            </div>
          </div>

          {/* Industry select */}
          <div className="flex flex-col gap-[var(--space-1)] flex-1 max-w-xs">
            <label className="text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider">
              Industry
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={`${INPUT_BASE} appearance-none pr-[var(--space-8)]`}
              >
                <option value="" disabled>Select industry...</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)] pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-col gap-[var(--space-1)]">
            <label className="text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider">
              Signal filter
            </label>
            <div className="flex bg-[var(--color-surface-overlay)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-[var(--space-1)]">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-[var(--space-3)] py-[var(--space-1)] text-[var(--text-caption)] font-semibold rounded-[var(--radius-sm)] transition-colors duration-150 ${
                    filter === f.id
                      ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/25"
                      : "text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-200)] border border-transparent"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execute button */}
          <div className="lg:ml-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handleSearch}
              disabled={loading}
              className="w-full lg:w-auto whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search size={16} aria-hidden="true" />
                  Execute scan
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Results summary bar ── */}
      {hasSearched && !loading && !error && leads.length > 0 && (
        <div className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-2)] mb-[var(--space-4)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
          <div className="flex items-center gap-[var(--space-6)] text-[var(--text-caption)] text-[var(--color-neutral-400)]">
            <span>Found: <strong className="text-[var(--color-neutral-50)] font-semibold">{leads.length}</strong></span>
            <span>Scraped: <strong className="text-[var(--color-neutral-50)] font-semibold">{scrapedCount}</strong></span>
            <span>Showing: <strong className="text-[var(--color-primary)] font-semibold">{visibleLeads.length}</strong></span>
          </div>
          <Button variant="ghost" size="sm" onClick={exportCSV}>
            <Download size={14} aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      )}

      {/* ── Main results area ── */}
      <div className="flex-1 relative min-h-[320px]">
        {/* Empty state — before search */}
        {!hasSearched && !loading && (
          <div className="flex items-center justify-center h-full min-h-[320px]">
            <EmptyState
              title="Ready to find leads"
              description="Enter a location and industry above, then hit Execute scan. Results will appear here with opportunity signals highlighted."
              icon={<Search size={32} />}
            />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center h-full min-h-[320px]">
            <div className="flex flex-col items-center text-center gap-[var(--space-4)] p-[var(--space-8)] max-w-md">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-error-subtle)] flex items-center justify-center">
                <AlertCircle size={24} className="text-[var(--color-error)]" />
              </div>
              <div className="flex flex-col gap-[var(--space-1)]">
                <h3 className="text-[var(--text-h4)] font-semibold text-[var(--color-neutral-50)]">Scan failed</h3>
                <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)]">{error}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSearch}>
                Retry scan
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center h-full min-h-[320px]">
            <div className="flex flex-col items-center gap-[var(--space-4)]">
              <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
              <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)]">Scanning businesses...</p>
            </div>
          </div>
        )}

        {/* No results */}
        {hasSearched && !loading && !error && visibleLeads.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[320px]">
            <EmptyState
              title="No results found"
              description="Try a different location or industry, or broaden your filter to see more results."
              icon={<Search size={32} />}
            />
          </div>
        )}

        {/* ── Results table ── */}
        {hasSearched && !loading && !error && visibleLeads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider px-[var(--space-4)] py-[var(--space-3)] w-[100px]">Signals</th>
                  <th className="text-left text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider px-[var(--space-4)] py-[var(--space-3)]">Business</th>
                  <th className="text-left text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider px-[var(--space-4)] py-[var(--space-3)]">Location</th>
                  <th className="text-left text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider px-[var(--space-4)] py-[var(--space-3)] w-[120px]">Rating</th>
                  <th className="text-right text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider px-[var(--space-4)] py-[var(--space-3)] w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 group"
                  >
                    {/* Signals */}
                    <td className="px-[var(--space-4)] py-[var(--space-3)] align-top">
                      <div className="flex flex-col gap-[var(--space-1)]">
                        {!lead.website && (
                          <span className="inline-flex items-center px-[var(--space-2)] py-0.5 text-[var(--text-caption)] font-semibold bg-[var(--color-error-subtle)] text-[var(--color-error)] rounded-[var(--radius-sm)] w-fit">
                            No web
                          </span>
                        )}
                        {!lead.reviews && (
                          <span className="inline-flex items-center px-[var(--space-2)] py-0.5 text-[var(--text-caption)] font-semibold bg-[var(--color-warning-subtle)] text-[var(--color-warning)] rounded-[var(--radius-sm)] w-fit">
                            No rev
                          </span>
                        )}
                        {lead.rating && lead.rating < 3.5 && (
                          <span className="inline-flex items-center px-[var(--space-2)] py-0.5 text-[var(--text-caption)] font-semibold bg-[var(--color-warning-subtle)] text-[var(--color-warning)] rounded-[var(--radius-sm)] w-fit">
                            Low rtg
                          </span>
                        )}
                        {lead.website && lead.reviews > 0 && (!lead.rating || lead.rating >= 3.5) && (
                          <span className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">—</span>
                        )}
                      </div>
                    </td>

                    {/* Business */}
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex flex-col">
                        <span className="text-[var(--text-sm)] font-semibold text-[var(--color-neutral-50)] truncate max-w-[280px]" title={lead.name}>{lead.name}</span>
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{lead.category || "Uncategorized"}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex flex-col">
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-300)] truncate max-w-[240px]" title={lead.address}>{lead.address || "Unknown"}</span>
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{lead.phone || "No phone"}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      {lead.rating ? (
                        <div className="flex items-center gap-[var(--space-1)]">
                          <Star size={14} className="text-[var(--color-warning)] fill-[var(--color-warning)]" aria-hidden="true" />
                          <span className="text-[var(--text-sm)] text-[var(--color-neutral-50)]">{lead.rating}</span>
                          <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">({lead.reviews})</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-caption)] text-[var(--color-neutral-600)]">N/A</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex items-center justify-end gap-[var(--space-2)] opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => toggleSave(idx)}
                          className={`w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                            savedLeads.has(idx)
                              ? "bg-[var(--color-success-subtle)] border-[var(--color-success)]/30 text-[var(--color-success)]"
                              : "bg-[var(--color-surface-overlay)] border-[var(--color-border)] text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-200)] hover:border-[var(--color-neutral-600)]"
                          }`}
                          title={savedLeads.has(idx) ? "Unsave lead" : "Save lead"}
                          aria-label={savedLeads.has(idx) ? "Unsave lead" : "Save lead"}
                        >
                          <Bookmark size={14} className={savedLeads.has(idx) ? "fill-current" : ""} />
                        </button>
                        {lead.mapsUrl && (
                          <a
                            href={lead.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-200)] hover:border-[var(--color-neutral-600)] transition-colors duration-150"
                            title="View on Maps"
                            aria-label="View on Google Maps"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setModalLead(lead)}
                        >
                          <Zap size={12} aria-hidden="true" />
                          Pitch
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center py-[var(--space-6)]">
                <Button variant="outline" size="sm" onClick={loadMore}>
                  Load more results
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Pitch Generator ── */}
      <Modal
        isOpen={!!modalLead}
        onClose={() => setModalLead(null)}
        title="Outreach pitch"
        subtitle={modalLead ? `For: ${modalLead.name}` : undefined}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">Choose a tone, then copy the pitch.</span>
            <div className="flex gap-[var(--space-2)]">
              <Button variant="outline" size="sm" onClick={() => setModalLead(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)}
              >
                Copy to clipboard
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-[var(--space-6)]">
          {/* Tone selector */}
          <div className="flex flex-col gap-[var(--space-2)]">
            <label className="text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider">
              Tone
            </label>
            <div className="flex bg-[var(--color-surface-overlay)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-[var(--space-1)] w-fit">
              {(["direct", "casual", "bold"] as ToneType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-[var(--space-4)] py-[var(--space-1)] text-[var(--text-caption)] font-semibold capitalize rounded-[var(--radius-sm)] transition-colors duration-150 ${
                    tone === t
                      ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)]/25"
                      : "text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-200)] border border-transparent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-[var(--space-2)]">
            <label className="text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider">
              Subject line
            </label>
            <div className="bg-[var(--color-surface-overlay)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--text-sm)] text-[var(--color-neutral-50)]">
              {emailSubject}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-[var(--space-2)]">
            <label className="text-[var(--text-caption)] font-semibold text-[var(--color-neutral-400)] uppercase tracking-wider">
              Email body
            </label>
            <div className="bg-[var(--color-surface-overlay)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--text-sm)] text-[var(--color-neutral-300)] whitespace-pre-wrap leading-relaxed min-h-[160px]">
              {emailBody}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
