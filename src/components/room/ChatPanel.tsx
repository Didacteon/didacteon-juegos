"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessageData } from "@/server/protocol/messages";

interface ChatPanelProps {
  messages: ChatMessageData[];
  onSend: (content: string) => void;
  currentUserId: string;
}

export default function ChatPanel({
  messages,
  onSend,
  currentUserId,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setInput("");
    },
    [input, onSend]
  );

  return (
    <div className="flex flex-col bg-dock-bg border border-dock-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-dock-border">
        <span className="text-sm font-semibold text-foreground/60">Chat</span>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-48 max-h-64 overflow-y-auto p-3 flex flex-col gap-1">
        {messages.length === 0 && (
          <p className="text-xs text-foreground/30 text-center py-4">
            Sin mensajes
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span
              className={`font-medium ${
                msg.userId === currentUserId
                  ? "text-sea-accent"
                  : "text-foreground/70"
              }`}
            >
              {msg.username}:
            </span>{" "}
            <span className="text-foreground/80">{msg.content}</span>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex border-t border-dock-border"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={500}
          className="flex-1 px-3 py-2 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
        />
        <button
          type="submit"
          className="px-3 text-sm text-sea-accent hover:text-sea-accent/80 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
