import type { MetadataRoute } from "next";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";

/**
 * Dinaminis žemėlapis — Next.js automatiškai patiekia kaip `/sitemap.xml`.
 * URL absoliutūs (pagal NEXT_PUBLIC_SITE_URL / RAILWAY_PUBLIC_DOMAIN build metu).
 */
const entries: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/tools/scanner", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tools/course-scanner", changeFrequency: "weekly", priority: 0.85 },
  { path: "/irankiai/seo-generatorius", changeFrequency: "weekly", priority: 0.85 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.75 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.35 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.35 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const origin = getSiteOrigin().replace(/\/+$/, "");

  return entries.map((e) => ({
    url: e.path === "/" ? origin : getCanonicalPath(e.path),
    lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
