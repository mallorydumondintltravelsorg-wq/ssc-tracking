import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const subject =
      String(body.subject || "");

    const message =
      String(body.message || "");

    if (
      !subject ||
      !message
    ) {

      return NextResponse.json({
        error:
          "All fields are required",
      });
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "SupportTicket"
      ("id", "subject", "message", "status", "createdAt")
      VALUES
      (
        gen_random_uuid()::text,
        '${subject}',
        '${message}',
        'Open',
        NOW()
      )
      `
    );

    return NextResponse.json({
      message:
        "Support ticket submitted successfully",
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      error:
        "Failed to create support ticket",
    });
  }
}