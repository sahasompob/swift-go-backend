import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DriverOfferService } from './driver.offer.service';

@Controller('driver-offer')
export class DriverOfferController {
  constructor(private readonly driverOfferService: DriverOfferService) {}

  // POST /driver-offer
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() body: any) {
    return this.driverOfferService.createOffer(req.user, body);
  }
}
