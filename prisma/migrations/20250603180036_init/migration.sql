/*
  Warnings:

  - The values [USER_VISIT,BOT_VISIT,API_ERROR,API_PERF] on the enum `MetricType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Hero` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MetricType_new" AS ENUM ('VISIT', 'BOT', 'CV_VISIT', 'CV_CLICK', 'API_CALL', 'ERROR', 'PERFORMANCE');
ALTER TABLE "Metric" ALTER COLUMN "type" TYPE "MetricType_new" USING ("type"::text::"MetricType_new");
ALTER TYPE "MetricType" RENAME TO "MetricType_old";
ALTER TYPE "MetricType_new" RENAME TO "MetricType";
DROP TYPE "MetricType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Metric" ADD COLUMN     "userId" TEXT;

-- DropTable
-- Commented out because the Hero table might not exist
-- DROP TABLE "Hero";

-- CreateTable
CREATE TABLE "CV" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CV_pkey" PRIMARY KEY ("id")
);
