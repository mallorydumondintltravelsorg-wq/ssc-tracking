import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trackingNumber = String(body.trackingNumber || "").trim();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number required" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...shipment,
      events: [],
    });
  } catch (error) {
    console.error("Shipment tracking failed", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
