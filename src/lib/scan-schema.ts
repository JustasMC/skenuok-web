import { z } from "zod";

export const scanRequestSchema = z.object({
  url: z.string().min(1, "Įveskite URL"),
  strategy: z.enum(["mobile", "desktop"]).optional().default("mobile"),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;
