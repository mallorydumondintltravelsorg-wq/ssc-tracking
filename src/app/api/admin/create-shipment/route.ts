import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const trackingNumber =
      String(
        body.trackingNumber || ""
      );

    const origin =
      String(
        body.origin || ""
      );

    const destination =
      String(
        body.destination || ""
      );

    const status =
      String(
        body.status || ""
      );

    if (
      !trackingNumber ||
      !origin ||
      !destination ||
      !status
    ) {

      return NextResponse.json({
        error:
          "All fields are required",
      });
    }

    const existingShipment =
      await prisma.shipment.findFirst({
        where: {
          trackingNumber,
        },
      });

    /* UPDATE */

    if (existingShipment) {

      const updatedShipment =
        await prisma.shipment.update({
          where: {
            id:
              existingShipment.id,
          },
          data: {
            origin,
            destination,
            status,
          } as any,
        });

      return NextResponse.json({
        message:
          "Shipment updated successfully",
        shipment:
          updatedShipment,
      });
    }

    /* CREATE */

    const shipment =
      await prisma.shipment.create({
        data: {
          trackingNumber,
          origin,
          destination,
          status,
        } as any,
      });

    return NextResponse.json({
      message:
        "Shipment created successfully",
      shipment,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      error:
        "Shipment failed to create",
    });
  }
}