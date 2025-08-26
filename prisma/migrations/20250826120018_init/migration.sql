/*
  Warnings:

  - The values [CANCELLED,QUOTED,ASSIGNED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `totalPrice` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `Booking` table. All the data in the column will be lost.
  - You are about to alter the column `distanceKm` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `licenseNo` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[acceptedOfferId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plateNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plateNumber` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('MOTORCYCLE', 'VAN', 'PICKUP', 'TRUCK6W', 'TRUCK10W', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Booking" ALTER COLUMN "status" TYPE "public"."BookingStatus_new" USING ("status"::text::"public"."BookingStatus_new");
ALTER TYPE "public"."BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "public"."BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "public"."Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_vehicleId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_driverId_pickupAt_dropoffAt_idx";

-- DropIndex
DROP INDEX "public"."Booking_vehicleId_pickupAt_dropoffAt_idx";

-- DropIndex
DROP INDEX "public"."Customer_phone_key";

-- DropIndex
DROP INDEX "public"."User_role_idx";

-- DropIndex
DROP INDEX "public"."Vehicle_status_idx";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "totalPrice",
DROP COLUMN "vehicleId",
ADD COLUMN     "acceptedOfferId" INTEGER,
ADD COLUMN     "assignedDriverId" INTEGER,
ADD COLUMN     "estimatedPrice" DECIMAL(10,2),
ADD COLUMN     "finalPrice" DECIMAL(10,2),
ADD COLUMN     "initialVehicleId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "distanceKm" DROP NOT NULL,
ALTER COLUMN "distanceKm" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "dropoffAt" DROP NOT NULL,
ALTER COLUMN "pickupAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Customer" ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Driver" DROP COLUMN "licenseNo",
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Vehicle" DROP COLUMN "capacity",
DROP COLUMN "imageUrl",
DROP COLUMN "status",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "capacityKg" INTEGER,
ADD COLUMN     "isCompanyOwned" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "ownerDriverId" INTEGER,
ADD COLUMN     "plateNumber" TEXT NOT NULL,
ADD COLUMN     "type" "public"."VehicleType" NOT NULL,
ADD COLUMN     "year" INTEGER;

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."Price";

-- DropEnum
DROP TYPE "public"."VehicleStatus";

-- CreateTable
CREATE TABLE "public"."BookingOffer" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "public"."OfferStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingOffer_bookingId_driverId_key" ON "public"."BookingOffer"("bookingId", "driverId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_acceptedOfferId_key" ON "public"."Booking"("acceptedOfferId");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "public"."Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_assignedDriverId_idx" ON "public"."Booking"("assignedDriverId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "public"."Vehicle"("plateNumber");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_acceptedOfferId_fkey" FOREIGN KEY ("acceptedOfferId") REFERENCES "public"."BookingOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingOffer" ADD CONSTRAINT "BookingOffer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
