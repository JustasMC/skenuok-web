"use client";

import type { FreeAlternativesBundle } from "@/lib/verify-free-alternatives";
import { INSTRUCTOR_SERPER_BLOCK_LABEL } from "@/lib/verify-free-alternatives";
import { classifyInstructorSerpHits } from "@/lib/instructor-trust";
import type { InstructorPresence } from "@/lib/course-quality-scan";

function trustCopy(
  presence: InstructorPresence,
  trust: ReturnType<typeof classifyInstructorSerpHits> | null,
  hasSerpBlock: boolean,
): { badge: string; className: string; detail: string } {
  if (presence === "anonymous") {
    return {
      badge: "Anoniminis lektorius",
      className:
        "border-rose-500/50 bg-[color-mix(in_oklab,var(--color-bg)_88%,#9f1239_12%)] text-rose-100",
      detail:
        "Konkretaus asmens nėra arba tapatybė slepiama — pretenzijoms ir reputacijai nustatyti sunkiau.",
    };
  }
  if (presence === "pseudonym") {
    return {
      badge: "Slapyvardis / prekybinis vardas",
      className:
        "border-amber-500/45 bg-[color-mix(in_oklab,var(--color-bg)_91%,#b45309_9%)] text-amber-100",
      detail: "Nėra aiškaus vardo ir pavardės kaip fizinio asmens — atsakomybė dažnai ribota.",
    };
  }
  if (!hasSerpBlock || trust === null) {
    return {
      badge: "Lektoriaus web paieška",
      className: "border-zinc-600 bg-zinc-900/40 text-zinc-300",
      detail:
        "Serper nebuvo paleistas arba pilname režime nebuvo užklausos — fono patikros nėra.",
    };
  }
  if (trust === "no_hits") {
    return {
      badge: "Ribotas viešas pėdsakas",
      className: "border-amber-500/40 bg-amber-950/30 text-amber-100",
      detail: "Pagal užklausą organinių rezultatų mažai arba jų nerasta — atsargiai vertinkite autoritetą.",
    };
  }
  if (trust === "negative_signals") {
    return {
      badge: "Įspėjimai paieškoje",
      className: "border-rose-500/55 bg-rose-950/35 text-rose-100",
      detail:
        "Rezultatuose pasitaiko įspėjančių žodžių (pvz., scam, complaint) — patikrinkite šaltinius patys.",
    };
  }
  if (trust === "strong_public") {
    return {
      badge: "Viešas profesinis pėdsakas",
      className:
        "border-[color-mix(in_oklab,var(--color-lime)_40%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_10%,transparent)] text-[var(--color-lime)]",
      detail: "Rasta nuorodų į profesinį kontekstą (pvz., LinkedIn, GitHub, oficialūs šaltiniai) — heuristika, neįrodymas.",
    };
  }
  return {
    badge: "Mišrus / neaiškus signalas",
    className: "border-zinc-600 bg-zinc-900/50 text-zinc-200",
    detail: "Rezultatai nevienareikšmiai — peržiūrėkite nuorodas ir patvirtinkite patys.",
  };
}

export function InstructorTrustStrip(props: {
  instructorIdentity: string;
  instructorPresence: InstructorPresence;
  instructorCredentialsHint?: string;
  freeAlternatives: FreeAlternativesBundle | null;
}) {
  const instructorBlock =
    props.freeAlternatives?.status === "completed"
      ? props.freeAlternatives.topics.find((t) => t.topic === INSTRUCTOR_SERPER_BLOCK_LABEL)
      : undefined;

  const trust = instructorBlock ? classifyInstructorSerpHits(instructorBlock.items) : null;
  const hasSerpBlock = Boolean(instructorBlock);
  const { badge, className, detail } = trustCopy(props.instructorPresence, trust, hasSerpBlock);

  return (
    <div className="space-y-3 rounded-lg border border-zinc-700/60 bg-black/15 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Lektoriaus patikra</span>
        <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${className}`}>{badge}</span>
      </div>
      <p className="text-sm text-zinc-200">
        <span className="text-zinc-500">Identitetas: </span>
        {props.instructorIdentity}
      </p>
      {props.instructorCredentialsHint ? (
        <p className="text-xs leading-relaxed text-zinc-400">
          <span className="font-medium text-zinc-500">Kvalifikacija / užuominos tekste: </span>
          {props.instructorCredentialsHint}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-zinc-500">{detail}</p>
      {instructorBlock?.query ? (
        <p className="break-all font-mono text-[10px] text-zinc-600">
          Serper: {instructorBlock.query}
        </p>
      ) : null}
    </div>
  );
}
