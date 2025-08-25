/*
  Warnings:

  - You are about to drop the `BookingDriver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverVehicle` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `driverId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BookingDriver" DROP CONSTRAINT "BookingDriver_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingDriver" DROP CONSTRAINT "BookingDriver_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DriverVehicle" DROP CONSTRAINT "DriverVehicle_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DriverVehicle" DROP CONSTRAINT "DriverVehicle_vehicleId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "driverId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Driver" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."BookingDriver";

-- DropTable
DROP TABLE "public"."DriverVehicle";

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
