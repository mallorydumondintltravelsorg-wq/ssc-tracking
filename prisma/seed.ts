import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@ssc.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@ssc.com",
      password: "demo123",
    },
  });

  // Create a sample shipment
  await prisma.shipment.upsert({
    where: { trackingNumber: "SSC001" },
    update: {},
    create: {
      trackingNumber: "SSC001",
      origin: "London",
      destination: "Lagos",
      status: "In Transit",
      currentLocation: "Paris Hub",
    },
  });

  console.log("Seed data inserted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
