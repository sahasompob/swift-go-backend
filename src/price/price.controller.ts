import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Post()
  create(@Body() body: { vehicleId: number; minKm: number; maxKm: number; basePrice: number; pricePerKm: number }) {
    return this.priceService.create(body);
  }

  @Get()
  findAll() {
    return this.priceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { minKm?: number; maxKm?: number; basePrice?: number; pricePerKm?: number }) {
    return this.priceService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceService.remove(id);
  }
}
