"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

type Props = {
  googleConfigured: boolean;
  emailConfigured: boolean;
  devLoginConfigured: boolean;
  devLoginEmailHint: string;
  /** Google OAuth redirect URI (rodymas instrukcijose) */
  oauthCallbackUrl: string;
};

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm({
  googleConfigured,
  emailConfigured,
  devLoginConfigured,
  devLoginEmailHint,
  oauthCallbackUrl,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [devEmail, setDevEmail] = useState(devLoginEmailHint);
  const [devPassword, setDevPassword] = useState("");
  const [devErr, setDevErr] = useState<string | null>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onGoogle() {
    setMessage("");
    await signIn("google", { callbackUrl: "/irankiai/seo-generatorius" });
  }

  async function onDevLogin(e: React.FormEvent) {
    e.preventDefault();
    setDevErr(null);
    setDevLoading(true);
    try {
      const res = await signIn("credentials", {
        email: devEmail.trim(),
        password: devPassword,
        redirect: false,
      });
      if (res?.error) {
        setDevErr("Neteisingas el. paštas arba slaptažodis.");
        return;
      }
      router.push("/irankiai/seo-generatorius");
      router.refresh();
    } finally {
      setDevLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const res = await signIn("nodemailer", {
      email: email.trim(),
      callbackUrl: "/irankiai/seo-generatorius",
      redirect: false,
    });
    if (res?.error) {
      setStatus("err");
      setMessage("Nepavyko išsiųsti nuorodos. Patikrinkite SMTP nustatymus.");
      return;
    }
    setStatus("sent");
    setMessage("Nuoroda išsiųsta — patikrinkite pašto dėžutę (ir spamą).");
  }

  const hasAnyLogin = googleConfigured || emailConfigured || devLoginConfigured;

  return (
    <div className="mt-8 space-y-6">
      {googleConfigured && emailConfigured ? (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_22%,var(--color-border))] bg-[color-mix(in_oklab,black_28%,#0a1020)] p-6 shadow-[inset_0_1px_0_0_rgba(34,211,238,0.12),0_0_40px_-16px_rgba(34,211,238,0.25)] sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-electric)]">Prisijungimas</p>
          <button
            type="button"
            onClick={() => void onGoogle()}
            className="group mt-5 flex w-full min-h-11 items-center justify-center gap-3 rounded-xl border border-[color-mix(in_oklab,var(--color-electric)_45%,transparent)] bg-[color-mix(in_oklab,black_50%,transparent)] px-4 py-3.5 text-sm font-semibold text-zinc-100 shadow-[0_0_28px_-10px_rgba(34,211,238,0.4)] motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-200 hover:border-[var(--color-electric)] hover:bg-[color-mix(in_oklab,var(--color-electric)_14%,black)] hover:text-white hover:shadow-[0_0_36px_-8px_rgba(34,211,238,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]"
          >
            <GoogleIcon />
            Prisijungti su Google
          </button>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Google paskyra. Jei turėjote anoniminę generatoriaus sesiją, kreditai bus perkelti po sėkmingo prisijungimo.
          </p>

          <div className="relative my-8 flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[color-mix(in_oklab,var(--color-border)_90%,transparent)]" />
            <span className="relative bg-[color-mix(in_oklab,black_28%,#0a1020)] px-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              arba el. paštu (Magic Link)
            </span>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm font-medium text-zinc-300">
                El. paštas
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="site-input"
                placeholder="jusu@pastas.lt"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "sent"}
              className="site-btn-primary w-full min-h-11 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
            >
              {status === "loading" ? "Siunčiama…" : status === "sent" ? "Nuoroda išsiųsta" : "Gauti prisijungimo nuorodą"}
            </button>
            {message ? <p className={`text-sm ${status === "err" ? "text-rose-400" : "text-[var(--color-lime)]"}`}>{message}</p> : null}
          </form>
        </div>
      ) : null}

      {googleConfigured && !emailConfigured ? (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_22%,var(--color-border))] bg-[color-mix(in_oklab,black_28%,#0a1020)] p-6 shadow-[inset_0_1px_0_0_rgba(34,211,238,0.12),0_0_40px_-16px_rgba(34,211,238,0.25)] sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-electric)]">Prisijungimas</p>
          <button
            type="button"
            onClick={() => void onGoogle()}
            className="group mt-5 flex w-full min-h-11 items-center justify-center gap-3 rounded-xl border border-[color-mix(in_oklab,var(--color-electric)_45%,transparent)] bg-[color-mix(in_oklab,black_50%,transparent)] px-4 py-3.5 text-sm font-semibold text-zinc-100 shadow-[0_0_28px_-10px_rgba(34,211,238,0.4)] motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-200 hover:border-[var(--color-electric)] hover:bg-[color-mix(in_oklab,var(--color-electric)_14%,black)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]"
          >
            <GoogleIcon />
            Prisijungti su Google
          </button>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Prisijungsite su Google paskyra. Jei turėjote anoniminę generatoriaus sesiją, kreditai bus perkelti po sėkmingo prisijungimo.
          </p>
        </div>
      ) : null}

      {devLoginConfigured && !googleConfigured ? (
        <div className="rounded-xl border border-[color-mix(in_oklab,var(--color-electric)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_6%,transparent)] px-4 py-3 text-sm leading-relaxed text-zinc-300">
          <p className="font-medium text-zinc-200">Google prisijungimas</p>
          <p className="mt-1 text-xs text-zinc-500">
            Kad čia atsirastų mygtukas „Prisijungti su Google“, į <code className="text-zinc-400">.env</code> įrašykite{" "}
            <code className="text-[var(--color-electric)]">AUTH_GOOGLE_ID</code> ir{" "}
            <code className="text-[var(--color-electric)]">AUTH_GOOGLE_SECRET</code> (Google Cloud Console → APIs &amp; Services →
            Credentials → OAuth 2.0 Client ID). Redirect URI:{" "}
            <code className="break-all text-zinc-400">{oauthCallbackUrl}</code>
            . Po pakeitimų perkraukite dev serverį.
          </p>
        </div>
      ) : null}

      {devLoginConfigured ? (
        <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-6 sm:p-8">
          <p className="text-sm font-medium text-emerald-100">Vietinis vystymas (tik dev)</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-200/80">
            Tik <code className="text-emerald-100">npm run dev</code>. El. paštas ir slaptažodis turi sutapti su{" "}
            <code className="text-emerald-100">DEV_LOGIN_EMAIL</code> ir <code className="text-emerald-100">DEV_LOGIN_PASSWORD</code> faile{" "}
            <code className="text-emerald-100">.env</code>. Production: <code className="text-emerald-100">AUTH_DEV_LOGIN=false</code>.
          </p>
          <form onSubmit={onDevLogin} className="mt-4 space-y-3">
            <div>
              <label htmlFor="dev-email" className="text-sm font-medium text-zinc-300">
                El. paštas
              </label>
              <input
                id="dev-email"
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                required
                autoComplete="username"
                className="site-input"
              />
            </div>
            <div>
              <label htmlFor="dev-password" className="text-sm font-medium text-zinc-300">
                Slaptažodis
              </label>
              <input
                id="dev-password"
                type="password"
                required
                autoComplete="current-password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="reikšmė iš .env → DEV_LOGIN_PASSWORD"
                className="site-input"
              />
              <p className="mt-1.5 text-xs text-emerald-200/70">
                Laukas sąmoningai tuščias: nukopijuokite slaptažodį iš savo <code className="text-emerald-100/90">.env</code> (neįkelkite jo į
                git).
              </p>
            </div>
            {devErr ? <p className="text-sm text-rose-400">{devErr}</p> : null}
            <button
              type="submit"
              disabled={devLoading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {devLoading ? "Jungiamasi…" : "Prisijungti (dev)"}
            </button>
          </form>
        </div>
      ) : null}

      {!googleConfigured && !devLoginConfigured ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Google prisijungimas dar nesukonfigūruotas. Pridėkite į <code className="text-amber-200">.env</code> kintamuosius{" "}
          <code className="text-amber-200">AUTH_GOOGLE_ID</code> ir <code className="text-amber-200">AUTH_GOOGLE_SECRET</code>{" "}
          (Google Cloud → OAuth 2.0 Client).
        </div>
      ) : null}

      {!googleConfigured && emailConfigured ? (
        <form
          onSubmit={onSubmit}
          className="site-card space-y-4 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="login-email-solo" className="text-sm font-medium text-zinc-300">
              El. paštas (Magic Link)
            </label>
            <input
              id="login-email-solo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-electric)]"
              placeholder="jusu@pastas.lt"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || status === "sent"}
            className="site-btn-primary w-full min-h-11 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
          >
            {status === "loading" ? "Siunčiama…" : status === "sent" ? "Nuoroda išsiųsta" : "Gauti prisijungimo nuorodą"}
          </button>
          {message ? <p className={`text-sm ${status === "err" ? "text-rose-400" : "text-[var(--color-lime)]"}`}>{message}</p> : null}
        </form>
      ) : null}

      {!hasAnyLogin ? (
        <p className="text-center text-sm text-rose-400">
          Nėra sukonfigūruoto prisijungimo būdo. Lokaliai įjunkite <code className="text-rose-300">AUTH_DEV_LOGIN</code> arba
          nustatykite Google OAuth / SMTP faile <code className="text-rose-300">.env</code>.
        </p>
      ) : null}

      <p className="text-center text-sm text-zinc-500">
        <Link href="/irankiai/seo-generatorius" className="site-link-inline">
          ← Atgal į generatorių
        </Link>
      </p>
    </div>
  );
}
