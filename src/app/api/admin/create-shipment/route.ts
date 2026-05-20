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

    /* CHECK EXISTING */

    const existingShipment =
      await prisma.shipment.findFirst({
        where: {
          trackingNumber,
        },
      });

    /* UPDATE */

    if (existingShipment) {

      const updatedShipment =
        await prisma.$queryRawUnsafe(
          `
          UPDATE "Shipment"
          SET
            origin='${origin}',
            destination='${destination}',
            status='${status}'
          WHERE id='${existingShipment.id}'
          RETURNING *;
          `
        );

      return NextResponse.json({
        message:
          "Shipment updated successfully",
        shipment:
          updatedShipment,
      });
    }

    /* CREATE */

    const shipment =
      await prisma.$queryRawUnsafe(
        `
        INSERT INTO "Shipment"
        (
          id,
          "trackingNumber",
          origin,
          destination,
          status,
          "createdAt"
        )
        VALUES
        (
          gen_random_uuid()::text,
          '${trackingNumber}',
          '${origin}',
          '${destination}',
          '${status}',
          NOW()
        )
        RETURNING *;
        `
      );

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