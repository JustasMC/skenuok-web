-- B2B ad placements
CREATE TABLE IF NOT EXISTS "AdBanner" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "href" TEXT NOT NULL,
    "sponsorName" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdBanner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdBanner_location_active_endsAt_idx" ON "AdBanner"("location", "active", "endsAt");
