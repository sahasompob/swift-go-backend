import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(data: { name: string; phone: string; email: string; password: string }) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          role: UserRole.CUSTOMER,
          customer: {
            create: {
              name: data.name,
              phone: data.phone,
            },
          },
        },
        include: { customer: true },
      });
      return user;
    } catch (error: any) {
        
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw new BadRequestException(error.message);
    }
  }

  async getAllCustomers() {
    return this.prisma.customer.findMany({
      include: {
        user: true,
        bookings: true,
      },
    });
  }

  async getCustomerById(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { user: true, bookings: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async updateCustomer(id: number, data: { name?: string; phone?: string; email?: string; password?: string }) {
    try {
      const customer = await this.prisma.customer.update({
        where: { id },
        data: {
          name: data.name,
          phone: data.phone,
          user: data.email || data.password ? { update: { email: data.email, password: data.password } } : undefined,
        },
        include: { user: true },
      });
      return customer;
    } catch (error: any) {
      if (error.code === 'P2002') throw new ConflictException('Email or phone already exists');
      if (error.code === 'P2025') throw new NotFoundException('Customer not found');
      throw new BadRequestException(error.message);
    }
  }

  async deleteCustomer(id: number) {
    try {
      return await this.prisma.customer.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Customer not found');
      throw new BadRequestException(error.message);
    }
  }
}
