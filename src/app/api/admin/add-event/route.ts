import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { notifyAdmins, notifyShipmentOwner } from "@/lib/notifications";
import { getShipmentStageSequence } from "@/lib/shipments";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Admin access required",
        },
        {
          status: 403,
        }
      );
    }

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
      select: {
        id: true,
        trackingNumber: true,
        userId: true,
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

    const sequence = getShipmentStageSequence(status);

    await prisma.shipmentStage.upsert({
      where: {
        id: `${shipment.id}:${sequence}`,
      },
      update: {
        stage: status,
        sequence,
        location,
        notes: String(body.notes || "").trim() || null,
        achievedAt: body.achievedAt ? new Date(body.achievedAt) : new Date(),
      },
      create: {
        id: `${shipment.id}:${sequence}`,
        shipmentId: shipment.id,
        stage: status,
        sequence,
        location,
        notes: String(body.notes || "").trim() || null,
        achievedAt: body.achievedAt ? new Date(body.achievedAt) : new Date(),
      },
    });

    await notifyShipmentOwner(
      {
        userId: shipment.userId,
        trackingNumber: shipment.trackingNumber,
        status,
      },
      `Shipment ${shipment.trackingNumber} moved to ${status} at ${location}`
    );

    await notifyAdmins({
      type: "admin.shipment_stage",
      title: "Shipment stage updated",
      message: `${shipment.trackingNumber} moved to ${status}`,
      href: "/admin#stages",
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
