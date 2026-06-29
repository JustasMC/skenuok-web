import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.NODE_ENV === "production" && DEV_ONLY_PATHS.some((p) => pathname === p)) {
    return NextResponse.json({ error: "Nerasta" }, { status: 404 });
  }

  if (pathname.startsWith("/dashboard") && !hasSessionCookie(req)) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/test-send", "/api/debug-fb"],
};
