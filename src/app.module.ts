import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CustomerModule } from './customer/customer.module';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { BookingsModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module'



@Module({
  imports: [
    PrismaModule,
    UsersModule,
    CustomerModule,
    VehicleModule,
    AuthModule,
    BookingsModule,
    DriverModule
  ],
})
export class AppModule {}
