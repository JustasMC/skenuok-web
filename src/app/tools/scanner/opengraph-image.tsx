import { toolOpenGraphImage } from "@/lib/og-tool-image";

export const alt = "URL skaneris — FS·AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return toolOpenGraphImage({
    title: "URL skaneris",
    subtitle: "PageSpeed · Lighthouse · AI rekomendacijos lietuvių kalba",
    accent: "electric",
  });
}
