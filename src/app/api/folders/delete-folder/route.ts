import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing folder id" }, { status: 400 });
    }

    // Step 1: Collect all descendant folder IDs
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

    // Step 2: Delete all notes belonging to those folders
    await prisma.note.deleteMany({
      where: { folderId: { in: allFolderIds } },
    });

    // Step 3: Delete the folders themselves
    await prisma.folder.deleteMany({
      where: { id: { in: allFolderIds } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder and contents:", error);
    return NextResponse.json(
      { error: "Failed to delete folder and its contents" },
      { status: 500 },
    );
  }
}
