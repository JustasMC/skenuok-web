import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { MINUTES_SAVED_PER_ARTICLE } from "@/lib/confetti-celebration";
import { prisma } from "@/lib/prisma";
import { getCanonicalPath } from "@/lib/site-url";
import { ClaimSessionCredits } from "@/components/dashboard/ClaimSessionCredits";
import { CreditLedgerTable } from "@/components/dashboard/CreditLedgerTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const AgentChatPanel = dynamic(
  () => import("@/components/dashboard/AgentChatPanel").then((m) => m.AgentChatPanel),
  {
    loading: () => (
      <div
        className="min-h-[280px] animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-8 text-sm text-zinc-500"
        role="status"
        aria-live="polite"
      >
        Kraunama…
      </div>
    ),
  },
);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Darbo vieta",
    description:
      "Jūsų kreditai, SEO straipsnių istorija, sutaupytas laikas ir AI agentas — prisijungusių vartotojų skydelis. Turinys rodomas tik prisijungus.",
    alternates: { canonical: getCanonicalPath("/dashboard") },
    robots: { index: false, follow: true },
  };
}

function formatMinutes(totalMin: number): string {
  if (totalMin < 60) return `${Math.round(totalMin)} min`;
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  return m > 0 ? `${h} val. ${m} min` : `${h} val.`;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="site-shell py-16 sm:py-20">
          <h1 className="text-3xl font-semibold text-white">Darbo vieta</h1>
          <p className="mt-2 max-w-xl text-zinc-400">Prisijunkite, kad matytumėte kreditus ir istoriją visuose įrenginiuose.</p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-lg bg-[var(--color-electric)] px-5 py-2.5 text-sm font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)]"
          >
            Prisijungti
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  type UserRow = { credits: number; email: string | null; name: string | null };
  type ContentRow = { id: string; topic: string; seoScore: number | null; createdAt: Date };
  type SeoTaskRow = { id: string; title: string; priority: string | null; notes: string | null; createdAt: Date };

  let user: UserRow | null = null;
  let contents: ContentRow[] = [];
  let seoTasks: SeoTaskRow[] = [];
  let dbError: string | null = null;

  try {
    const [userRow, contentRows, taskRows] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true, email: true, name: true },
      }),
      prisma.generatedContent.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, topic: true, seoScore: true, createdAt: true },
      }),
      prisma.seoTask.findMany({
        where: { userId: session.user.id, done: false },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: { id: true, title: true, priority: true, notes: true, createdAt: true },
      }),
    ]);
    user = userRow;
    contents = contentRows;
    seoTasks = taskRows;
  } catch (e) {
    console.error("[dashboard] prisma", e);
    dbError =
      "Nepavyko nuskaityti duomenų bazės. Patikrinkite, ar pasiekiamas PostgreSQL (DATABASE_URL) ir ar paleistos migracijos (pvz. npx prisma migrate deploy). Tada perkraukite puslapį.";
  }

  if (dbError) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="text-2xl font-semibold text-white">Darbo vieta</h1>
          <p className="mt-4 text-zinc-300">{dbError}</p>
          <p className="mt-3 text-sm text-zinc-500">
            Įsitikinkite, kad faile <code className="text-zinc-400">.env</code> teisingai nurodytas{" "}
            <code className="text-zinc-400">DATABASE_URL</code> ir kad duomenų bazė veikia.
          </p>
          <Link
            href="/irankiai/seo-generatorius"
            className="mt-8 inline-flex text-sm font-medium text-[var(--color-electric)] hover:underline"
          >
            ← Atgal į generatorių
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="text-2xl font-semibold text-white">Darbo vieta</h1>
          <p className="mt-4 text-zinc-300">Paskyra duomenų bazėje nerasta. Bandykite atsijungti ir prisijungti iš naujo.</p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-lg bg-[var(--color-electric)] px-5 py-2.5 text-sm font-semibold text-[#041014]"
          >
            Prisijungti
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const n = contents.length;
  const scored = contents.filter((c) => c.seoScore != null);
  const avg =
    scored.length > 0
      ? Math.round(scored.reduce((a, c) => a + (c.seoScore ?? 0), 0) / scored.length)
      : null;
  const timeSavedMin = n * MINUTES_SAVED_PER_ARTICLE;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell py-16 sm:py-20">
        <header className="mb-10 space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--color-electric)]">FS·AI</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Darbo vieta</h1>
          <p className="text-zinc-400">
            {user?.name ?? user?.email ?? "Paskyra"} · pilna SEO generatoriaus santrauka
          </p>
        </header>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader className="pb-2">
              <CardDescription>Likę kreditai</CardDescription>
              <CardTitle className="font-mono text-3xl text-[var(--color-lime)]">{user?.credits ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader className="pb-2">
              <CardDescription>Vidutinis SEO balas</CardDescription>
              <CardTitle className="font-mono text-3xl text-[var(--color-electric)]">{avg != null ? avg : "—"}</CardTitle>
              <p className="text-xs text-zinc-600">{n > 0 ? `iš ${n} straipsnių` : "Dar nėra įrašų"}</p>
            </CardHeader>
          </Card>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader className="pb-2">
              <CardDescription>Įvert. sutaupytas laikas</CardDescription>
              <CardTitle className="text-3xl text-zinc-100">{n > 0 ? formatMinutes(timeSavedMin) : "—"}</CardTitle>
              <p className="text-xs text-zinc-600">~{MINUTES_SAVED_PER_ARTICLE} min / straipsnis</p>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle>Kreditų likučiai iš anoniminės sesijos</CardTitle>
              <CardDescription>Įveskite sesijos ID, jei pirkote be prisijungimo kitame įrenginyje.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p className="text-sm text-zinc-500">Kraunama…</p>}>
                <ClaimSessionCredits />
              </Suspense>
            </CardContent>
          </Card>
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle>Kreditų žurnalas</CardTitle>
              <CardDescription>Papildymai ir nurašymai pagal laiką.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreditLedgerTable />
            </CardContent>
          </Card>
        </div>

        <div className="mb-10">
          <AgentChatPanel />
        </div>

        {seoTasks.length > 0 && (
          <Card className="mb-10 border-[var(--color-border)] bg-[var(--color-surface)]">
            <CardHeader>
              <CardTitle>SEO užduotys</CardTitle>
              <CardDescription>Užduotys, kurias agentas įrašė iš pokalbio (darbo vieta).</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-[var(--color-border)] text-sm">
                {seoTasks.map((t) => (
                  <li key={t.id} className="flex flex-col gap-1 py-3 first:pt-0">
                    <span className="font-medium text-zinc-200">{t.title}</span>
                    <span className="text-xs text-zinc-500">
                      {[t.priority && `Prioritetas: ${t.priority}`, new Date(t.createdAt).toLocaleString("lt-LT")]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {t.notes ? <p className="text-zinc-400">{t.notes}</p> : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Straipsnių istorija</CardTitle>
            <CardDescription>Paskutiniai {Math.min(n, 50)} įrašai šioje paskyroje.</CardDescription>
          </CardHeader>
          <CardContent>
            {contents.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Dar nieko negeneravote.{" "}
                <Link href="/irankiai/seo-generatorius" className="text-[var(--color-electric)] hover:underline">
                  Atidaryti generatorių →
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)] text-sm">
                {contents.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                    <span className="font-medium text-zinc-200">{h.topic}</span>
                    <span className="font-mono text-xs text-zinc-500">
                      SEO {h.seoScore ?? "—"} · {new Date(h.createdAt).toLocaleString("lt-LT")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-zinc-600">
          <Link href="/irankiai/seo-generatorius" className="text-[var(--color-electric)] hover:underline">
            ← Atgal į generatorių
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
