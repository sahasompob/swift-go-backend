import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PriceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { vehicleId: number; minKm: number; maxKm: number; basePrice: number; pricePerKm: number }) {
    return this.prisma.price.create({ data });
  }

  async findAll() {
    return this.prisma.price.findMany({ include: { vehicle: true } });
  }

  async findOne(id: number) {
    return this.prisma.price.findUnique({ where: { id }, include: { vehicle: true } });
  }

  async update(id: number, data: { minKm?: number; maxKm?: number; basePrice?: number; pricePerKm?: number }) {
    return this.prisma.price.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.price.delete({ where: { id } });
  }
}
