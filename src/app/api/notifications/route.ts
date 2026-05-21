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

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          readAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to load notifications", error);

    return NextResponse.json(
      {
        error: "Failed to load notifications",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const notificationId = String(body.notificationId || "").trim();
    const markAll = Boolean(body.markAll);
    const readAt = new Date();

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          readAt: null,
        },
        data: {
          readAt,
        },
      });

      return NextResponse.json({
        message: "Notifications marked as read",
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        {
          error: "Notification id required",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        readAt,
      },
    });

    return NextResponse.json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Failed to update notifications", error);

    return NextResponse.json(
      {
        error: "Failed to update notifications",
      },
      {
        status: 500,
      }
    );
  }
}
