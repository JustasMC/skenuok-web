import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Mokėjimas patvirtintas",
  description: "Mokėjimas patvirtintas. Kreditai netrukus bus atnaujinti jūsų paskyroje.",
  alternates: { canonical: getCanonicalPath("/success") },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: getCanonicalPath("/success"),
    siteName: siteConfig.name,
    title: "Mokėjimas patvirtintas | Skenuok.com",
    description: "Mokėjimas gautas. Galite tęsti darbą su SEO generatoriumi.",
  },
};

export default function SuccessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
