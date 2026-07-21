import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale } from "@/lib/i18n/config";
import { localeFromAcceptLanguage } from "@/lib/i18n/detect";

const DEV_ONLY_PATHS = ["/api/test-send", "/api/debug-fb"] as const;

function hasSessionCookie(req: NextRequest): boolean {
  const names = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ] as const;
  return names.some((name) => Boolean(req.cookies.get(name)?.value));
}

function withLocaleCookie(req: NextRequest, res: NextResponse): NextResponse {
  const existing = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) return res;

  const locale = localeFromAcceptLanguage(req.headers.get("accept-language"));
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.NODE_ENV === "production" && DEV_ONLY_PATHS.some((p) => pathname === p)) {
    return withLocaleCookie(req, NextResponse.json({ error: "Nerasta" }, { status: 404 }));
  }

  if (pathname.startsWith("/dashboard") && !hasSessionCookie(req)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return withLocaleCookie(req, NextResponse.redirect(login));
  }

  if (pathname.startsWith("/admin") && !hasSessionCookie(req)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return withLocaleCookie(req, NextResponse.redirect(login));
  }

  return withLocaleCookie(req, NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals.
     * Keep locale cookie on pages + key API that render UI indirectly.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
