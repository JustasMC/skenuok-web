import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

/**
 * Maps thrown errors to a safe Lithuanian message for API JSON responses.
 * Never forwards raw stack traces or vendor internals to clients in production.
 */
export function publicApiErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "Šis įrašas jau egzistuoja. Atnaujinkite puslapį arba naudokite kitus duomenis.";
      case "P2025":
        return "Įrašas nerastas arba jau buvo pašalintas.";
      case "P2003":
        return "Operacija negalima dėl susietų duomenų.";
      case "P2014":
        return "Negalima atlikti pakeitimo dėl susijusių įrašų.";
      default:
        break;
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Duomenų bazė laikinai nepasiekiama. Bandykite už kelių minučių.";
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return "Duomenų bazės užklausa nepavyko. Bandykite vėliau.";
  }

  if (error instanceof Error) {
    const m = error.message;
    const lower = m.toLowerCase();

    if (lower.includes("openai") || lower.includes("api key") || lower.includes("incorrect api key")) {
      return "AI paslauga laikinai nepasiekiama. Bandykite vėliau.";
    }
    if (lower.includes("fetch failed") || lower.includes("econnrefused") || lower.includes("enotfound")) {
      return "Išorinė paslauga nepasiekiama. Patikrinkite tinklą ir bandykite vėliau.";
    }
    if (lower.includes("stripe") && lower.includes("key")) {
      return "Mokėjimų sistema nesukonfigūruota.";
    }

    if (!isProd) {
      return m.length > 280 ? `${m.slice(0, 280)}…` : m;
    }
  }

  return "Įvyko serverio klaida. Bandykite vėliau. Jei problema kartojasi, susisiekite per kontaktų formą.";
}

export function logApiError(route: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[api:${route}]`, err.message, err.stack ?? "");
}

export function jsonApiError(route: string, error: unknown, status = 500): NextResponse {
  logApiError(route, error);
  return NextResponse.json({ error: publicApiErrorMessage(error) }, { status });
}
