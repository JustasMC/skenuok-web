"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVisualKeyboardInset } from "@/hooks/useVisualKeyboardInset";

type Msg = { role: "user" | "assistant"; content: string };

type StreamPayload = {
  phase?: "tool";
  status?: "start" | "done";
  name?: string;
  ok?: boolean;
  detail?: string;
  t?: string;
  error?: string;
};

function BotGlyph() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v2.5a4.5 4.5 0 0 1-1.8 3.6L16 21H8l-1.2-7.9A4.5 4.5 0 0 1 5 10.5V8a2 2 0 0 1 2-2h2V5a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Įrankių vykdymo indikatorius (function calling) */
  const [toolHint, setToolHint] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useVisualKeyboardInset();

  const historyBaseRef = useRef<Msg[]>([]);
  const accRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const flushAssistantToState = useCallback(() => {
    rafRef.current = null;
    const acc = accRef.current;
    setMessages([...historyBaseRef.current, { role: "assistant", content: acc }]);
  }, []);

  const scheduleAssistantFlush = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      flushAssistantToState();
    });
  }, [flushAssistantToState]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, toolHint, scrollToBottom]);

  const handleInputFocus = useCallback(() => {
    window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    setToolHint(null);

    const nextUser: Msg = { role: "user", content: text };
    const history = [...messages, nextUser];
    historyBaseRef.current = history;
    accRef.current = "";
    setMessages([...history, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Klaida ${res.status}`);
        setMessages(history);
        return;
      }

      if (!res.body) {
        setError("Srautas nepalaikomas.");
        setMessages(history);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let carry = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        carry += decoder.decode(value, { stream: true });
        const blocks = carry.split("\n\n");
        carry = blocks.pop() ?? "";
        for (const block of blocks) {
          const line = block.trim();
          if (!line.startsWith("data:")) continue;
          let payload: StreamPayload;
          try {
            payload = JSON.parse(line.slice(5).trim()) as StreamPayload;
          } catch {
            continue;
          }

          if (payload.error) {
            if (rafRef.current != null) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
            }
            setError(payload.error);
            setMessages(history);
            setLoading(false);
            setToolHint(null);
            return;
          }

          if (payload.phase === "tool") {
            if (payload.status === "start" && payload.name) {
              setToolHint(`Įrankis: ${payload.name}…`);
            }
            if (payload.status === "done") {
              setToolHint(
                payload.ok === false
                  ? payload.detail ?? "Įrankis nepavyko"
                  : payload.detail ?? "Atlikta",
              );
            }
            continue;
          }

          if (payload.t) {
            accRef.current += payload.t;
            scheduleAssistantFlush();
          }
        }
      }

      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      flushAssistantToState();

      if (!accRef.current.trim()) {
        setError("Tuščias atsakymas. Bandykite dar kartą.");
        setMessages(history);
      }
    } catch {
      setError("Tinklo klaida.");
      setMessages(historyBaseRef.current);
    } finally {
      setLoading(false);
      setTimeout(() => setToolHint(null), 3200);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ bottom: `calc(1.25rem + ${keyboardInset}px)` }}
        className="site-chat-fab"
        aria-expanded={open}
        aria-controls="site-chat-panel"
        aria-label={open ? "Uždaryti pokalbį" : "Atidaryti AI konsultantą"}
      >
        <BotGlyph />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id="site-chat-panel"
          style={{ bottom: `calc(6rem + ${keyboardInset}px)` }}
          className="site-chat-panel"
          role="dialog"
          aria-label="AI konsultantas"
        >
          <div className="border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-electric)_8%,transparent)] px-4 py-3">
            <p className="text-sm font-semibold tracking-tight text-zinc-100">FS-AI konsultantas</p>
            <p className="text-xs leading-relaxed text-zinc-500">
              Klauskite apie paslaugas — atsakymai srautu. Galite užsiregistruoti konsultacijai (vardas + el. paštas).
            </p>
          </div>

          {toolHint ? (
            <p className="border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-electric)_6%,transparent)] px-3 py-2 text-[11px] leading-snug text-zinc-300">
              {toolHint}
            </p>
          ) : null}

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="text-sm leading-relaxed text-zinc-500">
                Pavyzdžiui: „Kuo skiriasi SEO generatorius nuo URL skenerio?“ arba „Norėčiau konsultacijos — Jonas, jonas@pastas.lt,
                domina AI agentai.“
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`msg-${i}-${m.role}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--color-electric)] text-[#041014]"
                      : "border border-[var(--color-border)] bg-[color-mix(in_oklab,black_35%,transparent)] text-zinc-200"
                  }`}
                >
                  {m.content || (loading && i === messages.length - 1 && m.role === "assistant" ? "…" : m.content)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error ? <p className="px-3 pb-1 text-xs text-red-400">{error}</p> : null}

          <form
            className="border-t border-[var(--color-border)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="flex gap-2">
              <label htmlFor="chatbot-input" className="sr-only">
                Žinutė
              </label>
              <input
                ref={inputRef}
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleInputFocus}
                placeholder="Rašykite klausimą…"
                disabled={loading}
                className="site-input-chat"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-lg bg-[var(--color-electric)] px-4 py-2 text-sm font-semibold text-[#041014] motion-safe:transition-colors motion-safe:duration-200 hover:bg-[var(--color-electric-dim)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)] disabled:opacity-40"
              >
                Siųsti
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
