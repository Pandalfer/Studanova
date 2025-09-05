"use client";

import { Note } from "@/types";
import { useEffect, useRef, useState } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadDemoNotes, saveDemoNotes } from "@/lib/note-storage";
import { v4 as uuidv4 } from "uuid";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { toast } from "sonner";

export default function DemoNotesPage() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => loadDemoNotes());
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setNotes(loadDemoNotes());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveDemoNotes(notes);
  }, [notes, mounted]);

  // Debounced auto-save
  useEffect(() => {
    if (!isDirty || !activeNote) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === activeNote.id
            ? {
                ...note,
                title: title.trim() === "" ? "Untitled Note" : title,
                content: editorRef.current?.innerHTML ?? note.content,
              }
            : note,
        ),
      );
      setIsDirty(false);
    }, 2000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, editorRef.current?.innerHTML, isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && activeNote) {
        setNotes((prevNotes) =>
          prevNotes.map((n) =>
            n.id === activeNote.id
              ? {
                  ...n,
                  title: title.trim() === "" ? "Untitled Note" : title,
                  content: editorRef.current?.innerHTML ?? n.content,
                }
              : n,
          ),
        );
        e.preventDefault();
        e.returnValue = "You have unsaved changes!";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, activeNote, title]);

  if (!mounted) return null;

  const selectNote = (note: Note) => {
    if (isDirty && activeNote) {
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === activeNote.id
            ? {
                ...n,
                title: title.trim() === "" ? "Untitled Note" : title,
                content: editorRef.current?.innerHTML ?? n.content,
              }
            : n,
        ),
      );
    }

    setActiveNote(note);
    // Show blank if stored title is just "Untitled Note"
    setTitle(note.title === "Untitled Note" ? "" : note.title);

    if (editorRef.current) editorRef.current.innerHTML = note.content;
    setIsDirty(false);
  };

  const duplicateNote = (note: Note) => {
    if (isDirty && activeNote) {
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === activeNote.id
            ? {
                ...n,
                title: title.trim() === "" ? "Untitled Note" : title,
                content: editorRef.current?.innerHTML ?? n.content,
              }
            : n,
        ),
      );
    }

    const newNote: Note = {
      id: uuidv4(),
      title: note.title + " (Copy)",
      content: note.content,
      createdAt: Date.now(),
    };

    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setTitle(newNote.title === "Untitled Note" ? "" : newNote.title);
    if (editorRef.current) editorRef.current.innerHTML = newNote.content;
    setIsDirty(false);
  };

  const createNewNote = () => {
    if (isDirty && activeNote) {
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === activeNote.id
            ? {
                ...n,
                title: title.trim() === "" ? "Untitled Note" : title,
                content: editorRef.current?.innerHTML ?? n.content,
              }
            : n,
        ),
      );
    }

    const newNote: Note = {
      id: uuidv4(),
      title: "Untitled Note", // DB / storage fallback
      content: "",
      createdAt: Date.now(),
    };

    if (editorRef.current) editorRef.current.innerHTML = "";
    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setTitle("");
    setIsDirty(false);
  };

  const renameNote = (note: Note, newTitle: string) => {
    const updatedNote: Note = {
      ...note,
      title: newTitle.trim() || "Untitled Note",
    };
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );
    if (activeNote?.id === updatedNote.id) {
      setActiveNote(updatedNote);
      setTitle(updatedNote.title === "Untitled Note" ? "" : updatedNote.title);
    }
    toast.success("Note renamed successfully");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  };

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        onDuplicateNote={duplicateNote}
        setNotes={setNotes}
        notes={notes}
        onRenameNote={renameNote}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        onDeleteNote={deleteNote}
        activeNoteId={activeNote?.id}
      />
      <div className="flex-1 h-screen">
        {activeNote ? (
          <NotesEditor
            note={activeNote}
            title={title}
            setTitle={setTitle}
            editorRef={editorRef}
            onDirtyChange={setIsDirty}
          />
        ) : (
          <NotesEmptyState message="Select or create a note to get started" />
        )}
      </div>
    </div>
  );
}
