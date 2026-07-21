-- AlterTable Lead: B2B lead fields
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'contact';
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "details" JSONB;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "estimatedValue" DECIMAL(12,2);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "Lead_type_status_createdAt_idx" ON "Lead"("type", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "Lead_userId_idx" ON "Lead"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Lead_userId_fkey'
  ) THEN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable AffiliateClick
CREATE TABLE IF NOT EXISTS "AffiliateClick" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "productSlug" TEXT,
    "locale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AffiliateClick_category_createdAt_idx" ON "AffiliateClick"("category", "createdAt");
