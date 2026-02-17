"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Error al registrarse");
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
    [email, username, password, router]
  );

  return (
    <main className="flex items-center justify-center min-h-dvh bg-background">
      <div className="w-full max-w-sm p-6 rounded-xl bg-dock-bg border border-dock-border">
        <h1 className="text-xl font-semibold text-foreground mb-6">
          Crear cuenta
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
            label="Nombre de usuario"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre de usuario"
            required
            autoComplete="username"
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="text-sm text-foreground/50 mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-sea-accent hover:text-sea-accent/80 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
