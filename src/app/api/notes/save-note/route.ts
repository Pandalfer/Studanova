import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { id, title, content, studentId, folderId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    let note;

    if (id) {
      const existing = await prisma.note.findUnique({ where: { id } });

      if (existing) {
        note = await prisma.note.update({
          where: { id },
          data: { title, content, folderId: folderId ?? null },
        });
      } else {
        note = await prisma.note.create({
          data: {
            id: id || nanoid(),
            title,
            content,
            studentId,
            folderId: folderId ?? null,
          },
        });
      }
    } else {
      note = await prisma.note.create({
        data: {
          id: nanoid(),
          title,
          content,
          studentId,
          folderId: folderId ?? null,
        },
      });
    }

    return NextResponse.json({
      note: {
        ...note,
      },
    });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { error: "Failed to save-flashcard note" },
      { status: 500 },
    );
  }
}
