import {Folder, FolderInput, Note} from "@/types";

const STORAGE_KEY = "notes";
//region Database
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

export async function saveFolderToDb(folder: FolderInput, uuid: string): Promise<Folder> {
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
//region Demo (localStorage)
export function saveDemoNotes(notes: Note[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function loadDemoNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const notes = localStorage.getItem(STORAGE_KEY);

  if (notes) {
    try {
      return JSON.parse(notes);
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
      return [];
    }
  }
  return [];
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function saveDemoFolders(folders: Folder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("folders", JSON.stringify(folders));
}

export function loadDemoFolders(): Folder[] {
  if (typeof window === "undefined") return [];
  const folders = localStorage.getItem("folders");

  if (folders) {
    try {
      return JSON.parse(folders);
    } catch (error) {
      console.error("Failed to parse folders from localStorage", error);
      return [];
    }
  }
  return [];
}
//endregion
