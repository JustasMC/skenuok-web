import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_OG_IMAGE_PATH, getCanonicalPath } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const canonical = getCanonicalPath("/blog");
  const title = dict.blog.title;
  const description = dict.blog.description;

  return {
    title,
    description,
    keywords: ["blog", "web development", "SEO audit", "AI automation", "growth strategy"],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE_PATH, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

export default async function BlogPage() {
  const { dict } = await getRequestDictionary();
  const t = dict.blog;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <PageIntro variant="page" kicker={t.kicker} title={t.title}>
            <p>
              {t.introBefore} <strong className="text-zinc-300">{t.webBuild}</strong>,{" "}
              <strong className="text-zinc-300">{t.seoAudit}</strong> {t.and}{" "}
              <strong className="text-zinc-300">{t.aiAuto}</strong> {t.introAfter}
            </p>
          </PageIntro>

          <section className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <article className="site-card-interactive p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">2026</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{t.articleTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{t.articleBody}</p>
              <Link href="/blog/svetainiu-kurimas-ir-seo-auditas-planas-2026" className="site-link-inline mt-6 inline-flex">
                {t.readMore}
              </Link>
            </article>

            <aside className="site-card flex flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.nextStep}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">{t.asideTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t.asideBody}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/scan/web" className="site-btn-primary min-h-10 px-4 text-sm">
                  {t.scanner}
                </Link>
                <Link href="/#kontaktai" className="site-btn-secondary min-h-10 px-4 text-sm">
                  {t.contact}
                </Link>
              </div>
            </aside>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
