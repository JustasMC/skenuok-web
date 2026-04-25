import type { SeoTask, SeoTaskSource } from "@/lib/seo-task-types";
import { SEO_TASKS_STORAGE_KEY } from "@/lib/seo-task-types";
import { taskDedupeKey } from "@/lib/insights-to-seo-tasks";

function isTaskShape(o: Record<string, unknown>): boolean {
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    (o.priority === "high" || o.priority === "medium" || o.priority === "low") &&
    typeof o.sourceUrl === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.done === "boolean"
  );
}

function normalizeSource(v: unknown): SeoTaskSource {
  return v === "manual" ? "manual" : "insight";
}

function migrateToSeoTask(x: unknown): SeoTask | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (!isTaskShape(o)) return null;
  return {
    id: o.id as string,
    title: o.title as string,
    priority: o.priority as SeoTask["priority"],
    sourceUrl: o.sourceUrl as string,
    createdAt: o.createdAt as string,
    done: o.done as boolean,
    source: normalizeSource(o.source),
  };
}

export function loadSeoTasksFromLocalStorage(): SeoTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEO_TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateToSeoTask).filter((t): t is SeoTask => t != null);
  } catch {
    return [];
  }
}

export function saveSeoTasksToLocalStorage(tasks: SeoTask[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEO_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore quota */
  }
}

/** Prideda tik tas užduotis, kurių dar nėra (tas pats URL + tas pats pavadinimas). */
export function mergeSeoTasksDeduped(existing: SeoTask[], incoming: SeoTask[]): SeoTask[] {
  const keys = new Set(existing.map((t) => taskDedupeKey(t.title, t.sourceUrl, t.source)));
  const next = [...existing];
  for (const t of incoming) {
    const k = taskDedupeKey(t.title, t.sourceUrl, t.source);
    if (keys.has(k)) continue;
    keys.add(k);
    next.push(t);
  }
  return next;
}

export function exportSeoTasksJson(tasks: SeoTask[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      generator: SEO_TASKS_STORAGE_KEY,
      tasks,
    },
    null,
    2,
  );
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportSeoTasksCsv(tasks: SeoTask[]): string {
  const header = ["id", "title", "source", "priority", "done", "sourceUrl", "createdAt"];
  const lines = [header.join(",")];
  for (const t of tasks) {
    lines.push(
      [
        csvEscape(t.id),
        csvEscape(t.title),
        csvEscape(t.source),
        csvEscape(t.priority),
        t.done ? "1" : "0",
        csvEscape(t.sourceUrl),
        csvEscape(t.createdAt),
      ].join(","),
    );
  }
  return lines.join("\r\n");
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
