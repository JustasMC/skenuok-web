export type SeoTaskPriority = "high" | "medium" | "low";

/** Įžvalgos iš skenavimo — pavadinimo keisti negalima (tik pažymėti / trinti). */
export type SeoTaskSource = "insight" | "manual";

export type SeoTask = {
  id: string;
  /** Viena aiški veiksmo eilutė. */
  title: string;
  priority: SeoTaskPriority;
  /** URL, kuriam sugeneruota užduotis (įskaitant rankines pastabas prie dabartinio skano). */
  sourceUrl: string;
  createdAt: string;
  done: boolean;
  /** insight = iš AI/Lighthouse įžvalgų; manual = vartotojo įvesta. */
  source: SeoTaskSource;
};

export const SEO_TASKS_STORAGE_KEY = "fsai-seo-tasks-v1";
