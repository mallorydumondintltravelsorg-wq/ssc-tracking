import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trackingNumber = String(body.trackingNumber || "").trim();
    const location = String(body.location || "").trim();
    const status = String(body.status || "").trim();

    if (!trackingNumber || !location || !status) {
      return NextResponse.json(
        {
          error: "Tracking number, location, and status are required",
        },
        {
          status: 400,
        }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: {
        trackingNumber,
      },
    });

    if (!shipment) {
      return NextResponse.json(
        {
          error: "Shipment not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status,
        currentLocation: location,
      },
    });

    return NextResponse.json({
      message: "Shipment status updated successfully",
    });
  } catch (error) {
    console.error("Shipment status update failed", error);

    return NextResponse.json(
      {
        error: "Failed to update shipment status",
      },
      {
        status: 500,
      }
    );
  }
}
