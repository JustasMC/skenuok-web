/**
 * Agento paleidimo biudžetas ir saugikliai (žingsniai, tokenų įvertinimas, įrankių kvotos).
 */

export type AgentRunLimits = {
  /** Maks. Thought→Act→Observe iteracijų (LLM kvietimų) */
  maxSteps: number;
  /** Maks. PageSpeed skenavimų per vieną agento užklausą (vienas URL = 1, palyginimas = 2) */
  maxToolScans: number;
  /** Bendras įvertintų tokenų limitas pokalbiui (apytiksliai) */
  maxEstimatedTokens: number;
};

const envInt = (name: string, fallback: number) => {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function getAgentLimitsFromEnv(): AgentRunLimits {
  return {
    maxSteps: envInt("AGENT_MAX_STEPS", 6),
    /** Vienas PageSpeed kvietimas = 1 vienetas; palyginimas naudoja 2. */
    maxToolScans: envInt("AGENT_MAX_TOOL_SCANS", 8),
    maxEstimatedTokens: envInt("AGENT_MAX_ESTIMATED_TOKENS", 18000),
  };
}

/** Apytikslis tokenų skaičius (char/4), pakankamas biudžeto stabdymui. */
export function estimateTextTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export type ScanSlotTracker = {
  tryConsume: () => boolean;
  getUsed: () => number;
};

export function createScanSlotTracker(maxScans: number): ScanSlotTracker {
  let used = 0;
  return {
    tryConsume: () => {
      if (used >= maxScans) return false;
      used += 1;
      return true;
    },
    getUsed: () => used,
  };
}
