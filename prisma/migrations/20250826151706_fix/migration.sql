/*
  Warnings:

  - Added the required column `imageUrl` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Vehicle_plateNumber_key";

-- AlterTable
ALTER TABLE "public"."Vehicle" ADD COLUMN     "baseFare" DECIMAL(10,2),
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "minFare" DECIMAL(10,2),
ADD COLUMN     "perKm" DECIMAL(10,2),
ADD COLUMN     "perStopFee" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "public"."VehiclePriceHistory" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "offerId" INTEGER,
    "distanceKm" DECIMAL(10,2),
    "price" DECIMAL(10,2) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiclePriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehiclePriceHistory_vehicleId_createdAt_idx" ON "public"."VehiclePriceHistory"("vehicleId", "createdAt");
