import { getCurrentSession } from "@/lib/auth";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
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

    const body = await req.json();
    const ticketId = String(body.ticketId || "").trim();
    const message = String(body.message || "").trim();
    const status = String(body.status || "").trim();

    if (!ticketId || !message) {
      return NextResponse.json(
        {
          error: "Ticket and message are required",
        },
        {
          status: 400,
        }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          error: "Ticket not found",
        },
        {
          status: 404,
        }
      );
    }

    if (session.user.role !== "admin" && ticket.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    if (session.user.role === "admin" && !ticket.userId) {
      return NextResponse.json(
        {
          error: "Ticket is not tied to a customer account",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        senderName: session.user.name || session.user.email || "Support User",
        senderRole: session.user.role,
        message,
      },
    });

    const updatedTicket = await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: session.user.role === "admin" && status ? status : "Pending",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (session.user.role === "admin" && ticket.userId) {
      await createNotification({
        userId: ticket.userId,
        type: "support.reply",
        title: "Support replied",
        message: `Support replied to ${ticket.subject}`,
        href: "/support",
      });
    }

    if (session.user.role !== "admin") {
      await notifyAdmins({
        type: "support.customer_reply",
        title: "Customer replied",
        message: `${session.user.email || "A customer"} replied to ${ticket.subject}`,
        href: "/admin#support",
      });
    }

    return NextResponse.json({
      message: "Support message sent",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Failed to send support message", error);

    return NextResponse.json(
      {
        error: "Failed to send support message",
      },
      {
        status: 500,
      }
    );
  }
}
