-- CreateTable
CREATE TABLE "VacancyVersion" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VacancyVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VacancyVersion" ADD CONSTRAINT "VacancyVersion_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
