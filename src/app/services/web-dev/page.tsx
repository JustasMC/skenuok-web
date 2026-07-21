import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/svetainiu-kurimas");
  return {
    title: "IT ir svetainių kūrimas",
    description: "B2B svetainių ir e-commerce kūrimas — Next.js, SEO, konversijos.",
    alternates: { canonical },
    robots: { index: false, follow: true },
  };
}

/** Alias route → existing web-dev lead generator. */
export default function WebDevServicePage() {
  permanentRedirect("/svetainiu-kurimas");
}
