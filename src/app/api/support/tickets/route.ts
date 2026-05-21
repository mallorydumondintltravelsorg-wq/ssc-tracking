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

    const tickets = await prisma.supportTicket.findMany({
      where:
        session.user.role === "admin"
          ? undefined
          : {
              userId: session.user.id,
            },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      tickets,
    });
  } catch (error) {
    console.error("Failed to list support tickets", error);

    return NextResponse.json(
      {
        error: "Failed to list support tickets",
      },
      {
        status: 500,
      }
    );
  }
}
