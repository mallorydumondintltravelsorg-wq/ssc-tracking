import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
          error: "Admins can only respond to customer-created tickets",
        },
        {
          status: 403,
        }
      );
    }

    const body = await req.json();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!subject || !message) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        status: "Open",
        userId: session.user.id,
        userName: session.user.name || null,
        userEmail: session.user.email || null,
        messages: {
          create: {
            senderId: session.user.id,
            senderName: session.user.name || "Customer",
            senderRole: "customer",
            message,
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await notifyAdmins({
      type: "support.ticket",
      title: "New support ticket",
      message: `${session.user.email || "A customer"} opened: ${subject}`,
      href: "/admin#support",
    });

    return NextResponse.json({
      message: "Support ticket submitted successfully",
      ticket,
    });
  } catch (error) {
    console.error("Failed to create support ticket", error);

    return NextResponse.json(
      {
        error: "Failed to create support ticket",
      },
      {
        status: 500,
      }
    );
  }
}
