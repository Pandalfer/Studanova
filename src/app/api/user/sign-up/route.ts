import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { Folder, Note } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

async function createFolders(
  folders: Folder[],
  studentId: string,
  parentId?: string
) {
  for (const folder of folders) {
    const createdFolder = await prisma.folder.create({
      data: {
        title: folder.title,
        parentId: parentId || null,
        studentId,
      },
    });

    for (const note of folder.notes) {
      await prisma.note.create({
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
      await createFolders(folder.folders, studentId, createdFolder.id);
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
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.student.create({
      data: { username, email, password: hashedPassword },
    });

    if (folders && folders.length > 0) {
      await createFolders(folders, user.id);
    }

    if (notes && notes.length > 0) {
      for (const note of notes) {
        await prisma.note.create({
          data: {
            id: uuidv4(),
            title: note.title,
            content: note.content,
            lastEdited: note.lastEdited ? new Date(note.lastEdited) : undefined,
            folderId: null,
            studentId: user.id,
          },
        });
      }
    }

    const userFolders = await prisma.folder.findMany({
      where: { studentId: user.id },
      include: { notes: true, folders: true },
    });

    return NextResponse.json({ ...user, Folder: userFolders });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
