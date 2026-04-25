import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "FS·AI",
    description: siteConfig.defaultDescription,
    start_url: "/",
    display: "browser",
    orientation: "portrait-primary",
    background_color: "#050508",
    theme_color: "#050508",
    lang: "lt",
    categories: ["business", "productivity", "developer tools"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
