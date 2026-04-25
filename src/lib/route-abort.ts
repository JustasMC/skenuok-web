/**
 * Kliento nutraukimas (uždarytas skirtukas / Stop) + viršutinė trukmės riba.
 * Nenaudoti viduje createLeadAndNotify – lead'ą geriau užbaigti, o signalą tikrinti prieš/po įrankio.
 */
export function getCombinedRouteAbortSignal(req: Request, maxDurationMs?: number): AbortSignal {
  const raw = maxDurationMs ?? Number(process.env.ROUTE_HANDLER_MAX_MS);
  const ms = Number.isFinite(raw) && raw > 0 ? raw : 120_000;
  return AbortSignal.any([req.signal, AbortSignal.timeout(ms)]);
}

export function isAbortError(e: unknown): boolean {
  return (
    (e instanceof DOMException && e.name === "AbortError") ||
    (e instanceof Error && (e.name === "AbortError" || e.message === "This operation was aborted"))
  );
}
