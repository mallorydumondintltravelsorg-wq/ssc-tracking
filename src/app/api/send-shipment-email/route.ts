import { NextResponse } from "next/server";

import {
  sendShipmentEmail,
} from "@/lib/mailer";

export async function POST(
  req: Request
) {

  try {

    const {
      email,
      trackingNumber,
      status,
    } = await req.json();

    if (
      !email ||
      !trackingNumber ||
      !status
    ) {

      return NextResponse.json({
        error:
          "Missing fields",
      });
    }

    await sendShipmentEmail(
      email,
      trackingNumber,
      status
    );

    return NextResponse.json({
      message:
        "Shipment email sent successfully",
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      error:
        "Failed to send shipment email",
    });
  }
}