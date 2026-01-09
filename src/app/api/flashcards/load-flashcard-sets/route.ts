import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { uuid } = await req.json();
    const user = await prisma.student.findFirst({
      where: { id: uuid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const flashcardSetsFromDb = await prisma.flashcardSet.findMany({
      where: { studentId: uuid },
      orderBy: [{ title: "asc" }],
      include: {
        flashcards: true,
      },
    });

    const flashcardSets = flashcardSetsFromDb.map((flashcardset) => ({
      id: flashcardset.id.toString(),
      title: flashcardset.title,
      description: flashcardset.description ?? "",
      flashcards: flashcardset.flashcards,
    }));

    return NextResponse.json({ flashcardSets });
  } catch (error) {
    console.error("Error loading flashcards:", error);
    return NextResponse.json(
      { error: "Failed to load flashcards" },
      { status: 500 },
    );
  }
}
