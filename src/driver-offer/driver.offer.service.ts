// driver-offer.service.ts
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

function toNum(v: any, field: string) {
    const n = typeof v === 'string' ? Number(v) : v;
    if (!Number.isFinite(n)) throw new BadRequestException(`${field} must be a number`);
    return n;
}
function round2(n: number) { return Math.round(n * 100) / 100; }

@Injectable()
export class DriverOfferService {
    constructor(private readonly prisma: PrismaService) { }

    async createOffer(body: any) {
        // if (!user) throw new ForbiddenException('Unauthorized');
        // if (user.role !== 'DRIVER') throw new ForbiddenException('Only DRIVER can create an offer');

        const bookingId = toNum(body.bookingId, 'bookingId');
        const vehicleId = toNum(body.vehicleId, 'vehicleId');
        const driverId = toNum(body.driverId, 'driverId');

        // ตรวจ booking ยังเปิดรับข้อเสนอ
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            select: { id: true, status: true, acceptedOfferId: true, assignedDriverId: true, distanceKm: true },
        });

        if (!booking) throw new BadRequestException('Booking not found');

        if (booking.status !== 'PENDING' || booking.acceptedOfferId || booking.assignedDriverId) {
            throw new BadRequestException('Booking is not open for offers');
        }

        // หา driver id
        const driver = await this.prisma.driver.findUnique({
            where: { userId: driverId },
            select: { id: true },
        });

        if (!driver) throw new BadRequestException('Driver profile not found');

        // อ่านรถ + template ราคา
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
            select: {
                id: true,
                isCompanyOwned: true,
                ownerDriverId: true,
                baseFare: true, perKm: true, minFare: true, perStopFee: true,
            },
        });

        if (!vehicle) throw new BadRequestException('Vehicle not found');

        // if (!vehicle.isCompanyOwned) {
        //     if (vehicle.ownerDriverId == null || vehicle.ownerDriverId !== driver.id) {
        //         throw new ForbiddenException('You are not allowed to use this vehicle');
        //     }
        // }

        let price: number;
        let strategy = 'manual';

        if (body.price != null) {
            price = toNum(body.price, 'price');
            if (price <= 0) throw new BadRequestException('price must be > 0');
        } else {
            strategy = 'vehicle-template';
            // ต้องมี distance + template
            const dist = booking.distanceKm ? Number(booking.distanceKm) : null;
            if (!dist || !vehicle.baseFare || !vehicle.perKm) {
                throw new BadRequestException('Vehicle has no default pricing template or booking has no distanceKm');
            }
            const base = Number(vehicle.baseFare);
            const perKm = Number(vehicle.perKm);
            const minFare = vehicle.minFare ? Number(vehicle.minFare) : 0;
            price = Math.max(minFare, base + perKm * dist);
            price = round2(price);
        }

        // 2) สร้าง offer + บันทึก history ใน transaction เดียว
        return await this.prisma.$transaction(async (tx) => {
            const offer = await tx.bookingOffer.create({
                data: {
                    bookingId,
                    driverId: driver.id,
                    vehicleId,
                    price: new Prisma.Decimal(price!),
                    note: body.note ?? null,
                },
                select: {
                    id: true, bookingId: true, driverId: true, vehicleId: true, price: true, status: true, note: true, createdAt: true
                },
            });

            await tx.vehiclePriceHistory.create({
                data: {
                    vehicleId,
                    bookingId,
                    offerId: offer.id,
                    distanceKm: booking.distanceKm ?? null,
                    price: offer.price,
                    details: {
                        strategy,
                        usedTemplate: strategy === 'vehicle-template' ? {
                            baseFare: vehicle.baseFare,
                            perKm: vehicle.perKm,
                            minFare: vehicle.minFare ?? null,
                        } : null,
                        manualPrice: strategy === 'manual' ? price : null,
                    },
                } as any,
            });

            return offer;
        });
    }
}
