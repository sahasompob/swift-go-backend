import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

const VEHICLE_TYPES = ['MOTORCYCLE','VAN','PICKUP','TRUCK6W','TRUCK10W','OTHER'] as const;
type VehicleType = typeof VEHICLE_TYPES[number];

function reqStr(v: any, field: string) {
  if (typeof v !== 'string' || !v.trim()) throw new BadRequestException(`${field} is required`);
  return v.trim();
}
function optNum(v: any, field: string) {
  if (v == null) return null;
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || Number.isNaN(n)) throw new BadRequestException(`${field} must be a number`);
  return n;
}
function optYear(v: any) {
  if (v == null) return null;
  const n = typeof v === 'string' ? Number(v) : v;
  const year = new Date().getFullYear();
  if (!Number.isInteger(n) || n < 1980 || n > year + 1) throw new BadRequestException('year out of range');
  return n;
}
function toVehicleType(v: any) {
  const s = typeof v === 'string' ? v.toUpperCase().trim() : '';
  if (!VEHICLE_TYPES.includes(s as VehicleType)) {
    throw new BadRequestException(`type must be one of ${VEHICLE_TYPES.join(', ')}`);
  }
  return s as VehicleType;
}

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async registerMyVehicle(user: { sub: number; role: UserRole }, body: any) {
    if (!user) throw new ForbiddenException('Unauthorized');

    const driver = await this.prisma.driver.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!driver) throw new BadRequestException('Driver profile not found');

    // รับค่าอินพุต (ignore isCompanyOwned/ownerDriverId จาก client)
    const imageUrl    = reqStr(body.imageUrl, 'imageUrl');
    const name        = reqStr(body.name, 'name');
    const plateNumber = reqStr(body.plateNumber, 'plateNumber');
    const brand       = reqStr(body.brand, 'brand');
    const model       = reqStr(body.model, 'model');
    const type        = toVehicleType(body.type);
    const year        = optYear(body.year);
    const capacityKg  = optNum(body.capacityKg, 'capacityKg');

    try {
      const vehicle = await this.prisma.vehicle.create({
        data: {
          imageUrl,
          name,
          plateNumber,
          brand,
          model,
          year,
          type: type as any,
          capacityKg,
          isCompanyOwned: false,
          ownerDriverId: driver.id,
        },
        select: {
          id: true, imageUrl: true, name: true, plateNumber: true,
          brand: true, model: true, year: true, type: true,
          capacityKg: true, isCompanyOwned: true, ownerDriverId: true,
          createdAt: true,
        },
      });
      return vehicle;
    } catch (e) {
      // กันทะเบียนซ้ำ (ถ้าตั้ง @unique ที่ plateNumber แนะนำให้เพิ่ม)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('plateNumber already exists');
      }
      throw e;
    }
  }
}
