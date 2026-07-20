import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPageLoading } from "@/components/dashboard/DashboardLoading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const DashboardWorkspace = dynamic(
  () => import("@/components/dashboard/DashboardWorkspace").then((m) => m.DashboardWorkspace),
  {
    loading: () => <DashboardPageLoading />,
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const t = dict.dashboard.meta;
  const canonical = getCanonicalPath("/dashboard");
  const title = t.title;
  const description = t.description;

  return {
    title,
    description,
    keywords: [...t.keywords],
    alternates: { canonical },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell-wide py-12 sm:py-16">
        <DashboardWorkspace
          userName={session.user.name ?? null}
          userEmail={session.user.email ?? null}
        />
      </main>
      <SiteFooter />
    </>
  );
}
