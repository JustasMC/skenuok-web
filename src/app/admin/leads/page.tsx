import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminLeadsTable } from "@/components/admin/AdminLeadsTable";
import { listLeadsForAdmin, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Admin · Leads",
    robots: { index: false, follow: false },
  };
}

export default async function AdminLeadsPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/login?callbackUrl=/admin/leads");
  }

  const leads = await listLeadsForAdmin();
  const serialized = leads.map((l) => ({
    ...l,
    estimatedValue: l.estimatedValue != null ? Number(l.estimatedValue) : null,
    createdAt: l.createdAt.toISOString(),
    details: l.details,
  }));

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <h1 className="text-2xl font-semibold text-white">Leadų valdymas</h1>
          <p className="mt-2 text-sm text-zinc-400">
            B2B užklausos (trading botai, web-dev, kontaktai). Statusų keitimas išsaugomas DB.
          </p>
          <div className="mt-8">
            <AdminLeadsTable initial={serialized} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
