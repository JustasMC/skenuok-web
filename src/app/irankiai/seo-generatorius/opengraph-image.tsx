import { toolOpenGraphImage } from "@/lib/og-tool-image";

export const alt = "SEO turinio generatorius — FS·AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return toolOpenGraphImage({
    title: "SEO turinio generatorius",
    subtitle: "Straipsnis pagal raktažodį · SEO balas · istorija",
    accent: "lime",
  });
}
