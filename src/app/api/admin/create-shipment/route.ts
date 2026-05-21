import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { createNotification, notifyAdmins } from "@/lib/notifications";
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
    const origin = String(body.origin || "").trim();
    const destination = String(body.destination || "").trim();
    const status = String(body.status || "").trim();
    const customerEmail = String(body.customerEmail || "").trim().toLowerCase();

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

    const customer = customerEmail
      ? await prisma.user.findUnique({
          where: {
            email: customerEmail,
          },
          select: {
            id: true,
            email: true,
          },
        })
      : null;

    if (customerEmail && !customer) {
      return NextResponse.json(
        {
          error: "Customer account not found for that email",
        },
        {
          status: 404,
        }
      );
    }

    const shipment = await prisma.shipment.upsert({
      where: {
        trackingNumber,
      },
      update: {
        origin,
        destination,
        status,
        currentLocation: origin,
        userId: customer?.id || null,
      },
      create: {
        trackingNumber,
        origin,
        destination,
        status,
        currentLocation: origin,
        userId: customer?.id || null,
      },
    });

    await prisma.shipmentStage.upsert({
      where: {
        id: `${shipment.id}:${getShipmentStageSequence(status)}`,
      },
      update: {
        stage: status,
        sequence: getShipmentStageSequence(status),
        location: origin,
      },
      create: {
        id: `${shipment.id}:${getShipmentStageSequence(status)}`,
        shipmentId: shipment.id,
        stage: status,
        sequence: getShipmentStageSequence(status),
        location: origin,
        notes: existingShipment
          ? "Shipment updated by admin"
          : "Shipment created by admin",
      },
    });

    if (customer) {
      await createNotification({
        userId: customer.id,
        type: "shipment.created",
        title: existingShipment ? "Shipment updated" : "Shipment created",
        message: `Shipment ${trackingNumber} is now ${status}`,
        href: "/dashboard",
      });
    }

    await notifyAdmins({
      type: existingShipment ? "admin.shipment_updated" : "admin.shipment_created",
      title: existingShipment ? "Shipment updated" : "Shipment created",
      message: `${trackingNumber} was ${existingShipment ? "updated" : "created"} by ${session.user.email || "an admin"}`,
      href: "/admin#shipments",
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
