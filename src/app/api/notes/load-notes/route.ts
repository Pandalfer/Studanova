import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "Could not find user" }, { status: 400 });
  }

  try {
    const user = await prisma.student.findFirst({
      where: { id: uuid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notesFromDb = await prisma.note.findMany({
      where: { studentId: uuid },
      orderBy: { createdAt: "desc" },
    });

    const notes = notesFromDb.map((note) => ({
      id: note.id.toString(),
      title: note.title,
      content: note.content,
      createdAt: Number(note.createdAt),
    }));

    return NextResponse.json({ notes });
  } catch (error) {
    console.log("Error getting user info: " + error);
    return NextResponse.json({ error: "Failed to find user" }, { status: 500 });
  }
}
