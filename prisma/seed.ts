import { PrismaClient, UserRole, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---------- USERS ----------
  const customerUser = await prisma.user.create({
    data: { email: "customer1@example.com", password: "123456", role: UserRole.CUSTOMER },
  });

  const adminUser = await prisma.user.create({
    data: { email: "admin@example.com", password: "123456", role: UserRole.ADMIN },
  });

  // ---------- CUSTOMERS ----------
  const customer = await prisma.customer.create({
    data: {
      name: "Customer 1",
      phone: "0800000001",
      userId: customerUser.id,
    },
  });

  // ---------- DRIVERS ----------
  const driver1 = await prisma.driver.create({
    data: {
      name: "Driver 1",
      licenseNo: "DL-1001",
      user: { create: { email: "driver1@example.com", password: "123456", role: UserRole.DRIVER } },
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: "Driver 2",
      licenseNo: "DL-1002",
      user: { create: { email: "driver2@example.com", password: "123456", role: UserRole.DRIVER } },
    },
  });

  // ---------- VEHICLES ----------
  const vehicle1 = await prisma.vehicle.create({
    data: {
      name: "Van 1",
      capacity: 8,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      name: "Van 2",
      capacity: 12,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ---------- PRICES ----------
  await prisma.price.createMany({
    data: [
      { vehicleId: vehicle1.id, minKm: 0, maxKm: 10, basePrice: 100, pricePerKm: 10 },
      { vehicleId: vehicle1.id, minKm: 11, maxKm: 50, basePrice: 200, pricePerKm: 8 },
      { vehicleId: vehicle2.id, minKm: 0, maxKm: 10, basePrice: 120, pricePerKm: 12 },
      { vehicleId: vehicle2.id, minKm: 11, maxKm: 50, basePrice: 220, pricePerKm: 9 },
    ],
  });

  // ---------- BOOKINGS ----------
  await prisma.booking.createMany({
    data: [
      {
        customerId: customer.id,
        vehicleId: vehicle1.id,
        driverId: driver1.id,
        fromAddress: "Bangkok",
        toAddress: "Chiang Mai",
        distanceKm: 700,
        totalPrice: 5000,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
      },
      {
        customerId: customer.id,
        vehicleId: vehicle2.id,
        driverId: driver2.id,
        fromAddress: "Bangkok",
        toAddress: "Pattaya",
        distanceKm: 150,
        totalPrice: 1500,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
