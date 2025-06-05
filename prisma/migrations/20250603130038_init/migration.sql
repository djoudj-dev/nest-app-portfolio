/*
  Warnings:

  - The values [VISIT,BOT,ERROR,PERFORMANCE] on the enum `MetricType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Metric` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MetricType_new" AS ENUM ('USER_VISIT', 'BOT_VISIT', 'CV_VISIT', 'CV_CLICK', 'API_CALL', 'API_ERROR', 'API_PERF');
ALTER TABLE "Metric" ALTER COLUMN "type" TYPE "MetricType_new" USING ("type"::text::"MetricType_new");
ALTER TYPE "MetricType" RENAME TO "MetricType_old";
ALTER TYPE "MetricType_new" RENAME TO "MetricType";
DROP TYPE "MetricType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Metric" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "Metric_type_createdAt_idx" ON "Metric"("type", "createdAt");
