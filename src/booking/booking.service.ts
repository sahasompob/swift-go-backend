import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(data: {
    customerId: number;
    vehicleId: number;
    driverId: number;
    fromAddress: string;
    toAddress: string;
    distanceKm: number;
    totalPrice: number;
  }) {
    return this.prisma.booking.create({
      data: {
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        distanceKm: data.distanceKm,
        totalPrice: data.totalPrice,
        status: BookingStatus.PENDING,
      },
    });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        customer: true,
        vehicle: true,
      },
    });
  }

  async getDriverBookings(driverId: number) {
    return this.prisma.booking.findMany({
      where: { driverId },
      include: { customer: true, vehicle: true },
    });
  }

  async getCustomerBookings(customerId: number) {
    return this.prisma.booking.findMany({
      where: { customerId },
      include: { vehicle: true, driver: true },
    });
  }

  //   async getBookingById(id: number) {
  //     return this.prisma.booking.findUnique({
  //       where: { id },
  //       include: {
  //         customer: true,
  //         vehicle: true,
  //         drivers: { include: { driver: { include: { user: true } } } },
  //       },
  //     });
  //   }

  //   async createBooking(data: {
  //     customerId: number;
  //     vehicleId: number;
  //     fromAddress: string;
  //     toAddress: string;
  //     distanceKm: number;
  //     driverIds?: number[];
  //   }) {
  //     const vehicle = await this.prisma.vehicle.findUnique({ where: { id: data.vehicleId }, include: { prices: true } });
  //     if (!vehicle) throw new Error('Vehicle not found');

  //     let pricePerKm = 0;
  //     let basePrice = 0;
  //     for (const p of vehicle.prices) {
  //       if (data.distanceKm >= p.minKm && data.distanceKm <= p.maxKm) {
  //         pricePerKm = p.pricePerKm;
  //         basePrice = p.basePrice;
  //         break;
  //       }
  //     }
  //     const totalPrice = basePrice + data.distanceKm * pricePerKm;

  //     const booking = await this.prisma.booking.create({
  //       data: {
  //         customerId: data.customerId,
  //         vehicleId: data.vehicleId,
  //         fromAddress: data.fromAddress,
  //         toAddress: data.toAddress,
  //         distanceKm: data.distanceKm,
  //         totalPrice,
  //         status: BookingStatus.PENDING,
  //         drivers: {
  //           create: data.driverIds?.map((driverId) => ({ driverId })) || [],
  //         },
  //       },
  //       include: {
  //         customer: true,
  //         vehicle: true,
  //         drivers: { include: { driver: { include: { user: true } } } },
  //       },
  //     });

  //     return booking;
  //   }
}
