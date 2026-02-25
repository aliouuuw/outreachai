import { labels } from "@/copy/labels";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Search, Bookmark, Settings, BarChart3, Zap, Users } from "lucide-react";

export default function DashboardPage() {
  const hasRecentData = false;

  return (
    <div className="max-w-[1100px]">
      {/* ── Page header ── */}
      <div className="mb-[var(--space-8)]">
        <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-50)]">
          {labels.dashboard.title}
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-[var(--space-1)]">
          {labels.dashboard.subtitle}
        </p>
      </div>

      {/* ── Usage stats row ── */}
      <section aria-label="Usage overview" className="mb-[var(--space-8)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-4)]">
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-6)] flex items-center gap-[var(--space-4)]">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary-subtle)] flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-50)]">0</div>
              <div className="text-[var(--text-caption)] text-[var(--color-neutral-400)]">Scans this month</div>
            </div>
          </div>
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-6)] flex items-center gap-[var(--space-4)]">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-success-subtle)] flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-[var(--color-success)]" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-50)]">0</div>
              <div className="text-[var(--text-caption)] text-[var(--color-neutral-400)]">Leads found</div>
            </div>
          </div>
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-6)] flex items-center gap-[var(--space-4)]">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-info-subtle)] flex items-center justify-center flex-shrink-0">
              <BarChart3 size={18} className="text-[var(--color-info)]" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-50)]">0</div>
              <div className="text-[var(--text-caption)] text-[var(--color-neutral-400)]">Saved leads</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick action cards ── */}
      <section aria-label={labels.dashboard.quickActions} className="mb-[var(--space-8)]">
        <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-neutral-200)] mb-[var(--space-4)]">
          {labels.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-4)]">
          <Link
            href="/leads"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] rounded-[var(--radius-lg)]"
          >
            <Card variant="interactive" className="h-full">
              <div className="flex items-start justify-between gap-[var(--space-4)]">
                <div>
                  <div className="text-[var(--text-h4)] font-semibold text-[var(--color-neutral-50)]">
                    {labels.dashboard.openLeadFinder}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-[var(--space-2)]">
                    {labels.dashboard.openLeadFinderDescription}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary-subtle)] flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                  <Search size={18} aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href="/saved-leads"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] rounded-[var(--radius-lg)]"
          >
            <Card variant="interactive" className="h-full">
              <div className="flex items-start justify-between gap-[var(--space-4)]">
                <div>
                  <div className="text-[var(--text-h4)] font-semibold text-[var(--color-neutral-50)]">
                    {labels.dashboard.viewSavedLeads}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-[var(--space-2)]">
                    {labels.dashboard.viewSavedLeadsDescription}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-neutral-300)] flex-shrink-0">
                  <Bookmark size={18} aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href="/settings"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] rounded-[var(--radius-lg)]"
          >
            <Card variant="interactive" className="h-full">
              <div className="flex items-start justify-between gap-[var(--space-4)]">
                <div>
                  <div className="text-[var(--text-h4)] font-semibold text-[var(--color-neutral-50)]">
                    {labels.dashboard.completeSetup}
                  </div>
                  <div className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-[var(--space-2)]">
                    {labels.dashboard.completeSetupDescription}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-neutral-300)] flex-shrink-0">
                  <Settings size={18} aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* ── Getting started / empty state ── */}
      {!hasRecentData && (
        <section aria-label="Getting started">
          <EmptyState
            title={labels.dashboard.emptyTitle}
            description={labels.dashboard.emptyDescription}
            icon={<Search size={32} />}
          >
            <Link href="/leads">
              <Button variant="primary" size="md">
                {labels.dashboard.emptyCta}
              </Button>
            </Link>
          </EmptyState>
        </section>
      )}
    </div>
  );
}
