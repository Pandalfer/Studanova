import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing flashcards id" },
        { status: 400 },
      );
    }

    const collectFolderIds = async (folderId: string): Promise<string[]> => {
      const childFolders = await prisma.folder.findMany({
        where: { parentId: folderId },
        select: { id: true },
      });

      const ids = [folderId];
      for (const child of childFolders) {
        const nestedIds = await collectFolderIds(child.id);
        ids.push(...nestedIds);
      }
      return ids;
    };

    const allFolderIds = await collectFolderIds(id);

    await prisma.note.deleteMany({
      where: { folderId: { in: allFolderIds } },
    });

    await prisma.folder.deleteMany({
      where: { id: { in: allFolderIds } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flashcards and contents:", error);
    return NextResponse.json(
      { error: "Failed to delete flashcards and its contents" },
      { status: 500 },
    );
  }
}
