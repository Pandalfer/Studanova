"use client";

import { Note } from "@/types";
import NotesSidebar from "@/components/Pages/LoggedIn/Notes/notes-sidebar";
import NotesHeader from "@/components/Pages/LoggedIn/Notes/note-header";
import React, {useEffect, useState} from "react";
import NoteView from "@/components/Pages/LoggedIn/Notes/note-view";
import NoteEditor from "@/components/Pages/LoggedIn/Notes/note-editor";
import NotesEmptyState from "@/components/Pages/LoggedIn/Notes/empty-state";
import {loadNotes, saveNoteToDb, deleteNoteFromDb} from "@/lib/note-storage";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    (async () => {
      const { uuid } = await params;

      // Clear demo notes for logged-in users
      if (uuid) {
        localStorage.removeItem("notes");
      }

      const loadedNotes = await loadNotes(uuid);
      setNotes(loadedNotes);
    })();
  }, [params]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);


  const selectNote = (note: Note) => {
    setActiveNote(note);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveNote = async (updatedNote: Note) => {
    const { uuid } = await params;
    try {
      const savedNote = await saveNoteToDb(updatedNote, uuid);

      if (!savedNote) {
        throw new Error("Saved note is invalid");
      }

      setNotes(prev =>
        prev.map(note => (note.id === updatedNote.id ? savedNote : note))
      );

      setIsEditing(false);
      setActiveNote(savedNote);
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: `temp-${Date.now()}-${Math.random()}`, // temp id
      title: "New Note",
      content: "",
      createdAt: Date.now(),
    };
    setNotes([...notes, newNote]);
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const onDeleteNote = async (id: string) => {
    try {
      await deleteNoteFromDb(id); // delete from backend
      setNotes((prev) => prev.filter((note) => note.id !== id)); // update UI

      if (activeNote && activeNote.id === id) {
        setActiveNote(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      // Optionally: show user-friendly error here
    }
  };

  const renderNoteContent = () => {
    if (!activeNote && notes.length === 0) {
      return (
        <NotesEmptyState message={"Create your first note to get started"} />
      );
    }

    if (activeNote && isEditing) {
      return (
        <NoteEditor
          note={activeNote}
          onSave={saveNote}
          onCancel={cancelEdit}
          onDirtyChange={setIsDirty}  // <== Pass it here
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
