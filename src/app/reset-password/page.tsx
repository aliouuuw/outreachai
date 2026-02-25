"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errors } from "@/copy/errors";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setError("Lien de réinitialisation invalide ou expiré.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
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
      <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)] text-center">
        <div className="mb-4 text-[var(--color-success)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-[var(--text-h3)] font-semibold text-[var(--color-neutral-50)] mb-2">
          Mot de passe réinitialisé
        </h1>
        <p className="text-[var(--text-base)] text-[var(--color-neutral-400)] mb-6">
          Votre mot de passe a été mis à jour avec succès.
        </p>
        <Button
          onClick={() => router.push("/login")}
          variant="primary"
          className="w-full"
        >
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)]">
      {error && (
        <div
          role="alert"
          className="mb-6 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-error-subtle)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-[var(--text-sm)]"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          id="password"
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading || !token}
          minLength={8}
        />

        <Input
          id="confirmPassword"
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading || !token}
          minLength={8}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading || !token || !password || !confirmPassword}
          className="w-full mt-2"
        >
          {isLoading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-neutral-400)]">
        <Link
          href="/login"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors duration-150"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-[var(--color-neutral-50)] font-bold text-[var(--text-h2)] tracking-tight mb-2">
            OutreachAI
          </Link>
          <h1 className="text-[var(--text-h3)] font-semibold text-[var(--color-neutral-50)] mt-4">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-1">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)] text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-[var(--color-neutral-700)] rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-[var(--color-neutral-700)] rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
