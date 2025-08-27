"use client";

import { Note } from "@/types";
import { useEffect, useState, useRef, use } from "react"; // 👈 import use
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadNotes, saveNoteToDb, deleteNoteFromDb } from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ uuid: string }>; // 👈 now params is a Promise
}

export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
  const { uuid } = use(params); // 👈 unwrap params safely

  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      const loadedNotes = await loadNotes(uuid);
      setNotes(loadedNotes);
    })();
  }, [uuid]);

  const saveNote = async (updatedNote: Note) => {
    try {
      const noteToSave = {
        ...updatedNote,
        title: updatedNote.title.trim() === "" ? "Untitled Note" : updatedNote.title,
      };

      const savedNote = await saveNoteToDb(noteToSave, uuid);
      if (!savedNote) return;

      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? savedNote : note))
      );

      setActiveNote(savedNote);
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const selectNote = async (note: Note) => {
    if (isDirty && activeNote) {
      await saveNote({
        ...activeNote,
        title: title.trim() === "" ? "Untitled Note" : title,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      });
    }

    setActiveNote(note);
    setTitle(note.title);
    if (editorRef.current) editorRef.current.innerHTML = note.content;
    setIsDirty(false);

    router.push(`/${uuid}/notes/${note.id}`); // ✅ redirect works
  };

  const createNewNote = async () => {
    const newNote: Note = {
      id: nanoid(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
    };

    // Save to DB first
    await saveNoteToDb(newNote, uuid);

    // Redirect immediately — no local state needed
    router.push(`/${uuid}/notes/${newNote.id}`);
  };

  const deleteNote = async (id: string) => {
    await deleteNoteFromDb(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        notes={notes}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        onDeleteNote={deleteNote}
        activeNoteId={activeNote?.id}
      />
      <div className="flex-1 h-screen">
        <NotesEmptyState message={"Select or create a new note to get started"} />
      </div>
    </div>
  );
}
