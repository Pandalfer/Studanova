import { Note} from "@/types";

const STORAGE_KEY = "notes";

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

export function saveDemoNotes(notes: Note[]): void {
  if(typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function loadDemoNotes(): Note[] {
  if(typeof window === "undefined") return [];
  const notes = localStorage.getItem(STORAGE_KEY);

  if(notes) {
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
