import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const SAVE_SEO_TASKS_TOOL_NAME = "save_seo_tasks" as const;

const taskRow = z.object({
  title: z.string().trim().min(1).max(500),
  priority: z.enum(["low", "medium", "high"]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

const schema = z.object({
  tasks: z.array(taskRow).min(1).max(25),
});

export const saveSeoTasksOpenAiTool = {
  type: "function" as const,
  function: {
    name: SAVE_SEO_TASKS_TOOL_NAME,
    description:
      "Įrašo SEO užduočių sąrašą į vartotojo darbo vietą (duomenų bazė). Naudok, kai vartotojas prašo „užsirašyk užduotis“, „sukurk checklistę“ arba po auditų nori konkretaus veiksmų sąrašo. Kiekviena užduotis turi trumpą pavadinimą; priority ir notes neprivalomi.",
    parameters: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          description: "1–25 užduočių su title (privaloma), priority (optional), notes (optional).",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
              notes: { type: "string" },
            },
            required: ["title"],
          },
        },
      },
      required: ["tasks"],
    },
  },
};

export async function executeSaveSeoTasksTool(rawArgs: unknown, userId: string): Promise<string> {
  const parsed = schema.safeParse(rawArgs);
  if (!parsed.success) {
    return JSON.stringify({
      error: "Neteisingi parametrai",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const created = await prisma.$transaction(
    parsed.data.tasks.map((t) =>
      prisma.seoTask.create({
        data: {
          userId,
          title: t.title,
          priority: t.priority ?? null,
          notes: t.notes ?? null,
        },
        select: { id: true, title: true },
      }),
    ),
  );

  return JSON.stringify({
    saved: created.length,
    tasks: created,
    message: "Užduotys įrašytos į darbo vietą.",
  });
}
