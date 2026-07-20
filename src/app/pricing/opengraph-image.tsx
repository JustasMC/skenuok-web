import { toolOpenGraphImage } from "@/lib/og-tool-image";

export const alt = "Kainodara — Skenuok.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return toolOpenGraphImage({
    title: "Kainodara",
    subtitle: "0 € skaneris · 3 dovanų kreditai · 15 / 80 kreditų planai",
    accent: "lime",
  });
}
