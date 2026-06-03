import { z } from "zod";

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;
  if (host.endsWith(".local")) return true;

  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^\[?(fc|fd)[0-9a-f]*:/i.test(host)) return true;

  return false;
}

function validatePublicHttpUrl(rawValue: string): boolean {
  const trimmed = rawValue.trim();
  if (!trimmed) return false;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    if (isPrivateHostname(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

export const scanRequestSchema = z.object({
  url: z
    .string()
    .min(1, "Įveskite URL")
    .refine((value) => validatePublicHttpUrl(value), "Įveskite viešą HTTP(S) URL"),
  strategy: z.enum(["mobile", "desktop"]).optional().default("mobile"),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;
