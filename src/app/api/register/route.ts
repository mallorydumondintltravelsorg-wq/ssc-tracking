import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });

    if (existingUser) {

      return NextResponse.json(
        {
          error:
            "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        body.password,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password:
            hashedPassword,
        },
      });

    return NextResponse.json({
      message:
        "User created successfully",
      user,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Registration failed",
      },
      {
        status: 500,
      }
    );
  }
}