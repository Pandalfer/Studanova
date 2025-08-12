import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "Could not find uuid" }, { status: 400 });
  }

  try {
    const user = await prisma.student.findFirst({
      where: { id: uuid },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.log("Error getting user info: " + error);
    return NextResponse.json({ error: "Failed to find user" }, { status: 500 });
  }
}
