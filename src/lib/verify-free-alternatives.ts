/**
 * Serper.dev – Google paieška nemokamų alternatyvų (YouTube / docs) pagal temas.
 * Biudžetas: ribotas užklausų skaičius vienam skenavimui.
 */

import type { SkepticVerdict } from "@/lib/course-skeptic-types";

const SERPER_ENDPOINT = "https://google.serper.dev/search";

export type FreeAltItem = { title: string; link: string; snippet: string };

export type FreeAltTopicResult = {
  topic: string;
  /** Tikroji paieškos užklausa */
  query: string;
  items: FreeAltItem[];
};

/** SCAM – Serper nėra. RIZIKA – tik YouTube + docs. ATSARGIAI / SAUGU – pilna paieška (pamokos + kontekstas). */
export type SerperSearchMode = "alternatives_only" | "full";

export type FreeAlternativesBundle =
  | {
      status: "completed";
      topics: FreeAltTopicResult[];
      note: string;
      serperMode: SerperSearchMode;
    }
  | {
      status: "skipped";
      reason: string;
    };

type SerperOrganic = { title?: string; link?: string; snippet?: string };

/** Ištraukia pirmą tikėtiną EUR sumą iš teksto (699 €, EUR 499, …). */
export function extractEurAmountFromText(text: string | null | undefined): number | null {
  if (!text || !text.trim()) return null;
  const t = text.replace(/\u00a0/g, " ");
  const patterns: RegExp[] = [
    /(\d+(?:[.,]\d+)?)\s*€/,
    /€\s*(\d+(?:[.,]\d+)?)/,
    /(\d+(?:[.,]\d+)?)\s*(?:EUR|eur)\b/,
    /\b(?:EUR|eur)\s*(\d+(?:[.,]\d+)?)/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m?.[1]) {
      const n = parseFloat(m[1].replace(",", "."));
      if (!Number.isNaN(n) && n > 0 && n < 1_000_000) return n;
    }
  }
  return null;
}

function getMinPriceEur(): number {
  const n = Number(process.env.COURSE_SERP_MIN_PRICE_EUR);
  return Number.isFinite(n) && n > 0 ? n : 50;
}

function getMaxQueries(): number {
  const n = Number(process.env.COURSE_SERP_MAX_QUERIES);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 5) : 3;
}

function getItemsPerTopic(): number {
  const n = Number(process.env.COURSE_SERP_ITEMS_PER_TOPIC);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 5) : 2;
}

/**
 * Ar verta leisti Serper (kreditai + API): turi raktą, temas, ir bent vieną „rizikos“ signalą.
 * SCAM – niekada (taupome kvotas; alternatyvos neprasmingos).
 */
export function shouldRunSerperVerification(input: {
  serperApiKey: string | undefined;
  topics: string[];
  valueIndex: number;
  priceEur: number | null;
  recommendation: "search_free" | "consider" | "likely_fair" | "unclear";
  skepticVerdict: SkepticVerdict;
}): boolean {
  if (!input.serperApiKey?.trim()) return false;
  if (input.skepticVerdict === "SCAM") return false;
  const topics = input.topics.map((t) => t.trim()).filter(Boolean);
  if (topics.length === 0) return false;

  const minPrice = getMinPriceEur();
  if (input.priceEur !== null && input.priceEur >= minPrice) return true;
  if (input.valueIndex < 40) return true;
  if (input.recommendation === "search_free") return true;
  return false;
}

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

/** Google paieškos inkaras: „bendras investavimas“ LT SERPe dažnai nuveda į bankus / paskolas. */
const CRYPTO_QUERY_ANCHOR =
  "(bitcoin OR blockchain OR crypto OR kripto OR kriptovaliut OR ethereum OR web3 OR defi OR altcoin OR trading)";

/** Neigiami raktažodžiai (tik kripto režime), kad sumažėtų būsto paskolų / bankų triukšmas. */
const CRYPTO_GOOGLE_NEGATIONS = "-paskola -hipoteka -nekilnojam -refinansavimas";

/**
 * Ar temų tekstas labiau apie kriptovaliutas (LT + EN žodynas).
 * Naudojame visą `searchTopics` sąjungą `verifyFreeAlternatives` viduje.
 */
export function isCryptoHeavyTopic(text: string): boolean {
  const s = text.toLowerCase();
  if (/kriptovaliut|kriptograf|blokgrand|kripto\b/.test(s)) return true;
  if (
    /\b(bitcoin|bitkoin|btc|ethereum|eth|blockchain|defi|altcoin|stablecoin|nft|web3|solana|cardano|dogecoin|binance|coinbase|mining|crypto|token|wallet|satoshi)\b/.test(
      s,
    )
  )
    return true;
  return false;
}

function isEnglishSerperLocaleForCryptoYoutube(): boolean {
  const v = process.env.COURSE_SERP_CRYPTO_USE_ENGLISH?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Po paieškos: palieka rezultatus, kuriuose pavadinime ar snippetėje aiškus kripto kontekstas. */
function filterCryptoRelevantOrganic(items: FreeAltItem[]): FreeAltItem[] {
  const re =
    /\b(kripto|kriptovaliut|bitkoin|bitcoin|blockchain|blokgrand|ethereum|defi|altcoin|crypto|web3|btc|eth|token|wallet|trading|coinbase|binance|mining|nft|satoshi)\b/i;
  const filtered = items.filter((it) => re.test(it.title) || re.test(it.snippet));
  return filtered.length > 0 ? filtered : items;
}

/**
 * RIZIKA ir „numatytasis“ taupymas: tik saugus išėjimas – YouTube + oficiali / nemokama dokumentacija.
 * Nėra plačios paieškos „apie svetainę“ ar mokamų konkurentų katalogo.
 */
export function buildAlternativesOnlyQuery(topic: string, slotIndex: number, cryptoIntent = false): string {
  const t = normalizeTopic(topic);
  if (slotIndex === 0) {
    if (cryptoIntent) {
      return `${CRYPTO_QUERY_ANCHOR} ${t} tutorial site:youtube.com ${CRYPTO_GOOGLE_NEGATIONS}`;
    }
    return `${t} tutorial site:youtube.com`;
  }
  if (cryptoIntent) {
    return `${CRYPTO_QUERY_ANCHOR} ${t} official documentation getting started tutorial beginner ${CRYPTO_GOOGLE_NEGATIONS}`;
  }
  return `${t} official documentation getting started tutorial beginner`;
}

/**
 * ATSARGIAI / SAUGU: pamokos + rinkos kontekstas (atsiliepimai, palyginimas) + nemokamos alternatyvos.
 */
export function buildFullSerperQuery(topic: string, slotIndex: number, cryptoIntent = false): string {
  const t = normalizeTopic(topic);
  if (slotIndex === 0) {
    if (cryptoIntent) {
      return `${CRYPTO_QUERY_ANCHOR} ${t} tutorial site:youtube.com ${CRYPTO_GOOGLE_NEGATIONS}`;
    }
    return `${t} tutorial site:youtube.com`;
  }
  if (slotIndex === 1) {
    if (cryptoIntent) {
      return `${CRYPTO_QUERY_ANCHOR} ${t} online course reviews comparison worth it alternative ${CRYPTO_GOOGLE_NEGATIONS}`;
    }
    return `${t} online course reviews comparison worth it alternative`;
  }
  if (cryptoIntent) {
    return `${CRYPTO_QUERY_ANCHOR} ${t} free course tutorial Udemy Coursera YouTube alternative ${CRYPTO_GOOGLE_NEGATIONS}`;
  }
  return `${t} free course tutorial Udemy Coursera YouTube alternative`;
}

/** Pilnas režimas: papildoma užklausa apie lektoriaus reputaciją (ne tema, o asmuo). */
export function buildInstructorReputationQuery(instructorName: string): string {
  const q = instructorName.trim().replace(/"/g, "");
  if (!q) return 'course instructor reviews scam linkedin';
  return `"${q}" reviews scam linkedin experience background`;
}

export const INSTRUCTOR_SERPER_BLOCK_LABEL = "Lektoriaus fono paieška";

function isUsableInstructorSearchName(name: string | null | undefined): boolean {
  const t = name?.trim() ?? "";
  if (t.length < 2) return false;
  if (/^anonymous$/i.test(t)) return false;
  if (/^nežinoma$/i.test(t)) return false;
  return true;
}

export type SerperTopicPlan = {
  mode: SerperSearchMode;
  /** Kiek pagrindinių (temų) užklausų: YouTube / atsiliepimai / alternatyvos */
  topicSlots: number;
  /** Papildoma 4-oji užklausa tik full + žinomas vardas */
  runInstructorQuery: boolean;
};

/** Koks Serper planas pagal skeptiko verdiktą (biudžetas + etika). */
export function getSerperSearchPlan(
  verdict: SkepticVerdict,
  instructorSearchName?: string | null,
): SerperTopicPlan {
  const cap = getMaxQueries();
  const canInstructor = isUsableInstructorSearchName(instructorSearchName);

  switch (verdict) {
    case "RIZIKA":
      return { mode: "alternatives_only", topicSlots: Math.min(2, cap), runInstructorQuery: false };
    case "ATSARGIAI":
    case "SAUGU": {
      const topicSlots = Math.min(3, cap);
      return {
        mode: "full",
        topicSlots,
        runInstructorQuery: canInstructor,
      };
    }
    default:
      return { mode: "alternatives_only", topicSlots: Math.min(2, cap), runInstructorQuery: false };
  }
}

function blockLabel(mode: SerperSearchMode, slotIndex: number): string {
  if (mode === "full") {
    const labels = ["YouTube pamokos", "Atsiliepimai ir konkurentai", "Nemokamos / palyginimo alternatyvos"];
    return labels[slotIndex] ?? `Paieška ${slotIndex + 1}`;
  }
  const labels = ["YouTube (nemokama)", "Dokumentacija ir vadovėliai"];
  return labels[slotIndex] ?? `Alternatyva ${slotIndex + 1}`;
}

export type SerperSearchOptions = {
  num?: number;
  /** Google region (pvz. us) — kartu su hl padidina angliško YouTube dalį kripto temoms. */
  gl?: string;
  hl?: string;
};

export async function serperSearch(
  query: string,
  apiKey: string,
  num = 8,
  options?: SerperSearchOptions,
): Promise<FreeAltItem[]> {
  const n = options?.num ?? num;
  const body: Record<string, unknown> = { q: query, num: n };
  if (options?.gl) body.gl = options.gl;
  if (options?.hl) body.hl = options.hl;

  const res = await fetch(SERPER_ENDPOINT, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Serper ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as { organic?: SerperOrganic[] };
  const organic = data.organic ?? [];
  const cap = getItemsPerTopic();
  return organic.slice(0, cap).map((o) => ({
    title: typeof o.title === "string" ? o.title : "Rezultatas",
    link: typeof o.link === "string" ? o.link : "#",
    snippet: typeof o.snippet === "string" ? o.snippet : "",
  }));
}

/**
 * Serper pagal skeptiko verdiktą: RIZIKA – tik alternatyvos (YouTube + docs); ATSARGIAI / SAUGU – pilnas rinkinys.
 * Temų užklausoms naudojama pirma AI tema; full + žinomas lektorius: papildoma reputacijos paieška.
 */
export async function verifyFreeAlternatives(
  topics: string[],
  serperApiKey: string,
  opts: { skepticVerdict: SkepticVerdict; instructorSearchName?: string | null },
): Promise<FreeAlternativesBundle> {
  const plan = getSerperSearchPlan(opts.skepticVerdict, opts.instructorSearchName);
  const cleaned = topics.map((t) => t.trim()).filter((t) => t.length >= 2);
  if (cleaned.length === 0) {
    return { status: "skipped", reason: "Nėra tinkamų paieškos temų." };
  }

  const primaryTopic = cleaned[0];
  const cryptoIntent = isCryptoHeavyTopic(cleaned.join(" "));
  const topicsOut: FreeAltTopicResult[] = [];
  const cryptoYoutubeLocale = isEnglishSerperLocaleForCryptoYoutube() ? ({ gl: "us", hl: "en" } as const) : undefined;

  for (let slot = 0; slot < plan.topicSlots; slot++) {
    const query =
      plan.mode === "full"
        ? buildFullSerperQuery(primaryTopic, slot, cryptoIntent)
        : buildAlternativesOnlyQuery(primaryTopic, slot, cryptoIntent);
    const topic = blockLabel(plan.mode, slot);
    const youtubeSlot = slot === 0;
    try {
      const serperOpts =
        cryptoIntent && youtubeSlot && cryptoYoutubeLocale
          ? { ...cryptoYoutubeLocale }
          : undefined;
      let items = await serperSearch(query, serperApiKey, 8, serperOpts);
      if (cryptoIntent && youtubeSlot) {
        items = filterCryptoRelevantOrganic(items);
      }
      topicsOut.push({ topic, query, items });
    } catch {
      topicsOut.push({ topic, query, items: [] });
    }
  }

  if (plan.runInstructorQuery && isUsableInstructorSearchName(opts.instructorSearchName)) {
    const name = opts.instructorSearchName!.trim();
    const query = buildInstructorReputationQuery(name);
    try {
      const items = await serperSearch(query, serperApiKey);
      topicsOut.push({ topic: INSTRUCTOR_SERPER_BLOCK_LABEL, query, items });
    } catch {
      topicsOut.push({ topic: INSTRUCTOR_SERPER_BLOCK_LABEL, query, items: [] });
    }
  }

  const anyResults = topicsOut.some((t) => t.items.length > 0);
  const note =
    plan.mode === "full"
      ? anyResults
        ? `Pilna paieška (ATSARGIAI / SAUGU): YouTube, rinkos kontekstas, alternatyvos${
            plan.runInstructorQuery ? " ir lektoriaus fono užklausa" : ""
          }. Realūs Google top rezultatai per Serper – visada patikrinkite patys.`
        : "Pilna paieška negrąžino aiškių rezultatų (arba API klaida). Niša gali būti siaura arba autorinė."
      : anyResults
        ? "Rizikos režimas: tik nemokamas turinys (YouTube + dokumentacija / vadovėliai), be plačios „rinkos“ paieškos – taupome kvotas ir duodame saugų išėjimo kelią."
        : "Alternatyvų paieška negrąžino aiškių rezultatų (arba API klaida).";

  return {
    status: "completed",
    topics: topicsOut,
    note,
    serperMode: plan.mode,
  };
}

export { getMinPriceEur, getMaxQueries };

/** Aiškina, kodėl Serper nebuvo paleistas (vartotojo sąsajai). */
export function explainSerperSkipped(input: {
  serperApiKey: string | undefined;
  topics: string[];
  valueIndex: number;
  priceEur: number | null;
  recommendation: "search_free" | "consider" | "likely_fair" | "unclear";
  skepticVerdict: SkepticVerdict;
}): string {
  if (!input.serperApiKey?.trim()) {
    return "Serper nekonfigūruotas: pridėkite SERPER_API_KEY į .env (google.serper.dev).";
  }
  if (input.skepticVerdict === "SCAM") {
    return "Serper nevykdomas: skeptiko verdiktas SCAM – nemokamų alternatyvų paieška čia neprasminga; taupome API kvotas.";
  }
  if (input.topics.length === 0) {
    return "Nėra paieškos temų (searchTopics) – negalime paleisti Google paieškos alternatyvoms.";
  }
  const min = getMinPriceEur();
  return `Šiam rezultatui Serper neaktyvuotas: aktyvuojama, jei kaina ≥ ${min} € (aptikta: ${input.priceEur != null ? `${input.priceEur} €` : "nežinoma"}), arba vertės indeksas < 40 (dabar ${input.valueIndex}), arba rekomendacija „ieškoti nemokamai“ (dabar: ${input.recommendation}).`;
}
