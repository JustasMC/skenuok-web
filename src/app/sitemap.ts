import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-url";

const siteUrl = getSiteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tools/scanner`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tools/course-scanner`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/irankiai/seo-generatorius`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.35 },
  ];
}
