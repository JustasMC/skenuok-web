import { z } from "zod";

export const NICHE_IDS = ["web", "crypto", "auto", "beauty", "home", "tech"] as const;
export type NicheId = (typeof NICHE_IDS)[number];

export const nicheScanRequestSchema = z.object({
  niche: z.enum(NICHE_IDS),
  locale: z.enum(["lt", "en"]).optional(),
  /** Free-text: URL, VIN, symbol, specs, etc. */
  text: z.string().trim().max(4000).optional(),
  /** data:image/...;base64,... or https URL */
  imageDataUrl: z
    .string()
    .max(6_000_000)
    .optional()
    .refine(
      (v) => !v || v.startsWith("data:image/") || /^https:\/\//i.test(v),
      "Neteisingas paveikslėlio formatas",
    ),
});

export type NicheScanRequest = z.infer<typeof nicheScanRequestSchema>;

export type AffiliateRec = {
  slug: string;
  category: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

export type NicheScanReport = {
  ok: true;
  niche: NicheId;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  bullets: string[];
  affiliates: AffiliateRec[];
  source: "openai" | "fallback";
};

export type NicheScanError = {
  ok: false;
  error: string;
  status: number;
};
