import { ImportFolder } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";

async function insertFolderTree(
  tx: Prisma.TransactionClient,
  folders: ImportFolder[],
  studentId: string,
  parentId?: string,
) {
  for (const folder of folders) {
    const createdFolder = await tx.folder.create({
      data: {
        title: folder.title,
        parentId: parentId ?? null,
        studentId,
      },
    });

    if (folder.notes.length > 0) {
      await tx.note.createMany({
        data: folder.notes.map((note) => ({
          id: uuidv4(),
          title: note.title,
          content: note.content,
          lastEdited: note.lastEdited ? new Date(note.lastEdited) : undefined,
          folderId: createdFolder.id,
          studentId,
        })),
      });
    }

    if (folder.folders.length > 0) {
      await insertFolderTree(tx, folder.folders, studentId, createdFolder.id);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, tree, rootFolderName } = await req.json();

    if (!studentId || !Array.isArray(tree)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      let rootId: string | undefined;

      if (rootFolderName) {
        const root = await tx.folder.create({
          data: {
            title: rootFolderName,
            studentId,
            parentId: null,
          },
        });
        rootId = root.id;
      }

      await insertFolderTree(tx, tree, studentId, rootId);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to import Obsidian vault" },
      { status: 500 },
    );
  }
}
