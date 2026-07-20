"use client";

import { useDict } from "@/components/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries/lt";
import type { FreeAlternativesBundle } from "@/lib/verify-free-alternatives";
import { INSTRUCTOR_SERPER_BLOCK_LABEL } from "@/lib/verify-free-alternatives";
import { classifyInstructorSerpHits } from "@/lib/instructor-trust";
import type { InstructorPresence } from "@/lib/course-quality-scan";

function trustCopy(
  presence: InstructorPresence,
  trust: ReturnType<typeof classifyInstructorSerpHits> | null,
  hasSerpBlock: boolean,
  labels: Dictionary["tools"]["courseReport"]["instructorTrust"],
): { badge: string; className: string; detail: string } {
  if (presence === "anonymous") {
    return {
      badge: labels.anonymous.badge,
      className:
        "border-rose-500/50 bg-[color-mix(in_oklab,var(--color-bg)_88%,#9f1239_12%)] text-rose-100",
      detail: labels.anonymous.detail,
    };
  }
  if (presence === "pseudonym") {
    return {
      badge: labels.pseudonym.badge,
      className:
        "border-amber-500/45 bg-[color-mix(in_oklab,var(--color-bg)_91%,#b45309_9%)] text-amber-100",
      detail: labels.pseudonym.detail,
    };
  }
  if (!hasSerpBlock || trust === null) {
    return {
      badge: labels.noSerp.badge,
      className: "border-zinc-600 bg-zinc-900/40 text-zinc-300",
      detail: labels.noSerp.detail,
    };
  }
  if (trust === "no_hits") {
    return {
      badge: labels.noHits.badge,
      className: "border-amber-500/40 bg-amber-950/30 text-amber-100",
      detail: labels.noHits.detail,
    };
  }
  if (trust === "negative_signals") {
    return {
      badge: labels.negativeSignals.badge,
      className: "border-rose-500/55 bg-rose-950/35 text-rose-100",
      detail: labels.negativeSignals.detail,
    };
  }
  if (trust === "strong_public") {
    return {
      badge: labels.strongPublic.badge,
      className:
        "border-[color-mix(in_oklab,var(--color-lime)_40%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_10%,transparent)] text-[var(--color-lime)]",
      detail: labels.strongPublic.detail,
    };
  }
  return {
    badge: labels.mixed.badge,
    className: "border-zinc-600 bg-zinc-900/50 text-zinc-200",
    detail: labels.mixed.detail,
  };
}

export function InstructorTrustStrip(props: {
  instructorIdentity: string;
  instructorPresence: InstructorPresence;
  instructorCredentialsHint?: string;
  freeAlternatives: FreeAlternativesBundle | null;
}) {
  const labels = useDict().tools.courseReport.instructorTrust;
  const instructorBlock =
    props.freeAlternatives?.status === "completed"
      ? props.freeAlternatives.topics.find((t) => t.topic === INSTRUCTOR_SERPER_BLOCK_LABEL)
      : undefined;

  const trust = instructorBlock ? classifyInstructorSerpHits(instructorBlock.items) : null;
  const hasSerpBlock = Boolean(instructorBlock);
  const { badge, className, detail } = trustCopy(props.instructorPresence, trust, hasSerpBlock, labels);

  return (
    <div className="space-y-3 rounded-lg border border-zinc-700/60 bg-black/15 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{labels.sectionTitle}</span>
        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${className}`}>{badge}</span>
      </div>
      <p className="text-sm text-zinc-200">
        <span className="text-zinc-500">{labels.identityLabel} </span>
        {props.instructorIdentity}
      </p>
      {props.instructorCredentialsHint ? (
        <p className="text-xs leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-500">{labels.credentialsLabel} </span>
          {props.instructorCredentialsHint}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-zinc-500">{detail}</p>
      {instructorBlock?.query ? (
        <p className="break-all font-mono text-[10px] text-zinc-600">
          {labels.serperPrefix} {instructorBlock.query}
        </p>
      ) : null}
    </div>
  );
}
