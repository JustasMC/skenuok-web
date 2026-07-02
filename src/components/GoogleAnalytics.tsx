"use client";

import Script from "next/script";

type Props = { gaId: string };

/** Kraunamas tik po analitikos sutikimo (CookieConsent). */
export function GoogleAnalytics({ gaId }: Props) {
  return (
    <>
      <Script id="ga-script" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
      <Script id="ga-inline" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
