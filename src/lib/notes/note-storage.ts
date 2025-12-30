import { Folder, FolderInput, Note } from "@/lib/types";

const NOTES_KEY = "demo_notes";
const FOLDERS_KEY = "demo_folders";
//region Database ( Logged-In users )
//region loading
export async function loadNotes(uuid: string): Promise<Note[]> {
  const response = await fetch("/api/notes/load-notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid }),
  });

  if (!response.ok) {
    throw new Error("Failed to load notes");
  }

  const data = await response.json();
  return data.notes as Note[];
}

export async function loadFolders(uuid: string): Promise<Folder[]> {
  const response = await fetch("/api/folders/load-folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid }),
  });

  if (!response.ok) {
    throw new Error("Failed to load folders");
  }

  const data = await response.json();
  return data.folders as Folder[];
}

//endregion
//region saving

export async function saveNoteToDb(note: Note, uuid: string): Promise<Note> {
  const response = await fetch("/api/notes/save-note", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...note, studentId: uuid }),
  });

  const data = await response.json();
  return data.note as Note;
}

export async function saveFolderToDb(
  folder: FolderInput,
  uuid: string,
): Promise<Folder> {
  const response = await fetch("/api/folders/save-folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...folder, studentId: uuid }),
  });

  const data = await response.json();
  return data.folder as Folder;
}
//endregion
//region deleting
export async function deleteNoteFromDb(id: string): Promise<void> {
  const res = await fetch("/api/notes/delete-note", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete note");
  }
}

export async function deleteFolderFromDb(id: string): Promise<void> {
  const res = await fetch("/api/folders/delete-folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    throw new Error("Failed to delete folder");
  }
}

//endregion
//endregion
//region Demo (localStorage)
export function saveDemoNotes(notes: Note[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function loadDemoNotes(): Note[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]");
}

export function formatRelativeDate(timestamp: number | string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function saveDemoFolders(folders: Folder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function loadDemoFolders(): Folder[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(FOLDERS_KEY) ?? "[]");
}
//endregion
