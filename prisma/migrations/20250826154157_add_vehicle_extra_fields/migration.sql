/*
  Warnings:

  - A unique constraint covering the columns `[plateNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Vehicle" ALTER COLUMN "plateNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "public"."Vehicle"("plateNumber");
