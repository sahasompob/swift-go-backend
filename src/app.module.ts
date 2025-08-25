import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CustomerModule } from './customer/customer.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { PriceModule } from './price/price.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module'



@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CustomerModule,
    VehicleModule,
    AuthModule,
    BookingModule,
    DriverModule,
    PriceModule
  ],
})
export class AppModule {}
