import { toolOpenGraphImage } from "@/lib/og-tool-image";
import { siteConfig } from "@/lib/site-config";

export const alt = siteConfig.defaultTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return toolOpenGraphImage({
    title: siteConfig.name,
    subtitle: "Next.js · SEO · AI agentai · duomenų analitika · aukšto našumo integracijos",
    accent: "electric",
  });
}
