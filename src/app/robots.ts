import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-url";

/** Runtime env — ne localhost, jei NEXT_PUBLIC_SITE_URL nustatytas tik deploy metu. */
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteOrigin();
  const host = siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/login", "/success", "/test-email", "/investavimas"],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
