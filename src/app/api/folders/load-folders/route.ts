import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Shape of a note sent back to the frontend
type NoteDTO = {
  id: string;
  title: string;
  content: string;
  folderId?: string;
};

// Shape of a flashcards sent back to the frontend
type FolderDTO = {
  id: string;
  title: string;
  notes: NoteDTO[];
  folders: FolderDTO[];
  parentId?: string;
};

export async function POST(req: NextRequest) {
  const { uuid } = await req.json();

  if (!uuid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await prisma.student.findUnique({ where: { id: uuid } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rows = await prisma.folder.findMany({
      where: { studentId: uuid },
      include: { notes: true },
      orderBy: { title: "asc" },
    });

    // Map to hold each flashcards object by its id
    const byId = new Map<string, FolderDTO>();
    const roots: FolderDTO[] = []; // top-level folders (with no parent)

    // Convert each flashcards record into a FolderDTO
    for (const f of rows) {
      byId.set(f.id, {
        id: f.id,
        title: f.title,
        notes: f.notes.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          folderId: n.folderId || undefined,
          lastEdited: n.lastEdited,
        })),
        folders: [],
        parentId: f.parentId || undefined,
      });
    }

    // Tree structure
    for (const f of rows) {
      const node = byId.get(f.id)!;
      if (f.parentId) {
        const parent = byId.get(f.parentId);
        if (parent) {
          parent.folders.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    const sortTree = (nodes: FolderDTO[]) => {
      nodes.sort((a, b) => a.title.localeCompare(b.title));
      for (const n of nodes) sortTree(n.folders);
    };
    const sortNotes = (nodes: FolderDTO[]) => {
      for (const n of nodes) {
        n.notes.sort((a, b) => a.title.localeCompare(b.title));
        sortNotes(n.folders);
      }
    };
    sortTree(roots);
    sortNotes(roots);

    return NextResponse.json({ folders: roots });
  } catch (e) {
    console.error("Failed to load folders", e);
    return NextResponse.json(
      { error: "Failed to load folders" },
      { status: 500 },
    );
  }
}
