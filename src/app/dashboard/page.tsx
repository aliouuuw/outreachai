import { labels } from "@/copy/labels";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Search, Bookmark, Settings } from "lucide-react";

export default function DashboardPage() {
  const hasRecentData = false;

  return (
    <div className="max-w-[1100px]">
      <div className="mb-[var(--space-6)]">
        <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-50)]">
          {labels.dashboard.title}
        </h1>
        <p className="text-[var(--text-base)] text-[var(--color-neutral-400)] mt-[var(--space-2)]">
          {labels.dashboard.subtitle}
        </p>
      </div>

      <section aria-label={labels.dashboard.quickActions}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-4)]">
          <Link
            href="/leads"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] rounded-[var(--radius-xl)]"
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
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                  <Search size={18} aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href="/saved-leads"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] rounded-[var(--radius-xl)]"
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
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-neutral-300)]">
                  <Bookmark size={18} aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href="/settings"
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] rounded-[var(--radius-xl)]"
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
                <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-neutral-300)]">
                  <Settings size={18} aria-hidden="true" />
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {!hasRecentData && (
        <div className="mt-[var(--space-6)]">
          <EmptyState
            title={labels.dashboard.emptyTitle}
            description={labels.dashboard.emptyDescription}
          >
            <Link href="/leads">
              <Button variant="primary" size="md">
                {labels.dashboard.emptyCta}
              </Button>
            </Link>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
