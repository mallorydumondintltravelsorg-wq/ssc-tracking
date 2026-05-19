import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Find first user in database
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { error: "No user found in database" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: body.trackingNumber,
        senderName: body.senderName,
        receiverName: body.receiverName,
        origin: body.origin,
        destination: body.destination,
        status: body.status,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Shipment created successfully",
      shipment,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 500 }
    );
  }
}