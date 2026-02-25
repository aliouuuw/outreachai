import { labels } from "@/copy/labels";

export default function BillingPage() {
  return (
    <div>
      <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-50)] mb-[var(--space-2)]">
        {labels.nav.billing}
      </h1>
      <p className="text-[var(--text-base)] text-[var(--color-neutral-400)]">
        Your billing information will appear here.
      </p>
    </div>
  );
}
