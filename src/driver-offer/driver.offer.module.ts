import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DriverOfferController } from './driver.offer.controller';
import { DriverOfferService } from './driver.offer.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [DriverOfferController],
  providers: [DriverOfferService, PrismaService],
  exports: [DriverOfferService],
})
export class DriverOfferModule {}
