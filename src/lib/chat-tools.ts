import { z } from "zod";
import { contactPayloadSchema } from "@/lib/contact-schema";
import { createLeadAndNotify } from "@/lib/lead-actions";
import { assertContactRateLimit } from "@/lib/rate-limit";

export const REGISTER_CONSULTATION_TOOL_NAME = "register_consultation_request" as const;

/** OpenAI Chat Completions `tools` masyvas. */
export const CHAT_OPENAI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: REGISTER_CONSULTATION_TOOL_NAME,
      description:
        "Užregistruoti konsultacijos užklausą duomenų bazėje ir pranešti komandai (Discord/Telegram), kai vartotojas aiškiai davė vardą, el. paštą ir sutinka susisiekti. Nekviesk be realaus el. pašto ir trumpo aprašo.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Vardas arba kaip kreiptis" },
          email: { type: "string", description: "Galiojantis el. paštas" },
          message: {
            type: "string",
            description: "Trumpa užklausos esmė (konsultacijos tema, problema)",
          },
          company: { type: "string", description: "Įmonė (nebūtina)" },
          topic: {
            type: "string",
            description: "Paslaugos sritis / tema (nebūtina), pvz. SEO, AI agentai",
          },
        },
        required: ["name", "email", "message"],
      },
    },
  },
];

const registerArgsSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  company: z.string().optional(),
  topic: z.string().optional(),
});

export async function executeChatTool(
  name: string,
  argumentsJson: string,
  clientKey: string,
): Promise<string> {
  if (name !== REGISTER_CONSULTATION_TOOL_NAME) {
    return JSON.stringify({ ok: false, error: `Nežinomas įrankis: ${name}` });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(argumentsJson) as unknown;
  } catch {
    return JSON.stringify({ ok: false, error: "Neteisingi įrankio parametrai (JSON)" });
  }

  const parsed = registerArgsSchema.safeParse(raw);
  if (!parsed.success) {
    return JSON.stringify({
      ok: false,
      error: "Trūksta arba neteisingi laukai (vardas, el. paštas, žinutė).",
    });
  }

  const rate = assertContactRateLimit(`chat-lead:${clientKey}`);
  if (!rate.ok) {
    return JSON.stringify({
      ok: false,
      error: `Per daug užklausų. Palaukite ~${rate.retryAfterSec} s ir bandykite vėliau.`,
    });
  }

  const payload = {
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim(),
    message: parsed.data.message.trim(),
    company: parsed.data.company?.trim() || undefined,
    service: parsed.data.topic?.trim() || undefined,
  };

  const valid = contactPayloadSchema.safeParse(payload);
  if (!valid.success) {
    const err = valid.error.flatten().fieldErrors;
    const msg = (Object.values(err).flat()[0] as string | undefined) ?? "Validacijos klaida";
    return JSON.stringify({ ok: false, error: msg });
  }

  try {
    const lead = await createLeadAndNotify(valid.data, "chat_bot");
    return JSON.stringify({
      ok: true,
      leadId: lead.id,
      detail: "Užklausa įrašyta; susisieksime el. paštu.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Serverio klaida";
    return JSON.stringify({ ok: false, error: msg });
  }
}
