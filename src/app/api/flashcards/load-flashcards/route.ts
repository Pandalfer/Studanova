import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { setId, uuid } = await req.json();

    if (!uuid) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    const user = await prisma.student.findFirst({
      where: { id: uuid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const flashcardSet = await prisma.flashcardSet.findFirst({
      where: {
        id: setId,
        studentId: uuid,
      },
      include: {
        flashcards: true,
      },
    });

    return NextResponse.json({ flashcardSet });
  } catch (error) {
    console.error("Error loading flashcards:", error);
    return NextResponse.json(
      { error: "Failed to load flashcards" },
      { status: 500 },
    );
  }
}
