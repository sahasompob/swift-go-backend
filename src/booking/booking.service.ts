import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BookingStatus, UserRole } from '@prisma/client';

function isNum(n: any): n is number {
  return typeof n === 'number' && !Number.isNaN(n);
}
function toNum(n: any, field: string): number {
  const v = typeof n === 'string' ? Number(n) : n;
  if (!isNum(v)) throw new BadRequestException(`${field} must be a number`);
  return v;
}
function toStr(s: any, field: string): string {
  if (typeof s !== 'string' || !s.trim()) throw new BadRequestException(`${field} is required`);
  return s.trim();
}
function toDateOrNull(v: any, field: string) {
  if (v == null) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) throw new BadRequestException(`${field} must be an ISO date string`);
  return d;
}

function parsePage(v: any) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}
function parsePageSize(v: any) {
  const n = Number(v);
  const size = Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
  return Math.min(size, 100); // กันล้น
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) { }

  async createBooking(user: { sub: number; role: UserRole }, body: any) {

    if (!user || user.role !== 'CUSTOMER') {
      throw new ForbiddenException('Only CUSTOMER can create bookings');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!customer) {
      throw new BadRequestException('Customer profile not found for this user');
    }

    const fromAddress = toStr(body.fromAddress, 'fromAddress');
    const toAddress = toStr(body.toAddress, 'toAddress');

    const fromLat = toNum(body.fromLat, 'fromLat');
    const fromLng = toNum(body.fromLng, 'fromLng');
    const toLat = toNum(body.toLat, 'toLat');
    const toLng = toNum(body.toLng, 'toLng');

    const routePolyline = typeof body.routePolyline === 'string' ? body.routePolyline : null;
    const distanceKm = body.distanceKm != null ? toNum(body.distanceKm, 'distanceKm') : null;
    const estimatedPrice = body.estimatedPrice != null ? toNum(body.estimatedPrice, 'estimatedPrice') : null;
    const pickupAt = toDateOrNull(body.pickupAt, 'pickupAt');
    const dropoffAt = toDateOrNull(body.dropoffAt, 'dropoffAt');

    let initialVehicleId: number | null = null;
    if (body.initialVehicleId != null) {
      initialVehicleId = toNum(body.initialVehicleId, 'initialVehicleId');
      const exists = await this.prisma.vehicle.findUnique({ where: { id: initialVehicleId } });
      if (!exists) throw new BadRequestException('initialVehicleId not found');
    }

    const booking = await this.prisma.booking.create({
      data: {
        customerId: customer.id,
        initialVehicleId,
        fromAddress,
        fromLat,
        fromLng,
        toAddress,
        toLat,
        toLng,
        routePolyline,
        distanceKm,
        estimatedPrice,
        pickupAt,
        dropoffAt,

      },
      select: {
        id: true,
        status: true,
        acceptedOfferId: true,
        createdAt: true,
      },
    });

    return booking;
  }

  async getMyBookings(
    user: { sub: number; role: UserRole },
    query: { status?: string; page?: any; pageSize?: any },
  ) {
    if (!user || user.role !== 'CUSTOMER') {
      throw new ForbiddenException('Only CUSTOMER can view own bookings');
    }

    // หา customer profile ของ user นี้
    const customer = await this.prisma.customer.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!customer) {
      throw new BadRequestException('Customer profile not found for this user');
    }

    // ตัวกรองสถานะ (ถ้าส่งมา)
    let statusFilter: BookingStatus | undefined = undefined;
    if (query.status) {
      const s = String(query.status).toUpperCase();
      const allowed = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const;
      if (!allowed.includes(s as any)) {
        throw new BadRequestException('Invalid status filter');
      }
      statusFilter = s as BookingStatus;
    }

    // หน้า/ขนาดหน้า
    const page = parsePage(query.page);
    const pageSize = parsePageSize(query.pageSize);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // เงื่อนไขค้นหา
    const where = {
      customerId: customer.id,
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          status: true,
          fromAddress: true,
          toAddress: true,
          distanceKm: true,
          estimatedPrice: true,
          finalPrice: true,
          acceptedOfferId: true,
          assignedDriverId: true,
          pickupAt: true,
          dropoffAt: true,
          createdAt: true,
          // ถ้าอยากได้ข้อเสนอทั้งหมดด้วย เปิดคอมเมนต์ด้านล่าง
          // offers: {
          //   select: {
          //     id: true, driverId: true, vehicleId: true, price: true, status: true, note: true, createdAt: true
          //   }
          // }
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      data,
    };
  }

  async getAvailableBookings(
    user: { sub: number; role: UserRole },
    query: { page?: any; pageSize?: any; hideOfferedByMe?: string; pickupFromAfter?: string; pickupFromBefore?: string },
  ) {
    if (!user || user.role !== 'DRIVER') {
      throw new ForbiddenException('Only DRIVER can view available bookings');
    }

    // หา driver profile
    const driver = await this.prisma.driver.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!driver) throw new BadRequestException('Driver profile not found for this user');

    const page = parsePage(query.page);
    const pageSize = parsePageSize(query.pageSize);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const hideOfferedByMe = query.hideOfferedByMe !== 'false';

    const where: any = {
      status: 'PENDING' as BookingStatus,
      acceptedOfferId: null, 
      assignedDriverId: null,
    };

    const pickupFromAfter = toDateOrNull(query.pickupFromAfter, 'pickupFromAfter');
    const pickupFromBefore = toDateOrNull(query.pickupFromBefore, 'pickupFromBefore');
    if (pickupFromAfter || pickupFromBefore) {
      where.pickupAt = {
        ...(pickupFromAfter ? { gte: pickupFromAfter } : {}),
        ...(pickupFromBefore ? { lte: pickupFromBefore } : {}),
      };
    }

    if (hideOfferedByMe) {
      where.NOT = {
        offers: { some: { driverId: driver.id } },
      };
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          status: true,
          fromAddress: true,
          toAddress: true,
          distanceKm: true,
          estimatedPrice: true,
          pickupAt: true,
          dropoffAt: true,
          createdAt: true,
          _count: { select: { offers: true } },
          offers: {
            where: { driverId: driver.id },
            select: { id: true },
            take: 1,
          },
        },
      }),
    ]);

    // map ให้ได้ field อ่านง่าย
    const data = rows.map((b) => ({
      id: b.id,
      status: b.status,
      fromAddress: b.fromAddress,
      toAddress: b.toAddress,
      distanceKm: b.distanceKm,
      estimatedPrice: b.estimatedPrice,
      pickupAt: b.pickupAt,
      dropoffAt: b.dropoffAt,
      createdAt: b.createdAt,
      offersCount: b._count.offers,
      hasOfferedByMe: b.offers.length > 0,
    }));

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      data,
    };
  }

  async getBookingById(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        customerId: true,
        assignedDriverId: true,
        acceptedOfferId: true,
        fromAddress: true,
        fromLat: true,
        fromLng: true,
        toAddress: true,
        toLat: true,
        toLng: true,
        routePolyline: true,
        distanceKm: true,
        estimatedPrice: true,
        finalPrice: true,
        pickupAt: true,
        dropoffAt: true,
        createdAt: true,
        updatedAt: true,
        initialVehicleId: true,
        driverId: true,
        acceptedOffer: {
          select: {
            id: true, price: true, status: true, note: true,
            driverId: true,
            vehicleId: true
          },
        },
        // รายการข้อเสนอทั้งหมด (ไม่กรองตามคนส่ง)
        offers: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, price: true, status: true, note: true, createdAt: true,
            driverId: true,
            vehicleId: true
          },
        },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}
