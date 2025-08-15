"use client";

import { Note } from "@/types";
import NotesSidebar from "@/components/Notes/notes-sidebar";
import NotesHeader from "@/components/Notes/note-header";
import { useEffect, useState } from "react";
import NoteView from "@/components/Notes/note-view";
import NoteEditor from "@/components/Notes/note-editor";
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadDemoNotes, saveDemoNotes } from "@/lib/note-storage";
import { v4 as uuidv4 } from "uuid";

export default function DemoNotesPage() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => loadDemoNotes());
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNotes(loadDemoNotes());
    setMounted(true); // wait for client
  }, []);

  useEffect(() => {
    if (mounted) saveDemoNotes(notes);
  }, [notes, mounted]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        return "You have unsaved changes!";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!mounted) {
    // Render nothing or a loading state on server
    return null;
  }

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveNote = (updatedNote: Note) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
    );
    setIsEditing(false);
    setActiveNote(updatedNote);
    setIsDirty(false);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: uuidv4(), // unique, not time-based
      title: "New Note",
      content: "",
      createdAt: Date.now(), // optional: timestamp only on client after mount
    };
    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const onDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (activeNote && activeNote.id === id) {
      setActiveNote(null);
      setIsEditing(false);
    }
  };

  const renderNoteContent = () => {
    if (!activeNote) {
      return notes.length === 0 ? (
        <NotesEmptyState message="Create your first note to get started" />
      ) : null;
    }

    if (activeNote && isEditing) {
      return (
        <NoteEditor
          note={activeNote}
          onSave={saveNote}
          onCancel={cancelEdit}
          onDirtyChange={setIsDirty}
        />
      );
    }

    if (activeNote) {
      return <NoteView note={activeNote} onEdit={() => setIsEditing(true)} />;
    }
  };

  return (
    <div className={"flex flex-col min-h-screen"}>
      <NotesHeader onNewNote={createNewNote} />
      <main
        className={
          "container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1"
        }
      >
        <div className={"md:col-span-1"}>
          <NotesSidebar
            notes={notes}
            onSelectNote={selectNote}
            createNewNote={createNewNote}
            onDeleteNote={onDeleteNote}
            activeNoteId={activeNote?.id}
          />
        </div>
        <div className={"md:col-span-2"}>{renderNoteContent()}</div>
      </main>
    </div>
  );
}
