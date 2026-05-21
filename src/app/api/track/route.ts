import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const trackingNumber = String(body.trackingNumber || "").trim();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number required" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        trackingNumber,
        ...(session.user.role === "admin"
          ? {}
          : {
              userId: session.user.id,
            }),
      },
      include: {
        stages: {
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found for this account" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...shipment,
      events: shipment.stages,
    });
  } catch (error) {
    console.error("Shipment tracking failed", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
