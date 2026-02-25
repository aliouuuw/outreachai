"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { errors } from "@/copy/errors";
import { labels } from "@/copy/labels";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: "/reset-password",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message ?? errors.generic);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError(errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title={labels.auth.emailSentTitle}
        subtitle={labels.auth.emailSentDescription}
      >
        <div className="text-center">
          <div className="mb-[var(--space-6)] flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30 flex items-center justify-center">
              <CircleCheck size={32} className="text-[var(--color-success)]" aria-hidden="true" />
            </div>
          </div>
          <Link
            href="/login"
            className="auth-btn-primary inline-block w-auto px-[var(--space-6)] py-[var(--space-2)]"
          >
            {labels.auth.backToSignIn}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={labels.auth.forgotTitle}
      subtitle={labels.auth.forgotSubtitle}
    >
      {error && (
        <div
          role="alert"
          className="mb-[var(--space-6)] px-[var(--space-4)] py-[var(--space-3)] rounded-[var(--radius-md)] bg-[var(--color-error-subtle)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-[var(--text-sm)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="email" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
            {labels.auth.email}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={labels.auth.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="auth-btn-primary mt-[var(--space-4)]"
        >
          {isLoading ? labels.auth.sendingResetLink : labels.auth.sendResetLink}
        </button>
      </form>

      <div className="my-[var(--space-6)] flex items-center gap-[var(--space-3)]">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{labels.common.or}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <p className="text-center text-[var(--text-sm)] text-[var(--color-neutral-400)]">
        {labels.auth.rememberPassword}{" "}
        <Link
          href="/login"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors duration-150"
        >
          {labels.auth.signIn}
        </Link>
      </p>
    </AuthLayout>
  );
}
