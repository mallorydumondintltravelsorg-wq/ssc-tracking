import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trackingNumber = String(body.trackingNumber || "").trim();
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    const status = String(body.status || "").trim();

    if (!trackingNumber || !origin || !destination || !status) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: {
        trackingNumber,
      },
      select: {
        id: true,
      },
    });

    const shipment = await prisma.shipment.upsert({
      where: {
        trackingNumber,
      },
      update: {
        origin,
        destination,
        status,
        currentLocation: origin,
      },
      create: {
        trackingNumber,
        origin,
        destination,
        status,
        currentLocation: origin,
      },
    });

    return NextResponse.json({
      message: existingShipment
        ? "Shipment updated successfully"
        : "Shipment created successfully",
      shipment,
    });
  } catch (error) {
    console.error("Shipment create/update failed", error);

    return NextResponse.json(
      {
        error: "Shipment failed to create",
      },
      {
        status: 500,
      }
    );
  }
}
