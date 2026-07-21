import type { MetadataRoute } from "next";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";

/** Runtime env — ne localhost, jei NEXT_PUBLIC_SITE_URL nustatytas tik deploy metu. */
export const dynamic = "force-dynamic";

/**
 * Dinaminis žemėlapis — Next.js automatiškai patiekia kaip `/sitemap.xml`.
 * URL absoliutūs (pagal NEXT_PUBLIC_SITE_URL / RAILWAY_PUBLIC_DOMAIN).
 */
const entries: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/svetainiu-kurimas", changeFrequency: "weekly", priority: 0.92 },
  { path: "/scan/web", changeFrequency: "weekly", priority: 0.9 },
  { path: "/scan/crypto", changeFrequency: "weekly", priority: 0.85 },
  { path: "/scan/auto", changeFrequency: "weekly", priority: 0.85 },
  { path: "/scan/beauty", changeFrequency: "weekly", priority: 0.85 },
  { path: "/scan/home", changeFrequency: "weekly", priority: 0.85 },
  { path: "/scan/tech", changeFrequency: "weekly", priority: 0.85 },
  { path: "/scan/signals", changeFrequency: "hourly", priority: 0.86 },
  { path: "/scan/etf", changeFrequency: "daily", priority: 0.86 },
  { path: "/scan/metals", changeFrequency: "daily", priority: 0.85 },
  { path: "/scan/fx", changeFrequency: "daily", priority: 0.85 },
  { path: "/reklama", changeFrequency: "monthly", priority: 0.55 },
  { path: "/services/trading-bots", changeFrequency: "weekly", priority: 0.88 },
  { path: "/services/web-dev", changeFrequency: "weekly", priority: 0.88 },
  { path: "/tools/course-scanner", changeFrequency: "weekly", priority: 0.85 },
  { path: "/irankiai/seo-generatorius", changeFrequency: "weekly", priority: 0.85 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/blog/svetainiu-kurimas-ir-seo-auditas-planas-2026", changeFrequency: "monthly", priority: 0.65 },
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
