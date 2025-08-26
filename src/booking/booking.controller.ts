import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './booking.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() body: any) {
    const user = req.user;
    const booking = await this.bookingsService.createBooking(user, body);

    return {
      id: booking.id,
      status: booking.status,
      acceptedOfferId: booking.acceptedOfferId,
      createdAt: booking.createdAt,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-booking')
  async getMy(@Req() req: any, @Query() q: any) {
    return this.bookingsService.getMyBookings(req.user, q);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  async getAvailable(@Req() req: any, @Query() q: any) {
    return this.bookingsService.getAvailableBookings(req.user, q);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getDetail(@Req() _req: any, @Param('id') idParam: string) {
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return { error: 'Invalid id' };
    }
    return this.bookingsService.getBookingById(id);
  }
}
