import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { DriverService } from './driver.service';

@Controller('drivers')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post()
  createDriver(
    @Body()
    body: {
      userId: number;
      name: string;
      licenseNo: string;
      vehicleIds?: number[];
    },
  ) {
    return this.driverService.createDriver(body);
  }

  @Get()
  getAll() {
    return this.driverService.getAllDrivers();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.driverService.getDriverById(id);
  }
}
