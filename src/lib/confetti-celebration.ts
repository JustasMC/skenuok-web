import confetti from "canvas-confetti";

/** ~25 min rankinio darbo vienam straipsniui (įrankio vertės istorija). */
export const MINUTES_SAVED_PER_ARTICLE = 25;

export function fireSuccessConfetti(origin: "generate" | "checkout" = "generate") {
  if (typeof window === "undefined") return;

  const colors =
    origin === "checkout"
      ? ["#c8ff00", "#00d4ff", "#ffffff"]
      : ["#00d4ff", "#c8ff00", "#0098b8", "#fafafa"];

  const count = origin === "checkout" ? 160 : 120;

  const fire = (particleRatio: number, opts: confetti.Options) => {
    void confetti({
      ...opts,
      origin: { y: origin === "checkout" ? 0.2 : 0.65 },
      colors,
      particleCount: Math.floor(count * particleRatio),
      spread: origin === "checkout" ? 100 : 70,
      ticks: 220,
      gravity: 0.9,
      scalar: origin === "checkout" ? 1.05 : 0.95,
    });
  };

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  fire(0.1, { spread: 120, startVelocity: 45, decay: 0.92, scalar: 1.1 });
  fire(0.1, { spread: 120, startVelocity: 35 });
}
