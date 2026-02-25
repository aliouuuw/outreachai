"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { labels } from "@/copy/labels";

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[var(--text-h1)] font-bold text-[var(--color-neutral-50)]">
          Dashboard
        </h1>
        <p className="text-[var(--text-base)] text-[var(--color-neutral-400)] mt-2">
          Welcome to OutreachAI
        </p>
        <Button
          onClick={handleLogout}
          variant="secondary"
          className="mt-6"
        >
          {labels.auth.logout}
        </Button>
      </div>
    </div>
  );
}
