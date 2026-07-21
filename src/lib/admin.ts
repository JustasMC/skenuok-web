import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Comma-separated admin emails in ADMIN_EMAILS env. */
export function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS?.trim() ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const admins = parseAdminEmails();
  if (!email || !admins.has(email)) {
    return null;
  }
  return session;
}

export async function listLeadsForAdmin(limit = 100) {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      service: true,
      type: true,
      status: true,
      estimatedValue: true,
      details: true,
      message: true,
      createdAt: true,
    },
  });
}
