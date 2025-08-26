/*
  Warnings:

  - Added the required column `dropoffAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromLat` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromLng` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLat` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLng` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BookingStatus" ADD VALUE 'QUOTED';
ALTER TYPE "public"."BookingStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "public"."BookingStatus" ADD VALUE 'IN_PROGRESS';

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_driverId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "dropoffAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fromLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fromLng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pickupAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "routePolyline" TEXT,
ADD COLUMN     "toLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "toLng" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "driverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Price" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'THB',
ADD COLUMN     "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "effectiveTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "status" "public"."VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE INDEX "Booking_customerId_createdAt_idx" ON "public"."Booking"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_driverId_pickupAt_dropoffAt_idx" ON "public"."Booking"("driverId", "pickupAt", "dropoffAt");

-- CreateIndex
CREATE INDEX "Booking_vehicleId_pickupAt_dropoffAt_idx" ON "public"."Booking"("vehicleId", "pickupAt", "dropoffAt");

-- CreateIndex
CREATE INDEX "Price_vehicleId_effectiveFrom_effectiveTo_idx" ON "public"."Price"("vehicleId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "Vehicle_companyId_idx" ON "public"."Vehicle"("companyId");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "public"."Vehicle"("status");

-- AddForeignKey
ALTER TABLE "public"."Vehicle" ADD CONSTRAINT "Vehicle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
