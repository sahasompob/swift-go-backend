import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async createDriver(data: {
    userId: number;
    name: string;
    licenseNo: string;
    vehicleIds?: number[];
  }) {
    return this.prisma.driver.create({
      data: {
        userId: data.userId,
        name: data.name,
        licenseNo: data.licenseNo,
      },
      include: { user: true },
    });
  }

  async getAllDrivers() {
    return this.prisma.driver.findMany({
      include: {
        user: true,
      },
    });
  }

  async getDriverById(id: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        user: true
      },
    });

    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }
}
