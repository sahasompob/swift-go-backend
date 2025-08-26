import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [VehicleController],
  providers: [VehicleService, PrismaService],
  exports: [VehicleService],
})
export class VehicleModule {}