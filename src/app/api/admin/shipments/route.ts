import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Admin access required",
        },
        {
          status: 403,
        }
      );
    }

    const shipments = await prisma.shipment.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        stages: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      shipments,
    });
  } catch (error) {
    console.error("Failed to load admin shipments", error);

    return NextResponse.json(
      {
        error: "Failed to load shipments",
      },
      {
        status: 500,
      }
    );
  }
}
