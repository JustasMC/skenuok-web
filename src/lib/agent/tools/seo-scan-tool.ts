import { scanRequestSchema } from "@/lib/scan-schema";
import { runSeoScan } from "@/lib/seo-scan-service";

export const SEO_SCAN_TOOL_NAME = "scan_site_seo" as const;

/** OpenAI Chat Completions „tools“ formatas (JSON Schema). */
export const seoScanOpenAiTool = {
  type: "function" as const,
  function: {
    name: SEO_SCAN_TOOL_NAME,
    description:
      "Paleidžia Lighthouse/PageSpeed SEO, našumo ir prieinamumo auditą vienam URL. Naudok, kai reikia faktinių balų ir rekomendacijų apie konkretų puslapį. Nekviesk be aiškaus URL; strategy pasirink mobile (numatytasis), nebent vartotojas prašo desktop.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Pilnas arba sutrumpintas URL, pvz. https://example.com arba example.com/kontaktai",
        },
        strategy: {
          type: "string",
          enum: ["mobile", "desktop"],
          description: "Lighthouse strategija: mobile (numatytasis) arba desktop.",
        },
      },
      required: ["url"],
    },
  },
};

const argsSchema = scanRequestSchema;

export type ToolExecutionContext = {
  /** Jei false – nevykdome skenavimo (rate limit / biudžetas). */
  allowScan: () => boolean;
  /** Nutraukia PageSpeed HTTP užklausą (ne Prisma / lead). */
  abortSignal?: AbortSignal;
};

/**
 * Vykdo įrankį; grąžina JSON eilutę stebėjimui (Observe), be Lighthouse „raw“.
 */
export async function executeSeoScanTool(
  rawArgs: unknown,
  ctx: ToolExecutionContext,
): Promise<string> {
  const parsed = argsSchema.safeParse(rawArgs);
  if (!parsed.success) {
    return JSON.stringify({
      error: "Neteisingi parametrai",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  if (!ctx.allowScan()) {
    return JSON.stringify({
      error: "Saugiklis: šiuo metu negalima paleisti papildomo skenavimo (limitas arba biudžetas).",
    });
  }

  const result = await runSeoScan(parsed.data, { signal: ctx.abortSignal });
  if (!result.ok) {
    return JSON.stringify({ error: result.error });
  }

  return JSON.stringify({
    url: result.url,
    strategy: result.strategy,
    scores: result.scores,
    insights: result.insights,
    insightsSource: result.insightsSource,
    siteTopic: result.siteTopic,
    siteDescription: result.siteDescription,
    page: result.page,
    meta: result.meta,
  });
}

export function parseToolArguments(argumentsJson: string): unknown {
  try {
    return JSON.parse(argumentsJson) as unknown;
  } catch {
    return {};
  }
}
