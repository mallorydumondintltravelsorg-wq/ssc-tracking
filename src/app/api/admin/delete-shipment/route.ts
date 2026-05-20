import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

  try {

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