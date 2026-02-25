"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errors } from "@/copy/errors";

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
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
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
              Email envoyé
            </h1>
            <p className="text-[var(--text-base)] text-[var(--color-neutral-400)] mb-6">
              Si un compte existe avec {email}, vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <Link
              href="/login"
              className="inline-block text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors duration-150"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-[var(--color-neutral-50)] font-bold text-[var(--text-h2)] tracking-tight mb-2">
            OutreachAI
          </Link>
          <h1 className="text-[var(--text-h3)] font-semibold text-[var(--color-neutral-50)] mt-4">
            Mot de passe oublié ?
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

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
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !email}
              className="w-full mt-2"
            >
              {isLoading ? "Envoi…" : "Envoyer le lien"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-neutral-400)]">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link
              href="/login"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors duration-150"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
