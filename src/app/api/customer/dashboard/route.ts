import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    if (session.user.role === "admin") {
      return NextResponse.json(
        {
          error: "Customer access required",
        },
        {
          status: 403,
        }
      );
    }

    const [shipments, tickets, unreadNotifications] = await Promise.all([
      prisma.shipment.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          stages: {
            orderBy: {
              sequence: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.supportTicket.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          readAt: null,
        },
      }),
    ]);

    const delivered = shipments.filter(
      (shipment) => shipment.status === "Delivered"
    ).length;

    return NextResponse.json({
      shipments,
      tickets,
      stats: {
        totalShipments: shipments.length,
        activeShipments: shipments.length - delivered,
        delivered,
        openTickets: tickets.filter(
          (ticket) => ticket.status !== "Closed" && ticket.status !== "Resolved"
        ).length,
        unreadNotifications,
      },
    });
  } catch (error) {
    console.error("Failed to load customer dashboard", error);

    return NextResponse.json(
      {
        error: "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}
