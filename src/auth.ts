import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { mergeGeneratorSessionIntoUser } from "@/lib/auth-merge";
import { prisma } from "@/lib/prisma";

/** Google OAuth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (Google Cloud → Credentials → OAuth 2.0 Client). */
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const emailConfigured = Boolean(
  process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM && process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD,
);

/** Tik `NODE_ENV=development` + AUTH_DEV_LOGIN=true — be Google/SMTP galima prisijungti lokaliai. */
const devLoginAllowed =
  process.env.NODE_ENV === "development" &&
  process.env.AUTH_DEV_LOGIN === "true" &&
  Boolean(process.env.DEV_LOGIN_EMAIL?.trim() && process.env.DEV_LOGIN_PASSWORD);

/**
 * Tik Credentials + database session — neleidžiama (Auth.js: UnsupportedStrategy).
 * JWT naudojamas, kai yra tik dev Credentials; DB sesijos — su Google arba Magic Link.
 * @see https://authjs.dev/reference/core/errors#unsupportedstrategy
 */
const useDatabaseSession = googleConfigured || emailConfigured;

const authSecret = env.AUTH_SECRET;
if (env.NODE_ENV === "production" && !authSecret) {
  console.error(
    "[auth] Production: nustatykite AUTH_SECRET (ilgas atsitiktinis stringas). Kitu atveju sesijos nėra saugios.",
  );
}

/**
 * Pavojingas el. pašto sujungimas tarp providerių (tas pats el. paštas = viena paskyra).
 * Gamyboje pagal nutylėjimą išjungta — įjunkite tik sąmoningai: AUTH_ALLOW_EMAIL_LINKING=true
 */
const allowEmailAccountLinking = process.env.AUTH_ALLOW_EMAIL_LINKING === "true";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: authSecret || process.env.NEXTAUTH_SECRET?.trim(),
  session: {
    strategy: useDatabaseSession ? "database" : "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(devLoginAllowed
      ? [
          Credentials({
            id: "credentials",
            name: "Vietinis vystymas",
            credentials: {
              email: { label: "El. paštas" },
              password: { label: "Slaptažodis", type: "password" },
            },
            async authorize(credentials) {
              const email = String(credentials?.email ?? "").trim().toLowerCase();
              const password = String(credentials?.password ?? "");
              const expectEmail = process.env.DEV_LOGIN_EMAIL?.trim().toLowerCase() ?? "";
              const expectPassword = process.env.DEV_LOGIN_PASSWORD ?? "";
              if (!email || !expectEmail || email !== expectEmail) return null;
              if (!password || password !== expectPassword) return null;

              const user = await prisma.user.upsert({
                where: { email: expectEmail },
                create: { email: expectEmail, name: "Vietinis dev" },
                update: {},
              });

              return { id: user.id, email: user.email ?? expectEmail, name: user.name };
            },
          }),
        ]
      : []),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: allowEmailAccountLinking,
          }),
        ]
      : []),
    ...(emailConfigured
      ? [
          Nodemailer({
            server: {
              host: process.env.EMAIL_SERVER_HOST,
              port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
              auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              },
            },
            from: process.env.EMAIL_FROM,
          }),
        ]
      : []),
  ],
  events: {
    async signIn({ user }) {
      const id = user.id;
      if (!id) return;

      const jar = await cookies();
      const sid = jar.get("gen_session")?.value;
      if (!sid) return;

      const merge = await mergeGeneratorSessionIntoUser(id, sid);
      if (!merge.merged) return;

      jar.set(
        "auth_merge_flash",
        JSON.stringify({ credits: merge.creditsTransferred }),
        { httpOnly: true, sameSite: "lax", path: "/", maxAge: 120, secure: process.env.NODE_ENV === "production" },
      );
      jar.delete("gen_session");
    },
  },
  trustHost: true,
});

/** Server komponentams (pvz. /login): ar rodyti vietinį prisijungimą. */
export const isDevLoginConfigured = devLoginAllowed;
