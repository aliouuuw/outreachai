"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { errors } from "@/copy/errors";
import { labels } from "@/copy/labels";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (result.error) {
        setError(result.error.message ?? errors.unauthorized);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title={labels.auth.loginTitle}
      subtitle={labels.auth.loginSubtitle}
      footer={
        <p className="text-[var(--text-caption)] text-[var(--color-neutral-400)]">
          {labels.auth.termsPrefix}{" "}
          <Link href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-150">
            {labels.auth.termsLink}
          </Link>
        </p>
      }
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

        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
              {labels.auth.password}
            </label>
            <Link
              href="/forgot-password"
              className="text-[var(--text-sm)] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors duration-150"
            >
              {labels.auth.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={labels.auth.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="auth-input pr-[var(--space-12)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              className="absolute inset-y-0 right-[var(--space-3)] flex items-center justify-center text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-200)] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="auth-btn-primary mt-[var(--space-4)]"
        >
          {isLoading ? labels.auth.signingIn : labels.auth.login}
        </button>
      </form>

      <div className="my-[var(--space-6)] flex items-center gap-[var(--space-3)]">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{labels.common.or}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <p className="text-center text-[var(--text-sm)] text-[var(--color-neutral-300)]">
        {labels.auth.noAccount}{" "}
        <Link
          href="/signup"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors duration-150"
        >
          {labels.auth.createOne}
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
