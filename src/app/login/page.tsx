import type { Metadata } from "next";
import { isDevLoginConfigured } from "@/auth";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/login");
  const title = "Prisijungimas";
  const description =
    "Prisijunkite su Google arba Magic Link — pasiekite SEO turinio generatorių, kreditus ir darbo vietą. Saugi sesija, be atskiro slaptažodžio šioje svetainėje.";

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
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

export default function LoginPage() {
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const emailConfigured = Boolean(
    process.env.EMAIL_SERVER_HOST &&
      process.env.EMAIL_FROM &&
      process.env.EMAIL_SERVER_USER &&
      process.env.EMAIL_SERVER_PASSWORD,
  );
  const devLoginEmailHint = process.env.DEV_LOGIN_EMAIL?.trim() ?? "";
  const siteBase = getSiteOrigin();
  const oauthCallbackUrl = `${siteBase}/api/auth/callback/google`;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell-wide py-16 sm:py-24">
        <div className="mx-auto w-full max-w-lg">
          <PageIntro variant="page" kicker="Paskyra" title="Prisijungimas">
            <p>
              Naudokite Google paskyrą arba Magic Link el. paštu — be atskiro slaptažodžio šioje svetainėje.
            </p>
          </PageIntro>

          <LoginForm
            googleConfigured={googleConfigured}
            emailConfigured={emailConfigured}
            devLoginConfigured={isDevLoginConfigured}
            devLoginEmailHint={devLoginEmailHint}
            oauthCallbackUrl={oauthCallbackUrl}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
