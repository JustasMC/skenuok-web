/**
 * Riboja istoriją, kad agento užklausa neperžengtų tokenų biudžeto.
 */
export function trimMessagesForAgent(
  rows: { role: string; content: string }[],
  opts?: { maxMessages?: number; maxChars?: number },
): { role: "user" | "assistant"; content: string }[] {
  const maxMessages = opts?.maxMessages ?? 36;
  const maxChars = opts?.maxChars ?? 24000;

  const filtered = rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content }));

  const slice = filtered.slice(-maxMessages);
  let total = 0;
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (let i = slice.length - 1; i >= 0; i--) {
    const m = slice[i]!;
    const add = m.content.length;
    if (total + add > maxChars) break;
    total += add;
    out.unshift(m);
  }
  return out;
}
