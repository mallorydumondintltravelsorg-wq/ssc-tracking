import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  href?: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: input,
  });
}

export async function notifyAdmins(input: Omit<NotificationInput, "userId">) {
  const admins = await prisma.user.findMany({
    where: {
      role: "admin",
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      ...input,
      userId: admin.id,
    })),
  });
}

export async function notifyShipmentOwner(
  shipment: {
    userId: string | null;
    trackingNumber: string;
    status: string;
  },
  message: string
) {
  if (!shipment.userId) {
    return;
  }

  await createNotification({
    userId: shipment.userId,
    type: "shipment.status",
    title: `Shipment ${shipment.status}`,
    message,
    href: "/dashboard",
  });
}
