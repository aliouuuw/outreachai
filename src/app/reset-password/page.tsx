"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { errors } from "@/copy/errors";
import { labels } from "@/copy/labels";
import { AuthLayout } from "@/components/layout/AuthLayout";

const MIN_PASSWORD_LENGTH = 8;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(labels.auth.invalidResetLink);
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(labels.auth.passwordsMismatch);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(labels.auth.passwordMinLength);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: password,
          token,
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
      <div className="text-center">
        <div className="mb-[var(--space-6)] flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-subtle)] border border-[var(--color-success)]/30 flex items-center justify-center">
            <CircleCheck size={32} className="text-[var(--color-success)]" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-[var(--text-h2)] font-bold text-[var(--color-neutral-50)] mb-[var(--space-2)]">
          {labels.auth.passwordResetTitle}
        </h2>
        <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mb-[var(--space-6)]">
          {labels.auth.passwordResetDescription}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="auth-btn-primary"
        >
          {labels.auth.signIn}
        </button>
      </div>
    );
  }

  return (
    <>
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
          <label htmlFor="password" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
            {labels.auth.newPassword}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={labels.auth.newPasswordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || !token}
            minLength={MIN_PASSWORD_LENGTH}
            className="auth-input"
          />
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="confirmPassword" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
            {labels.auth.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={labels.auth.newPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading || !token}
            minLength={MIN_PASSWORD_LENGTH}
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !token || !password || !confirmPassword}
          className="auth-btn-primary mt-[var(--space-4)]"
        >
          {isLoading ? labels.auth.resettingPassword : labels.auth.resetPassword}
        </button>
      </form>

      <div className="my-[var(--space-6)] flex items-center gap-[var(--space-3)]">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{labels.common.or}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <p className="text-center text-[var(--text-sm)] text-[var(--color-neutral-400)]">
        <Link
          href="/login"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors duration-150"
        >
          {labels.auth.backToSignIn}
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title={labels.auth.resetTitle}
      subtitle={labels.auth.resetSubtitle}
    >
      <Suspense fallback={
        <div className="text-center animate-pulse">
          <div className="h-[var(--space-8)] bg-[var(--color-neutral-800)] rounded-[var(--radius-md)] w-3/4 mx-auto mb-[var(--space-4)]" />
          <div className="h-[var(--space-4)] bg-[var(--color-neutral-800)] rounded-[var(--radius-md)] w-1/2 mx-auto" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
