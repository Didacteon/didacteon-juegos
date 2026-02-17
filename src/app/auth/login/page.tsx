"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al iniciar sesión");
          return;
        }

        router.push("/");
        router.refresh();
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <main className="flex items-center justify-center min-h-dvh bg-background">
      <div className="w-full max-w-sm p-6 rounded-xl bg-dock-bg border border-dock-border">
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-foreground/50 mt-4 text-center">
          ¿No tienes cuenta?{" "}
          <Link
            href="/auth/register"
            className="text-sea-accent hover:text-sea-accent/80 transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
