"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";

interface CreateRoomFormProps {
  gameSlug: string;
  maxPlayers: number;
}

export default function CreateRoomForm({
  gameSlug,
  maxPlayers,
}: CreateRoomFormProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, maxPlayers }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear sala");
        return;
      }

      const { room } = await res.json();
      router.push(`/sala/${room.id}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [gameSlug, maxPlayers, router]);

  const handleJoin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!joinCode.trim()) return;

      setError("");
      setLoading(true);

      try {
        const res = await fetch(`/api/rooms?code=${joinCode.trim()}`);
        if (!res.ok) {
          setError("Sala no encontrada");
          return;
        }

        const { room } = await res.json();
        router.push(`/sala/${room.id}`);
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    },
    [joinCode, router]
  );

  return (
    <div className="flex flex-col gap-6">
      <Button onClick={handleCreate} disabled={loading}>
        {loading ? "Creando..." : "Crear sala"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-dock-border" />
        <span className="text-xs text-foreground/40">o unirse</span>
        <div className="flex-1 h-px bg-dock-border" />
      </div>

      <form onSubmit={handleJoin} className="flex gap-2">
        <div className="flex-1">
          <Input
            label=""
            name="code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Código de sala"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={loading}>
          Unirse
        </Button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
