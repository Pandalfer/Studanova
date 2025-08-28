import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    const existingUser = await prisma.student.findUnique({
      where: { username },
    });

    if (!existingUser) {
      const hashedPassword = await hashPassword(password);
      const user = await prisma.student.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      return NextResponse.json(user);
    } else {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
