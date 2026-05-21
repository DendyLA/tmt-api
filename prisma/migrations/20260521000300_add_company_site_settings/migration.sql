-- CreateTable
CREATE TABLE "CompanySiteSettings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "domain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanySiteSettings_companyId_key" ON "CompanySiteSettings"("companyId");
CREATE UNIQUE INDEX "CompanySiteSettings_domain_key" ON "CompanySiteSettings"("domain");
CREATE INDEX "CompanySiteSettings_domain_idx" ON "CompanySiteSettings"("domain");
CREATE INDEX "CompanySiteSettings_isActive_idx" ON "CompanySiteSettings"("isActive");

-- AddForeignKey
ALTER TABLE "CompanySiteSettings" ADD CONSTRAINT "CompanySiteSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
