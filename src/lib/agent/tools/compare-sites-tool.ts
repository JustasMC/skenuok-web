import { z } from "zod";
import { executeSeoScanTool, type ToolExecutionContext } from "@/lib/agent/tools/seo-scan-tool";

export type CompareToolContext = ToolExecutionContext & {
  /** Prieš kiekvieną PageSpeed kvietimą (1/2 ir 2/2 palyginime). */
  onScanProgress?: (p: { index: number; total: number; url: string }) => void;
};

export const COMPARE_SITES_TOOL_NAME = "compare_sites_seo" as const;

const compareSchema = z.object({
  url_a: z.string().min(1, "url_a"),
  url_b: z.string().min(1, "url_b"),
  strategy: z.enum(["mobile", "desktop"]).optional().default("mobile"),
});

export const compareSitesOpenAiTool = {
  type: "function" as const,
  function: {
    name: COMPARE_SITES_TOOL_NAME,
    description:
      "Palygina dviejų URL Lighthouse SEO, našumo ir prieinamumo balus vienu iškvietimu. Naudok, kai vartotojas prašo palyginti dvi svetaines ar puslapius. Tai sunaudoja du skenavimus (du kartus daugiau nei vienas URL).",
    parameters: {
      type: "object",
      properties: {
        url_a: { type: "string", description: "Pirmasis URL" },
        url_b: { type: "string", description: "Antrasis URL" },
        strategy: {
          type: "string",
          enum: ["mobile", "desktop"],
          description: "Lighthouse strategija (numatytasis mobile).",
        },
      },
      required: ["url_a", "url_b"],
    },
  },
};

export async function executeCompareSitesTool(rawArgs: unknown, ctx: CompareToolContext): Promise<string> {
  const parsed = compareSchema.safeParse(rawArgs);
  if (!parsed.success) {
    return JSON.stringify({
      error: "Neteisingi parametrai",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { url_a, url_b, strategy } = parsed.data;
  const out: Record<string, unknown> = { strategy };

  const urls: [string, "a" | "b"][] = [
    [url_a, "a"],
    [url_b, "b"],
  ];

  for (let i = 0; i < urls.length; i++) {
    const [url, label] = urls[i]!;
    if (ctx.abortSignal?.aborted) {
      return JSON.stringify({
        error: "Užklausa nutraukta prieš visus skenavimus.",
        partial: out,
      });
    }
    /* Pirmą etapą (1/2) jau rodo SSE tool_start; čia – tik antras URL prieš antrą skenavimą. */
    if (i > 0) {
      ctx.onScanProgress?.({ index: i + 1, total: urls.length, url });
    }
    const allowScan = () => ctx.allowScan();
    const observation = await executeSeoScanTool({ url, strategy }, { allowScan, abortSignal: ctx.abortSignal });
    try {
      out[label] = JSON.parse(observation) as unknown;
    } catch {
      out[label] = observation;
    }
  }

  return JSON.stringify({
    compared: true,
    summary: "Du puslapiai nuskaityti; palyginkite scores ir insights laukus.",
    ...out,
  });
}
