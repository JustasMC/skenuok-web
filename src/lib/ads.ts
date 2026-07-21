import { prisma } from "@/lib/prisma";

export type ActiveAd = {
  id: string;
  location: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  href: string;
  sponsorName: string | null;
};

export async function getActiveAds(location: string): Promise<ActiveAd[]> {
  const now = new Date();
  try {
    const rows = await prisma.adBanner.findMany({
      where: {
        active: true,
        endsAt: { gt: now },
        startsAt: { lte: now },
        OR: [{ location }, { location: "global" }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 4,
      select: {
        id: true,
        location: true,
        title: true,
        description: true,
        imageUrl: true,
        href: true,
        sponsorName: true,
      },
    });
    return rows;
  } catch {
    return [];
  }
}
