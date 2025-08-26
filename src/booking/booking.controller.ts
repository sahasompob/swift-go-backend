import { Controller, Get, Param, Post, Body, ParseIntPipe } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() body: {
    customerId: number;
    vehicleId: number;
    driverId?: number | null;
    fromAddress: string;
    toAddress: string;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    routePolyline?: string | null;
    distanceKm: number;
    totalPrice: number;
    pickupAt: Date;
    dropoffAt: Date;
    
  }) {
    return this.bookingService.createBooking(body);
  }

  @Get('driver/:driverId')
  async getDriverBookings(@Param('driverId') driverId: string) {
    return this.bookingService.getDriverBookings(Number(driverId));
  }

  @Get('customer/:customerId')
  async getCustomerBookings(@Param('customerId') customerId: string) {
    return this.bookingService.getCustomerBookings(Number(customerId));
  }
  @Get()
  getAllBookings() {
    return this.bookingService.getAllBookings();
  }

//   @Get(':id')
//   getBookingById(@Param('id', ParseIntPipe) id: number) {
//     return this.bookingService.getBookingById(id);
//   }

//   @Post()
//   createBooking(@Body() body: {
//     customerId: number;
//     vehicleId: number;
//     fromAddress: string;
//     toAddress: string;
//     distanceKm: number;
//     driverIds?: number[];
//   }) {
//     return this.bookingService.createBooking(body);
//   }
}
