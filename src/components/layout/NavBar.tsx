"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface NavBarProps {
  username?: string | null;
}

export default function NavBar({ username }: NavBarProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }, [router]);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-dock-bg border-b border-dock-border backdrop-blur-xl">
      <Link
        href="/"
        className="text-lg font-semibold text-foreground tracking-tight hover:text-sea-accent transition-colors"
      >
        didacteon juegos
      </Link>

      <div className="flex items-center gap-4">
        {username ? (
          <>
            <Link
              href="/clasificacion"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Rankings
            </Link>
            <Link
              href="/perfil"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              {username}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors"
            >
              Salir
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="text-sm text-sea-accent hover:text-sea-accent/80 transition-colors"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
