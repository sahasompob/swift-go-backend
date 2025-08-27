import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('my')
  @HttpCode(HttpStatus.CREATED)
  async registerMyVehicle(@Body() body: any) {
    return this.vehicleService.registerMyVehicle(body);
  }
}
