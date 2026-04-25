import { toolOpenGraphImage } from "@/lib/og-tool-image";

export const alt = "Kainodara — FS·AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return toolOpenGraphImage({
    title: "Kainodara",
    subtitle: "Nemokamas · profesionalus · verslo planai — SEO įrankiai ir turinio generatorius",
    accent: "lime",
  });
}
