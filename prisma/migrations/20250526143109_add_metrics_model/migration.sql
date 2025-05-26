-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('VISIT', 'API_CALL', 'ERROR', 'PERFORMANCE');

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "type" "MetricType" NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);
