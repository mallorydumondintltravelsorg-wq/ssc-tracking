import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const shipment =
      await prisma.shipment.findUnique({
        where: {
          trackingNumber:
            body.trackingNumber,
        },
      });

    if (!shipment) {

      return NextResponse.json(
        {
          error:
            "Shipment not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.trackingEvent.create({
      data: {
        location:
          body.location,

        description:
          body.description,

        shipmentId:
          shipment.id,
      },
    });

    await prisma.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        status:
          body.status,

        currentLocation:
          body.location,
      },
    });

    return NextResponse.json({
      message:
        "Tracking event added successfully",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to add tracking event",
      },
      {
        status: 500,
      }
    );
  }
}