import { ImageResponse } from "next/og";
import { getOgToolImageStyles } from "@/lib/og-tool-image-styles";

const ACCENTS = {
  electric: "#00d4ff",
  lime: "#c8ff00",
} as const;

type Accent = keyof typeof ACCENTS;

/**
 * Open Graph paveikslėlis per „next/og“ (Satori).
 * Stiliai laikomi atskirame faile — Edge Tools „no-inline-styles“ įspėja apie `style={{}}` JSX literalus;
 * čia naudojami objektai iš modulio (ta pati Satori kontrakto praktika).
 */
export function toolOpenGraphImage(input: { title: string; subtitle: string; accent: Accent }) {
  const accent = ACCENTS[input.accent];
  const s = getOgToolImageStyles(accent);

  return new ImageResponse(
    (
      <div style={s.root}>
        <div style={s.column}>
          <span style={s.brand}>FS·AI</span>
          <span style={s.title}>{input.title}</span>
          <span style={s.subtitle}>{input.subtitle}</span>
        </div>
        <div style={s.footerRow}>
          <span style={s.footerNote}>Įrankiai · dalinimasis socialiniuose tinkluose</span>
          <div style={s.accentOrb} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
