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
}
