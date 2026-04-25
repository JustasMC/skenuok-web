import type { CourseQualityPayload } from "@/lib/course-quality-scan";

/** Bazinis nurašymas: PSI + HTML + OpenAI (be Serper). */
export function getCourseScanCreditsBase(): number {
  const n = Number(process.env.COURSE_SCAN_CREDITS_BASE);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
}

/** Papildomas kreditas, kai Serper paieška buvo įvykdyta ir grąžinti rezultatai. */
export function getCourseScanCreditsSerperExtra(): number {
  const n = Number(process.env.COURSE_SCAN_CREDITS_SERPER_EXTRA);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
}

/** Minimalus balansas prieš pradedant analizę = blogiausias atvejis (su Serper). */
export function getCourseScanCreditsRequired(): number {
  return getCourseScanCreditsBase() + getCourseScanCreditsSerperExtra();
}

/** Kiek nurašyti po sėkmingos analizės. */
export function computeCourseScanCreditsCharged(payload: CourseQualityPayload): number {
  const base = getCourseScanCreditsBase();
  const extra = getCourseScanCreditsSerperExtra();
  if (payload.freeAlternatives.status !== "completed") {
    return base;
  }
  const hadSerperHits = payload.freeAlternatives.topics.some((t) => t.items.length > 0);
  return hadSerperHits ? base + extra : base;
}
