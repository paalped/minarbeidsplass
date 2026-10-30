"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

export function ChatRoom({ initialMessages, user }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = payload.new;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function send(event) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase er ikke konfigurert.");
      return;
    }
    setError(null);
    setBody("");
    const { error: insertError } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      display_name: user.displayName,
      body: text,
    });
    if (insertError) {
      setError(insertError.message);
      setBody(text);
    }
  }

  return (
    <div className="paper-card flex h-[70vh] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-muted">Rommet er stille. Noen må jo starte sladren.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <div className="flex items-baseline gap-2">
                <span className="font-medium">{message.display_name}</span>
                <time className="text-xs text-muted" dateTime={message.created_at}>
                  {formatDateTime(message.created_at)}
                </time>
              </div>
              <p className="whitespace-pre-wrap">{message.body}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          placeholder="Skriv i sladderrommet…"
          className="h-11 flex-1 border border-line bg-white px-3"
        />
        <button type="submit" className="bg-rust px-4 text-paper hover:bg-rust-dark">
          Send
        </button>
      </form>
      {error ? <p className="px-3 pb-3 text-sm text-rust">{error}</p> : null}
    </div>
  );
}
