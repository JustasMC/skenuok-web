import { toolOpenGraphImage } from "@/lib/og-tool-image";

export const alt = "Kursų kokybės skaneris — FS·AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return toolOpenGraphImage({
    title: "Kursų skaneris",
    subtitle: "Lighthouse · SEO · AI verdiktas mokymų pasiūlos puslapiui",
    accent: "lime",
  });
}
