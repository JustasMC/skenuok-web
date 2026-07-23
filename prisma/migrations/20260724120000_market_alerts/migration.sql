-- CreateTable
CREATE TABLE "MarketAlert" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "interval" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketAlert_createdAt_idx" ON "MarketAlert"("createdAt");

-- CreateIndex
CREATE INDEX "MarketAlert_symbol_createdAt_idx" ON "MarketAlert"("symbol", "createdAt");

-- CreateIndex
CREATE INDEX "MarketAlert_source_createdAt_idx" ON "MarketAlert"("source", "createdAt");
