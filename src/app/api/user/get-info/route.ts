import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const client = new PrismaClient();

export async function POST(req: NextRequest) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "Could not find uuid" }, { status: 400 });
  }

  try {
    const user = await client.student.findFirst({
      where: { id: uuid },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.log("Error getting user info: " + error);
    return NextResponse.json({ error: "Failed to find user" }, { status: 500 });
  }
}
