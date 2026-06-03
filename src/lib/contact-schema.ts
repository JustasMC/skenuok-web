import { z } from "zod";

/** Server-side validation for POST /api/contact. */
export const contactPayloadSchema = z.object({
  name: z.string().min(1, "Įveskite vardą").max(120, "Vardas per ilgas"),
  email: z.string().email("Neteisingas el. pašto formatas").max(254, "El. paštas per ilgas"),
  company: z.string().max(200, "Įmonės pavadinimas per ilgas").optional(),
  service: z.string().max(200).optional(),
  message: z.string().min(1, "Įveskite žinutę").max(8000, "Žinutė per ilga"),
});

export type ContactPayload = z.infer<typeof contactPayloadSchema>;
