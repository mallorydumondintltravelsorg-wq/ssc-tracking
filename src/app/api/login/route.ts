import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const user =
      await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });

    if (!user) {

      return NextResponse.json(
        {
          error:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        body.password,
        user.password
      );

    if (!passwordMatch) {

      return NextResponse.json(
        {
          error:
            "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      message:
        "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}