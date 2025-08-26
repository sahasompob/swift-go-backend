/*
  Warnings:

  - You are about to drop the column `companyId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Vehicle" DROP CONSTRAINT "Vehicle_companyId_fkey";

-- DropIndex
DROP INDEX "public"."Vehicle_companyId_idx";

-- AlterTable
ALTER TABLE "public"."Vehicle" DROP COLUMN "companyId";

-- DropTable
DROP TABLE "public"."Company";
