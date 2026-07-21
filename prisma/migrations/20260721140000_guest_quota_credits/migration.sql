-- GeneratorSession: new guests start at 0 free credits (granted via GuestQuota).
ALTER TABLE "GeneratorSession" ALTER COLUMN "credits" SET DEFAULT 0;

-- GuestQuota: IP + fingerprint daily free-credit grants
CREATE TABLE IF NOT EXISTS "GuestQuota" (
    "id" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "freeCreditsGranted" INTEGER NOT NULL DEFAULT 0,
    "scansUsed" INTEGER NOT NULL DEFAULT 0,
    "lastSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuestQuota_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GuestQuota_identityKey_dayKey_key" ON "GuestQuota"("identityKey", "dayKey");
CREATE INDEX IF NOT EXISTS "GuestQuota_identityKey_dayKey_idx" ON "GuestQuota"("identityKey", "dayKey");
