"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildManualSeoTask, buildSeoTasksFromInsights } from "@/lib/insights-to-seo-tasks";
import type { SeoTask, SeoTaskPriority } from "@/lib/seo-task-types";
import {
  downloadTextFile,
  exportSeoTasksCsv,
  exportSeoTasksJson,
  loadSeoTasksFromLocalStorage,
  mergeSeoTasksDeduped,
  saveSeoTasksToLocalStorage,
} from "@/lib/seo-tasks-local";

const PRIORITY_LABEL: Record<SeoTaskPriority, string> = {
  high: "Aukštas",
  medium: "Vidutinis",
  low: "Žemas",
};

const SOURCE_LABEL: Record<SeoTask["source"], string> = {
  insight: "Iš skenavimo",
  manual: "Rankinė",
};

function priorityClass(p: SeoTaskPriority): string {
  if (p === "high") {
    return "border-rose-500/40 bg-rose-950/35 text-rose-200";
  }
  if (p === "low") {
    return "border-zinc-600 bg-zinc-900/60 text-zinc-400";
  }
  return "border-[color-mix(in_oklab,var(--color-electric)_35%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_8%,transparent)] text-[var(--color-electric)]";
}

function sourceClass(s: SeoTask["source"]): string {
  if (s === "manual") {
    return "border-violet-500/35 bg-violet-950/30 text-violet-200";
  }
  return "border-emerald-500/30 bg-emerald-950/25 text-emerald-200/90";
}

type Props = {
  insights: string[];
  scannedUrl: string | null;
  siteTopic: string | null;
};

export function SeoTaskPanel({ insights, scannedUrl, siteTopic }: Props) {
  const [tasks, setTasks] = useState<SeoTask[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [manualDraft, setManualDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    setTasks(loadSeoTasksFromLocalStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSeoTasksToLocalStorage(tasks);
  }, [tasks, hydrated]);

  const displayTasks = useMemo(() => {
    const ins = tasks
      .filter((t) => t.source === "insight")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const man = tasks
      .filter((t) => t.source === "manual")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return [...ins, ...man];
  }, [tasks]);

  const canGenerate = Boolean(scannedUrl && insights.length > 0);
  const canAddManual = Boolean(scannedUrl?.trim());

  const pendingCount = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  const ingestFromInsights = useCallback(() => {
    if (!scannedUrl || insights.length === 0) return;
    const built = buildSeoTasksFromInsights(insights, scannedUrl);
    if (built.length === 0) return;
    setTasks((prev) => mergeSeoTasksDeduped(prev, built));
  }, [insights, scannedUrl]);

  const addManual = useCallback(() => {
    if (!scannedUrl) return;
    const built = buildManualSeoTask(manualDraft, scannedUrl);
    if (!built) return;
    setTasks((prev) => mergeSeoTasksDeduped(prev, [built]));
    setManualDraft("");
  }, [manualDraft, scannedUrl]);

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditingId((e) => (e === id ? null : e));
  }, []);

  const clearAll = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm("Ištrinti visas SEO užduotis šiame įrenginyje?")) return;
    setTasks([]);
    setEditingId(null);
  }, []);

  const startEdit = useCallback((t: SeoTask) => {
    if (t.source !== "manual") return;
    setEditingId(t.id);
    setEditDraft(t.title);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    const next = editDraft.replace(/\s+/g, " ").trim().slice(0, 500);
    if (!next) {
      setEditingId(null);
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId && t.source === "manual" ? { ...t, title: next } : t)),
    );
    setEditingId(null);
  }, [editDraft, editingId]);

  const onExportJson = useCallback(() => {
    const body = exportSeoTasksJson(tasks);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`seo-uzduotys-${stamp}.json`, body, "application/json;charset=utf-8");
  }, [tasks]);

  const onExportCsv = useCallback(() => {
    const body = "\uFEFF" + exportSeoTasksCsv(tasks);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`seo-uzduotys-${stamp}.csv`, body, "text/csv;charset=utf-8");
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO užduotys</CardTitle>
        <CardDescription>
          Darbo vieta: įžvalgos iš skenavimo ir jūsų pastabos vienoje vietoje. Duomenys — šioje naršyklėje (localStorage);
          eksportas JSON / CSV.
          {siteTopic ? (
            <span className="mt-2 block text-zinc-500">
              Kontekstas: <span className="text-zinc-400">{siteTopic}</span>
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            disabled={!canGenerate}
            onClick={ingestFromInsights}
            className="rounded-lg border border-[color-mix(in_oklab,var(--color-lime)_40%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_10%,transparent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-lime)] shadow-[0_0_20px_-6px_color-mix(in_oklab,var(--color-lime)_35%,transparent)] transition hover:bg-[color-mix(in_oklab,var(--color-lime)_16%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Įrašyti užduotis iš įžvalgų
          </button>
          <button
            type="button"
            disabled={tasks.length === 0}
            onClick={onExportJson}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-[var(--color-electric)]/50 disabled:opacity-40"
          >
            Eksportuoti JSON
          </button>
          <button
            type="button"
            disabled={tasks.length === 0}
            onClick={onExportCsv}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-[var(--color-electric)]/50 disabled:opacity-40"
          >
            Eksportuoti CSV
          </button>
          {tasks.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-rose-400/90 underline-offset-2 hover:text-rose-300 hover:underline sm:ml-auto"
            >
              Išvalyti viską
            </button>
          ) : null}
        </div>

        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            addManual();
          }}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="seo-task-manual" className="text-xs font-medium text-zinc-500">
              Savo užduotis (prie šio skano)
            </label>
            <input
              id="seo-task-manual"
              type="text"
              value={manualDraft}
              onChange={(e) => setManualDraft(e.target.value)}
              placeholder="Pvz. atnaujinti telefoną hero bloke, pakeisti nuotrauką „Apie mus“…"
              disabled={!canAddManual}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[var(--color-electric)] disabled:opacity-50"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!canAddManual || !manualDraft.trim()}
            className="shrink-0 rounded-lg border border-[color-mix(in_oklab,var(--color-electric)_45%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_12%,transparent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-electric)] transition hover:bg-[color-mix(in_oklab,var(--color-electric)_18%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pridėti
          </button>
        </form>
        {!canAddManual ? (
          <p className="text-xs text-zinc-600">Rankinėms užduotims reikia nuskanuoto URL (paleiskite skaną aukščiau).</p>
        ) : null}

        {!hydrated ? (
          <p className="text-sm text-zinc-500">Kraunama…</p>
        ) : tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 px-4 py-6 text-center text-sm text-zinc-500">
            Užduočių dar nėra — įrašykite iš įžvalgų arba pridėkite savo pastabą.
          </p>
        ) : (
          <>
            <p className="text-xs text-zinc-500">
              Iš viso: {tasks.length}
              {pendingCount > 0 ? ` · laukia: ${pendingCount}` : " · visos atliktos"}
              <span className="ml-2 text-zinc-600">
                (įžvalgos viršuje, rankinės apačioje — bendras „workspace“, be rišimo prie kategorijų)
              </span>
            </p>
            <ul className="space-y-3">
              {displayTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-3 sm:gap-4"
                >
                  <div className="flex shrink-0 items-start pt-0.5">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleDone(t.id)}
                      aria-label={t.done ? "Žymėti užduotį kaip nepadarytą" : "Žymėti užduotį kaip padarytą"}
                      className="mt-0.5 h-4 w-4 cursor-pointer rounded border-zinc-600 bg-zinc-900 text-[var(--color-electric)] focus:ring-[var(--color-electric)]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {t.source === "manual" && editingId === t.id ? (
                      <input
                        type="text"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitEdit();
                          }
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="w-full rounded-md border border-[var(--color-electric)]/50 bg-zinc-950 px-2 py-1.5 text-sm text-white outline-none"
                        autoFocus
                        aria-label="Redaguoti užduotį"
                      />
                    ) : (
                      <p
                        className={`text-sm leading-relaxed ${t.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}
                        title={t.source === "insight" ? "Tekstas iš įžvalgos — redaguoti negalima" : undefined}
                      >
                        {t.title}
                      </p>
                    )}
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                      <span className={`rounded-md border px-1.5 py-0.5 font-medium ${sourceClass(t.source)}`}>
                        {SOURCE_LABEL[t.source]}
                      </span>
                      <span className={`rounded-md border px-1.5 py-0.5 font-medium ${priorityClass(t.priority)}`}>
                        {PRIORITY_LABEL[t.priority]}
                      </span>
                      <span className="break-all text-zinc-600">{t.sourceUrl}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {t.source === "manual" && editingId !== t.id ? (
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="rounded-md px-2 py-1 text-xs text-[var(--color-electric)] hover:bg-zinc-800"
                      >
                        Redaguoti
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeTask(t.id)}
                      className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                      aria-label="Pašalinti užduotį"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
