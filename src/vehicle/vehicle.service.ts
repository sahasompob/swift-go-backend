import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    capacity: number;
    imageUrl?: string;
    prices?: { minKm: number; maxKm: number; basePrice: number; pricePerKm: number }[];
    driverVehicles?: { driverId: number; status?: string }[];
  }) {
    return this.prisma.vehicle.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        imageUrl: data.imageUrl,
        prices: data.prices ? { create: data.prices } : undefined,
      },
      include: { prices: true },
    });
  }

  async findAll() {
    return this.prisma.vehicle.findMany({
      include: { prices: true},
    });
  }

  async findOne(id: number) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: { prices: true},
    });
  }

  async update(id: number, data: {
    name?: string;
    capacity?: number;
    imageUrl?: string;
    prices?: { id?: number; minKm: number; maxKm: number; basePrice: number; pricePerKm: number }[];
    driverVehicles?: { id?: number; driverId: number; status?: string }[];
  }) {
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        name: data.name,
        capacity: data.capacity,
        imageUrl: data.imageUrl,
        prices: data.prices ? {
          deleteMany: {},
          create: data.prices,
        } : undefined,
      },
      include: { prices: true},
    });
  }

  
  async remove(id: number) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
