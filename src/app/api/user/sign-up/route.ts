import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const client = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    const existingUser = await client.student.findUnique({
      where: {
        username,
      },
    });
    if (!existingUser) {
      const user = await client.student.create({
        data: {
          username,
          email,
          password,
        },
      });
      return NextResponse.json(user);
    } else {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }
  } catch (error) {
    console.log("Error creating user: " + error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
