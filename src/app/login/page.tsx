"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errors } from "@/copy/errors";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-[var(--color-neutral-50)] font-bold text-[var(--text-h2)] tracking-tight mb-2">
            OutreachAI
          </Link>
          <h1 className="text-[var(--text-h3)] font-semibold text-[var(--color-neutral-50)] mt-4">
            Bon retour
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-neutral-400)] mt-1">
            Connectez-vous à votre compte
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

            <div className="flex flex-col gap-2">
              <Input
                id="password"
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !email || !password}
              className="w-full mt-2"
            >
              {isLoading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-neutral-400)]">
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors duration-150"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
