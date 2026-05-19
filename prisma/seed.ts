import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a demo user first
  const user = await prisma.user.upsert({
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
      senderName: "John Sender",
      receiverName: "Alice Receiver",
      origin: "London",
      destination: "Lagos",
      status: "In Transit",
      currentLocation: "Paris Hub",
      userId: user.id,
      events: {
        create: [
          {
            location: "London Warehouse",
            description: "Package received at warehouse",
          },
          {
            location: "Paris Hub",
            description: "Package in transit through hub",
          },
        ],
      },
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