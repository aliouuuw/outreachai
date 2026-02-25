"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { errors } from "@/copy/errors";
import { labels } from "@/copy/labels";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setPasswordError(labels.auth.passwordsMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message ?? errors.generic);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(errors.generic);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title={labels.auth.signupTitle}
      subtitle={labels.auth.signupSubtitle}
      footer={
        <p className="text-[var(--text-caption)] text-[var(--color-neutral-400)]">
          {labels.auth.termsSignupPrefix}{" "}
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
          <label htmlFor="name" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
            {labels.auth.fullName}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={labels.auth.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="auth-input"
          />
        </div>

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
          <label htmlFor="password" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
            {labels.auth.password}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={labels.auth.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={isLoading}
            className="auth-input"
          />
          <p className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">
            {labels.auth.passwordMinLength}
          </p>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <label htmlFor="confirmPassword" className="text-[var(--text-sm)] font-medium text-[var(--color-neutral-200)]">
            {labels.auth.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={labels.auth.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            required
            disabled={isLoading}
            className="auth-input"
          />
          {passwordError && (
            <p className="text-[var(--text-caption)] text-[var(--color-error)]">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !name || !email || password.length < 8 || !confirmPassword}
          className="auth-btn-primary mt-[var(--space-4)]"
        >
          {isLoading ? labels.auth.signingUp : labels.auth.signup}
        </button>
      </form>

      <div className="my-[var(--space-6)] flex items-center gap-[var(--space-3)]">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-[var(--text-caption)] text-[var(--color-neutral-500)]">{labels.common.or}</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <p className="text-center text-[var(--text-sm)] text-[var(--color-neutral-300)]">
        {labels.auth.hasAccount}{" "}
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
