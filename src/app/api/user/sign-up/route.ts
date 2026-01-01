import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { Folder } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

async function createFolders(
  tx: Prisma.TransactionClient,
  folders: Folder[],
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

    for (const note of folder.notes) {
      await tx.note.create({
        data: {
          id: uuidv4(),
          title: note.title,
          content: note.content,
          lastEdited: note.lastEdited ? new Date(note.lastEdited) : undefined,
          folderId: createdFolder.id,
          studentId,
        },
      });
    }

    if (folder.folders.length > 0) {
      await createFolders(tx, folder.folders, studentId, createdFolder.id);
    }
  }
}

export async function POST(req: NextRequest) {
  const { username, email, password, notes, folders } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    const existingUser = await prisma.student.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    let createdUserId: string | null = null;

    await prisma.$transaction(async (tx) => {
      const user = await tx.student.create({
        data: { username, email, password: hashedPassword },
      });

      createdUserId = user.id;

      if (folders?.length) {
        await createFolders(tx, folders, user.id);
      }

      if (notes?.length) {
        for (const note of notes) {
          await tx.note.create({
            data: {
              id: uuidv4(),
              title: note.title,
              content: note.content,
              lastEdited: note.lastEdited
                ? new Date(note.lastEdited)
                : undefined,
              folderId: null,
              studentId: user.id,
            },
          });
        }
      }
    });

    if (!createdUserId) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 },
      );
    }

    const userFolders = await prisma.folder.findMany({
      where: { studentId: createdUserId },
      include: { notes: true, folders: true },
    });

    return NextResponse.json({
      success: true,
      studentId: createdUserId,
      folders: userFolders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
