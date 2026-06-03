"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentSseEvent } from "@/lib/agent/agent-stream-events";
import { SEO_WAIT_TIPS_LT } from "@/lib/agent/seo-wait-tips";
import {
  AgentProgressPipeline,
  resolvePipelinePhase,
  type AgentPipelinePhase,
} from "@/components/dashboard/AgentProgressPipeline";
import { AgentRunTimeline } from "@/components/dashboard/AgentRunTimeline";
import { AgentToolsSkeleton } from "@/components/dashboard/AgentToolsSkeleton";
import { parseAgentMessageMetadata } from "@/lib/agent/agent-message-metadata";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
  /** Agento eiga (JSON MVP), tik assistant žinutėms */
  metadata?: unknown | null;
};

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
};

const STORAGE_KEY = "fsai-agent-conversation-id";

export function AgentChatPanel() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** SSE: kas vyksta (įrankiai, žingsniai) */
  const [streamHint, setStreamHint] = useState<string | null>(null);
  /** SSE: surenkamas asistento tekstas */
  const [streamingReply, setStreamingReply] = useState("");
  /** Vizualus 4 žingsnių progresas */
  const [pipelinePhase, setPipelinePhase] = useState<AgentPipelinePhase>(null);
  const [tipIndex, setTipIndex] = useState(0);
  /** Kuris asistento burbulas „aktyvus“ laiko juostai (paspaudus arba paskutinis atsakymas). */
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const agentInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAgentInputFocus = useCallback(() => {
    window.setTimeout(() => {
      agentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/agent/conversations/${id}`);
    if (!res.ok) {
      setError("Nepavyko įkelti pokalbio.");
      return;
    }
    const data = (await res.json()) as {
      conversation: { messages: ChatMessage[]; title: string | null };
    };
    setConversationId(id);
    setMessages(data.conversation.messages);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/agent/conversations");
    if (!res.ok) return;
    const data = (await res.json()) as { conversations: ConversationListItem[] };
    setConversations(data.conversations);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setError(null);
      try {
        let stored: string | null = null;
        try {
          stored = sessionStorage.getItem(STORAGE_KEY);
        } catch {
          stored = null;
        }
        const res = await fetch("/api/agent/conversations");
        if (!res.ok) {
          setError("Nepavyko įkelti pokalbių sąrašo.");
          return;
        }
        const data = (await res.json()) as { conversations: ConversationListItem[] };
        if (cancelled) return;
        setConversations(data.conversations);

        if (stored && data.conversations.some((c) => c.id === stored)) {
          await loadConversation(stored);
        } else if (data.conversations.length > 0) {
          await loadConversation(data.conversations[0]!.id);
        } else {
          const post = await fetch("/api/agent/conversations", { method: "POST" });
          if (post.ok) {
            const created = (await post.json()) as { id: string };
            if (!cancelled) {
              setConversationId(created.id);
              setMessages([]);
              try {
                sessionStorage.setItem(STORAGE_KEY, created.id);
              } catch {
                /* ignore */
              }
              const again = await fetch("/api/agent/conversations");
              if (again.ok && !cancelled) {
                const list = (await again.json()) as { conversations: ConversationListItem[] };
                setConversations(list.conversations);
              }
            }
          }
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, streamingReply, streamHint]);

  /** Pokyčiai pokalbyje / naujas pokalbis — numatytai rodome paskutinio asistento burbulo eigą. */
  useEffect(() => {
    const assistants = messages.filter((m) => m.role === "assistant");
    if (assistants.length === 0) {
      setActiveAnalysisId(null);
      return;
    }
    setActiveAnalysisId((prev) => {
      if (prev && assistants.some((a) => a.id === prev)) return prev;
      return assistants[assistants.length - 1]!.id;
    });
  }, [messages, conversationId]);

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") return messages[i]!.id;
    }
    return null;
  }, [messages]);

  const timelineDerived = useMemo(() => {
    const selected = messages.find((m) => m.id === activeAnalysisId);
    if (!selected || selected.role !== "assistant") {
      return {
        metadata: null as unknown | null,
        legacyWithoutMetadata: false,
        selectionHint: null as string | null,
      };
    }
    const meta = selected.metadata;
    const parsed = meta != null ? parseAgentMessageMetadata(meta) : null;
    const legacyWithoutMetadata = parsed == null;
    const selectionHint =
      lastAssistantId && activeAnalysisId && lastAssistantId !== activeAnalysisId ? "Ankstesnis atsakymas" : null;
    return { metadata: meta ?? null, legacyWithoutMetadata, selectionHint };
  }, [messages, activeAnalysisId, lastAssistantId]);

  useEffect(() => {
    if (!loading || pipelinePhase !== "tools") return;
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % SEO_WAIT_TIPS_LT.length);
    }, 8000);
    return () => clearInterval(id);
  }, [loading, pipelinePhase]);

  async function newConversation() {
    setError(null);
    const res = await fetch("/api/agent/conversations", { method: "POST" });
    if (!res.ok) {
      setError("Nepavyko sukurti naujo pokalbio.");
      return;
    }
    const created = (await res.json()) as { id: string };
    setConversationId(created.id);
    setMessages([]);
    setActiveAnalysisId(null);
    try {
      sessionStorage.setItem(STORAGE_KEY, created.id);
    } catch {
      /* ignore */
    }
    await refreshList();
  }

  async function deleteConversation() {
    if (!conversationId) return;
    if (!window.confirm("Ištrinti šį pokalbį?")) return;
    const res = await fetch(`/api/agent/conversations/${conversationId}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Nepavyko ištrinti.");
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setConversationId(null);
    setMessages([]);
    await refreshList();
    const list = await fetch("/api/agent/conversations");
    if (list.ok) {
      const data = (await list.json()) as { conversations: ConversationListItem[] };
      setConversations(data.conversations);
      if (data.conversations.length > 0) {
        await loadConversation(data.conversations[0]!.id);
      } else {
        const post = await fetch("/api/agent/conversations", { method: "POST" });
        if (post.ok) {
          const created = (await post.json()) as { id: string };
          setConversationId(created.id);
          try {
            sessionStorage.setItem(STORAGE_KEY, created.id);
          } catch {
            /* ignore */
          }
          await refreshList();
        }
      }
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    let cid = conversationId;
    if (!cid) {
      const post = await fetch("/api/agent/conversations", { method: "POST" });
      if (!post.ok) {
        setError("Nepavyko sukurti pokalbio.");
        return;
      }
      const created = (await post.json()) as { id: string };
      cid = created.id;
      setConversationId(cid);
      try {
        sessionStorage.setItem(STORAGE_KEY, cid);
      } catch {
        /* ignore */
      }
      await refreshList();
    }

    setInput("");
    setError(null);
    setStreamHint(null);
    setStreamingReply("");
    setPipelinePhase("context");
    setTipIndex(0);
    setLoading(true);

    const optimisticId = `local-${Date.now()}`;
    setMessages((m) => [...m, { id: optimisticId, role: "user", content: text }]);

    try {
      const res = await fetch("/api/agent/seo-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message: text, conversationId: cid, stream: true }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setMessages((m) => m.filter((x) => x.id !== optimisticId));
        setError(body.error ?? `Klaida (${res.status})`);
        setPipelinePhase(null);
        return;
      }

      if (!res.body) {
        setMessages((m) => m.filter((x) => x.id !== optimisticId));
        setError("Naršyklė nepalaiko srauto.");
        setPipelinePhase(null);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let carry = "";
      let donePayload: Extract<AgentSseEvent, { type: "done" }> | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        carry += decoder.decode(value, { stream: true });
        const blocks = carry.split("\n\n");
        carry = blocks.pop() ?? "";
        for (const block of blocks) {
          const line = block.trim();
          if (!line.startsWith("data:")) continue;
          let json: AgentSseEvent;
          try {
            json = JSON.parse(line.slice(5).trim()) as AgentSseEvent;
          } catch {
            continue;
          }
          switch (json.type) {
            case "status": {
              const j = json as Extract<AgentSseEvent, { type: "status" }>;
              setStreamHint(j.content);
              setPipelinePhase(resolvePipelinePhase(j.content, j.phase));
              break;
            }
            case "tool_start": {
              const j = json as Extract<AgentSseEvent, { type: "tool_start" }>;
              setPipelinePhase("tools");
              setStreamHint(formatToolStartHint(j));
              break;
            }
            case "tool_progress": {
              const j = json as Extract<AgentSseEvent, { type: "tool_progress" }>;
              setPipelinePhase("tools");
              setStreamHint(j.content ?? `${j.index}/${j.total}: ${j.url}`);
              break;
            }
            case "tool_end": {
              const j = json as Extract<AgentSseEvent, { type: "tool_end" }>;
              setStreamHint(j.ok ? `${toolLabel(j.name)} — baigta` : `${toolLabel(j.name)} — klaida`);
              break;
            }
            case "delta":
              setPipelinePhase("answer");
              setStreamingReply((prev) => prev + json.content);
              break;
            case "done":
              donePayload = json;
              break;
            case "error":
              setMessages((m) => m.filter((x) => x.id !== optimisticId));
              setError(json.message);
              setStreamHint(null);
              setStreamingReply("");
              setPipelinePhase(null);
              return;
            default:
              break;
          }
        }
      }

      if (donePayload) {
        if (donePayload.conversationId) {
          setConversationId(donePayload.conversationId);
          try {
            sessionStorage.setItem(STORAGE_KEY, donePayload.conversationId);
          } catch {
            /* ignore */
          }
        }
        setActiveAnalysisId(null);
        await loadConversation(donePayload.conversationId);
        await refreshList();
      }

      setStreamHint(null);
      setStreamingReply("");
      setPipelinePhase(null);
    } catch {
      setMessages((m) => m.filter((x) => x.id !== optimisticId));
      setError("Tinklo klaida.");
      setStreamHint(null);
      setStreamingReply("");
      setPipelinePhase(null);
    } finally {
      setLoading(false);
    }
  }

  function toolLabel(name: string): string {
    switch (name) {
      case "scan_site_seo":
        return "Skenuoju puslapį";
      case "compare_sites_seo":
        return "Lyginu dvi svetaines";
      case "save_seo_tasks":
        return "Įrašau užduotis";
      default:
        return name;
    }
  }

  function formatToolStartHint(j: {
    name: string;
    detail?: string;
    index?: number;
    total?: number;
    url?: string;
  }): string {
    const label = toolLabel(j.name);
    if (j.index != null && j.total != null) {
      const u = j.url ? ` · ${j.url}` : "";
      return `${j.index}/${j.total}${u} — ${label}`;
    }
    return j.detail ? `${label}: ${j.detail}` : label;
  }

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>SEO analizės sesija</CardTitle>
          <CardDescription>
            Struktūrizuotas darbo srautas: Lighthouse duomenys, palyginimai, užduotys DB — ne bendras pokalbių botas.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Pasirinkti pokalbį"
            className="max-w-[220px] rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_50%,black)] px-3 py-2 text-sm text-zinc-200"
            value={conversationId ?? ""}
            disabled={loadingList}
            onChange={(e) => {
              const id = e.target.value;
              if (id) void loadConversation(id);
            }}
          >
            <option value="">— Pokalbis —</option>
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title.slice(0, 42)}
                {c.title.length > 42 ? "…" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void newConversation()}
            aria-label="Pradėti naują pokalbį"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-zinc-200 transition hover:border-[var(--color-electric)] hover:text-white"
          >
            Naujas pokalbis
          </button>
          <button
            type="button"
            onClick={() => void deleteConversation()}
            aria-label="Ištrinti pokalbį"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:border-red-900 hover:text-red-300"
          >
            Ištrinti
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingList ? (
          <p className="text-sm text-zinc-500">Kraunama…</p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(260px,300px)] lg:items-start">
            <div className="max-h-[420px] min-h-[280px] space-y-4 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,black_35%,transparent)] p-4">
              {loading && <AgentProgressPipeline active={pipelinePhase} />}
              {streamHint && (
                <p className="rounded-lg border border-[color-mix(in_oklab,var(--color-electric)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-electric)_8%,transparent)] px-3 py-2 text-xs leading-snug text-zinc-300">
                  {streamHint}
                </p>
              )}
              {/* Skeleton tik kol dar nėra tekstinio statuso (išvengia dubliavimo su streamHint). Fiksuotas min aukštis sumažina „šokinėjimą“. */}
              {loading && pipelinePhase === "tools" && (
                <div className="min-h-[132px] space-y-2">
                  {!streamHint?.trim() ? <AgentToolsSkeleton /> : null}
                  <p className="text-xs leading-relaxed text-zinc-500">{SEO_WAIT_TIPS_LT[tipIndex]}</p>
                </div>
              )}
              {messages.length === 0 && !loading && (
                <p className="text-sm text-zinc-500">
                  Pavyzdžiui: „Nuskaityk mobile SEO mano svetainei example.com“ arba „Palygink example.com ir competitor.com
                  SEO balus.“
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "user" ? (
                    <div className="max-w-[92%] rounded-2xl bg-[var(--color-electric)] px-4 py-3 text-sm leading-relaxed text-[#041014] sm:max-w-[85%]">
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Rodyti šios analizės eigą šone"
                      onClick={() => setActiveAnalysisId(m.id)}
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-left text-sm leading-relaxed transition sm:max-w-[85%] ${
                        activeAnalysisId === m.id
                          ? "bg-[color-mix(in_oklab,var(--color-surface)_90%,white_5%)] text-zinc-200 ring-2 ring-[var(--color-electric)] ring-offset-2 ring-offset-[color-mix(in_oklab,black_35%,transparent)]"
                          : "bg-[color-mix(in_oklab,var(--color-surface)_90%,white_5%)] text-zinc-200 ring-offset-2 ring-offset-[color-mix(in_oklab,black_35%,transparent)] hover:ring-1 hover:ring-[color-mix(in_oklab,var(--color-electric)_45%,transparent)]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </button>
                  )}
                </div>
              ))}
              {loading && streamingReply.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_90%,white_5%)] px-4 py-3 text-sm text-zinc-200 sm:max-w-[85%]">
                    <p className="whitespace-pre-wrap">{streamingReply}</p>
                  </div>
                </div>
              )}
              {loading && !streamingReply && !streamHint && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-zinc-400">
                    Jungiamasi…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <aside className="lg:sticky lg:top-4">
              <AgentRunTimeline
                metadata={timelineDerived.metadata}
                legacyWithoutMetadata={timelineDerived.legacyWithoutMetadata}
                selectionHint={timelineDerived.selectionHint}
              />
            </aside>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="sr-only" htmlFor="agent-input">
                Žinutė
              </label>
              <textarea
                ref={agentInputRef}
                id="agent-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={handleAgentInputFocus}
                placeholder="Užduotis: URL, palyginimas, užduočių sąrašas…"
                className="min-h-[80px] flex-1 resize-y rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,black_40%,transparent)] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[var(--color-electric)] focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-xl bg-[var(--color-electric)] px-6 py-3 text-sm font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)] disabled:opacity-40"
              >
                Siųsti
              </button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
