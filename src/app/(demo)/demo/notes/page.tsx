"use client";

import { Note } from "@/types";
import { useEffect, useRef, useState } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadDemoNotes, saveDemoNotes } from "@/lib/note-storage";
import { v4 as uuidv4 } from "uuid";
import { NotesSidebar2 } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";

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
            : note
        )
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
              : n
          )
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
            : n
        )
      );
    }

    setActiveNote(note);
    setTitle(note.title.trim() === "" ? "Untitled Note" : note.title);
    if (editorRef.current) editorRef.current.innerHTML = note.content;
    setIsDirty(false);
  };

  const createNewNote = () => {
    if (isDirty && activeNote) {
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === activeNote.id
            ? {
              ...n,
              title,
              content: editorRef.current?.innerHTML ?? n.content,
            }
            : n
        )
      );
    }

    const newNote: Note = {
      id: uuidv4(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
    };
    if (editorRef.current) editorRef.current.innerHTML = "";
    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setTitle(newNote.title);
    setIsDirty(false);
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
      <NotesSidebar2
        notes={notes}
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
