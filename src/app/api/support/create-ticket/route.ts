import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {

  try {

    const {
      subject,
      message,
    } = await req.json();

    if (
      !subject ||
      !message
    ) {

      return NextResponse.json({
        error:
          "All fields are required",
      });
    }

    await prisma.supportTicket.create({
      data: {
        subject,
        message,
      },
    });

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