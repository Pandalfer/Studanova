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
// Each flashcards can contain notes and nested folders
type FolderDTO = {
  id: string;
  title: string;
  notes: NoteDTO[];
  folders: FolderDTO[];
  parentId?: string;
};

// API route handler for POST requests
export async function POST(req: NextRequest) {
  // Get user ID (uuid) from the request body
  const { uuid } = await req.json();

  // If no uuid was provided, return an error
  if (!uuid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Check that the student exists in the database
    const user = await prisma.student.findUnique({ where: { id: uuid } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all folders for this student
    // Include any notes inside them
    const rows = await prisma.folder.findMany({
      where: { studentId: uuid },
      include: { notes: true },
      orderBy: { title: "asc" }, // sort folders alphabetically
    });

    // Map to hold each flashcards object by its id
    // Makes it easy to look up parent/child relationships
    const byId = new Map<string, FolderDTO>();
    const roots: FolderDTO[] = []; // top-level folders (with no parent)

    // First pass: convert each flashcards record into a FolderDTO
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
        folders: [], // children will be filled later
        parentId: f.parentId || undefined,
      });
    }

    // Second pass: link folders into a tree structure
    for (const f of rows) {
      const node = byId.get(f.id)!;
      if (f.parentId) {
        // If this flashcards has a parent, attach it under that parent
        const parent = byId.get(f.parentId);
        if (parent) {
          parent.folders.push(node);
        } else {
          // If the parent is missing, treat it as a root flashcards
          roots.push(node);
        }
      } else {
        // No parentId means this is a root flashcards
        roots.push(node);
      }
    }

    // Recursively sort all folders alphabetically by title
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

    // Return the full flashcards tree as JSON
    return NextResponse.json({ folders: roots });
  } catch (e) {
    console.error("Failed to load folders", e);
    // Something went wrong with the database query or server
    return NextResponse.json(
      { error: "Failed to load folders" },
      { status: 500 },
    );
  }
}
