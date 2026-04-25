/** Stiliai „next/og“ (Satori) — turi būti plain objektai, ne Tailwind klasės. */

export function getOgToolImageStyles(accent: string) {
  return {
    root: {
      background: "linear-gradient(145deg, #050508 0%, #0c0e14 45%, #12151f 100%)",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
      padding: 56,
      fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif',
    },
    column: {
      display: "flex",
      flexDirection: "column" as const,
      gap: 16,
    },
    brand: {
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "0.35em",
      textTransform: "uppercase" as const,
      color: accent,
    },
    title: {
      fontSize: 58,
      fontWeight: 700,
      color: "#fafafa",
      lineHeight: 1.05,
      maxWidth: 1000,
    },
    subtitle: {
      fontSize: 28,
      color: "#a1a1aa",
      maxWidth: 920,
      lineHeight: 1.35,
    },
    footerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    footerNote: {
      fontSize: 22,
      color: "#52525b",
    },
    accentOrb: {
      width: 72,
      height: 72,
      borderRadius: 9999,
      border: `4px solid ${accent}`,
      opacity: 0.4,
    },
  };
}
