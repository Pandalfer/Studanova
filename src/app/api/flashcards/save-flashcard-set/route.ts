import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id, studentId, title, description } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    let flashcardSet;

    if (id) {
      flashcardSet = await prisma.flashcardSet.upsert({
        where: { id: id },
        update: { title, description },
        create: {
          studentId,
          title,
          description,
        },
      });
    } else {
      flashcardSet = await prisma.flashcardSet.create({
        data: {
          studentId,
          title,
          description,
        },
      });
    }
    return NextResponse.json({ flashcardSet });
  } catch (error) {
    console.error("Error saving flashcard set:", error);
    return NextResponse.json(
      { error: "Failed to save flashcard set" },
      { status: 500 },
    );
  }
}
