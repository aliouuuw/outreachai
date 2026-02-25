import { labels } from "@/copy/labels";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-50)] mb-[var(--space-2)]">
        {labels.nav.dashboard}
      </h1>
      <p className="text-[var(--text-base)] text-[var(--color-neutral-400)]">
        Welcome to OutreachAI
      </p>
    </div>
  );
}
