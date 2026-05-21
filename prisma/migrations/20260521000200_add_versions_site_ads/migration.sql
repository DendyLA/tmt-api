-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('IMAGE', 'HTML', 'SCRIPT');

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdSpace" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "locationKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "type" "AdType" NOT NULL,
    "imageUrl" TEXT,
    "targetUrl" TEXT,
    "embedCode" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "companyId" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_entityType_entityId_version_key" ON "ContentVersion"("entityType", "entityId", "version");
CREATE INDEX "ContentVersion_entityType_entityId_idx" ON "ContentVersion"("entityType", "entityId");
CREATE INDEX "ContentVersion_createdBy_idx" ON "ContentVersion"("createdBy");

CREATE UNIQUE INDEX "AdSpace_companyId_locationKey_key" ON "AdSpace"("companyId", "locationKey");
CREATE INDEX "AdSpace_companyId_idx" ON "AdSpace"("companyId");

CREATE INDEX "Ad_companyId_idx" ON "Ad"("companyId");
CREATE INDEX "Ad_isGlobal_idx" ON "Ad"("isGlobal");
CREATE INDEX "Ad_isActive_idx" ON "Ad"("isActive");

CREATE UNIQUE INDEX "AdPlacement_adId_spaceId_key" ON "AdPlacement"("adId", "spaceId");
CREATE INDEX "AdPlacement_companyId_idx" ON "AdPlacement"("companyId");
CREATE INDEX "AdPlacement_spaceId_idx" ON "AdPlacement"("spaceId");

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdSpace" ADD CONSTRAINT "AdSpace_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdPlacement" ADD CONSTRAINT "AdPlacement_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdPlacement" ADD CONSTRAINT "AdPlacement_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "AdSpace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdPlacement" ADD CONSTRAINT "AdPlacement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
