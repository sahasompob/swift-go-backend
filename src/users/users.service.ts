import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    email: string,
    password: string,
    role: UserRole = UserRole.CUSTOMER,
  ): Promise<{ user: any }> {
    const user = await this.prisma.user.create({
      data: { email, password, role },
      include: { customer: true, driver: true },
    });

    return { user: this.formatUser(user) };
  }

  async getUsers(): Promise<{ users: any[] }> {
    const users = await this.prisma.user.findMany({
      include: { customer: true, driver: true },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.customer?.name || user.driver?.name || null,
      createdAt: user.createdAt,
      customer: user.customer ?? null,
      driver: user.driver ?? null,
    }));

    return { users: formattedUsers };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        customer: true,
        driver: true,
      },
    });

    if (!user) return null;
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.customer?.name || user.driver?.name || null,
        createdAt: user.createdAt,
        customer: user.customer ?? null,
        driver: user.driver ?? null,
      },
    };
  }

  async updateUser(
    id: number,
    data: Partial<{ email: string; password: string; role: UserRole }>,
  ): Promise<{ user: any }> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { customer: true, driver: true },
    });

    return { user: this.formatUser(user) };
  }

  async deleteUser(id: number): Promise<{ user: any }> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { customer: true, driver: true },
    });

    return { user: this.formatUser(user) };
  }

  private formatUser(user: User & { customer?: any; driver?: any }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.customer?.name || user.driver?.name || null,
      createdAt: user.createdAt,
    };
  }
}
