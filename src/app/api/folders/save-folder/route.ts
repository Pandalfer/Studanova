import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id, title, studentId, parentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    let folder;

    if (id) {
      const existing = await prisma.folder.findUnique({ where: { id } });

      if (existing) {
        folder = await prisma.folder.update({
          where: { id },
          data: { title, parentId: parentId ?? null },
        });
      } else {
        folder = await prisma.folder.create({
          data: {
            title,
            studentId,
          },
        });
      }
    } else {
      folder = await prisma.folder.create({
        data: {
          title,
          studentId,
        },
      });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error saving folder:", error);
    return NextResponse.json(
      { error: "Failed to save folder" },
      { status: 500 },
    );
  }
}
