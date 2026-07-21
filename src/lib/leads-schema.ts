import { z } from "zod";

export const leadTypeSchema = z.enum(["trading_bot", "web_dev", "seo", "contact"]);

export const structuredLeadSchema = z.object({
  name: z.string().min(1, "Įveskite vardą").max(120),
  email: z.string().email("Neteisingas el. pašto formatas").max(254),
  company: z.string().max(200).optional(),
  message: z.string().min(1, "Įveskite žinutę").max(8000),
  type: leadTypeSchema.default("contact"),
  service: z.string().max(200).optional(),
  estimatedValue: z.number().nonnegative().max(1_000_000).optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  /** Honeypot */
  website: z.string().optional(),
});

export type StructuredLeadPayload = z.infer<typeof structuredLeadSchema>;
