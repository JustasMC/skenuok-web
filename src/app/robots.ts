import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-url";

const siteUrl = getSiteOrigin();

export default function robots(): MetadataRoute.Robots {
  const host = siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/login"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
