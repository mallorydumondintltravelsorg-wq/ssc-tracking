import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

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

    const {
      trackingNumber,
    } = await req.json();

    if (!trackingNumber) {

      return NextResponse.json({
        error:
          "Tracking number required",
      });
    }

    await prisma.shipment.deleteMany({
      where: {
        trackingNumber,
      },
    });

    return NextResponse.json({
      message:
        "Shipment deleted successfully",
    });

  } catch (error) {

    return NextResponse.json({
      error:
        "Failed to delete shipment",
    });
  }
}
