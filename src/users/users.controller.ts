import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: { email: string; password: string; role?: UserRole }) {
    return this.userService.createUser(body.email, body.password, body.role);
  }

  @Get()
  getAll() {
    return this.userService.getUsers();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.userService.getUserById(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { email?: string; password?: string; role?: UserRole }) {
    return this.userService.updateUser(Number(id), body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.deleteUser(Number(id));
  }
}
