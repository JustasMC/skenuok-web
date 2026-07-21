/** Credits charged per niche AI scan (beauty, auto, home, tech, crypto). */
export function getNicheScanCredits(): number {
  const n = Number(process.env.NICHE_SCAN_CREDITS);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
}
