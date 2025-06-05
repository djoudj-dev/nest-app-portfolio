/*
  Warnings:

  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BadgeStatus" AS ENUM ('DISPONIBLE', 'INDISPONIBLE', 'DISPONIBLE_A_PARTIR_DE');

-- DropTable
-- Commented out because the Badge table might not exist
-- DROP TABLE "Badge";

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "BadgeStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "availableUntil" TIMESTAMP(3),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);
