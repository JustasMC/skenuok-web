import type { Dictionary } from "@/lib/i18n/get-dictionary";

/** Rotating tips shown while tools run (wait psychology). */
export function getSeoWaitTips(agent: Dictionary["agent"]): readonly string[] {
  const { waitTips } = agent;
  return [waitTips.tip0, waitTips.tip1, waitTips.tip2, waitTips.tip3, waitTips.tip4, waitTips.tip5];
}

/** @deprecated Use getSeoWaitTips(dict.agent) */
export const SEO_WAIT_TIPS_LT = [
  "Lighthouse matuoja našumą, SEO ir prieinamumą pagal tikrus naršyklės duomenis — tai gali užtrukti 15–45 s.",
  "Jei lyginate dvi svetaines, kiekvienai vykdomas atskiras PageSpeed skenavimas.",
  "Geras title ir unikalus meta description vis dar yra pagrindinis SEO signalas paieškai.",
  "Mobile strategija dažnai atskleidžia didesnius našumo skirtumus nei desktop.",
  "Vidinės nuorodos padeda paieškos robotams suprasti puslapio hierarchiją.",
  "Core Web Vitals veikia kaip našumo kokybės signalas — ne tik „balas“.",
] as const;
