import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const client = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    const user = await client.student.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error signing in user: ", error);
    return NextResponse.json(
      { error: "Failed to sign in user" },
      { status: 500 },
    );
  }
}
