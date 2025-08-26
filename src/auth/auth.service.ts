import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'prisma/prisma.service';

function toRole(input: any): UserRole {
  const r = String(input ?? 'CUSTOMER').toUpperCase();
  if (r === 'CUSTOMER' || r === 'DRIVER' || r === 'ADMIN') return r as UserRole;
  throw new BadRequestException('Invalid role');
}

function isEmail(v: any) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async signup(body: any) {
    if (!body || !isEmail(body.email)) {
      throw new BadRequestException('Invalid email');
    }
    if (
      !body.password ||
      typeof body.password !== 'string' ||
      body.password.length < 6
    ) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const role = toRole(body.role);

    const profile = body.profile ?? {};
    const name =
      typeof profile.name === 'string' && profile.name.trim()
        ? profile.name.trim()
        : role === 'DRIVER'
          ? 'Driver'
          : role === 'CUSTOMER'
            ? 'Customer'
            : 'Admin';
    const phone = typeof profile.phone === 'string' ? profile.phone : null;
    const licenseNumber =
      typeof profile.licenseNumber === 'string' ? profile.licenseNumber : null;

    const passwordHash = await bcrypt.hash(body.password, 10);

    try {
      return await this.prisma.$transaction(async (data) => {
        const user = await data.user.create({
          data: {
            email: body.email,
            password: passwordHash,
            role,
          },
        });

        if (role === 'CUSTOMER') {
          await data.customer.create({
            data: { userId: user.id, name, phone },
          });
        } else if (role === 'DRIVER') {
          await data.driver.create({
            data: { userId: user.id, name, phone, licenseNumber },
          });
        }
        return user;
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {

        if (e.code === 'P2002') {
          throw new BadRequestException(
            'Duplicate field (likely email already in use)',
          );
        }

      }
      throw e;
    }
  }

  async login(body: any) {
    if (!body || !isEmail(body.email)) {
      throw new BadRequestException('Invalid email');
    }
    if (!body.password || typeof body.password !== 'string') {
      throw new BadRequestException('Invalid password');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, password: true, role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role as UserRole };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
