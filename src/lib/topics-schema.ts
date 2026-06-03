import { z } from "zod";

export const topicsRequestSchema = z.object({
  url: z.string().min(1),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  keywords: z.array(z.string()).optional().default([]),
  scores: z.object({
    performance: z.number().nullable(),
    seo: z.number().nullable(),
    accessibility: z.number().nullable(),
  }),
  insights: z.array(z.string()).default([]),
});

export type TopicsRequest = z.infer<typeof topicsRequestSchema>;
