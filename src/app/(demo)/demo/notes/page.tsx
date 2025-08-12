"use client";

import { Note } from "@/types";
import NotesSidebar from "@/components/Pages/LoggedIn/Notes/notes-sidebar";
import NotesHeader from "@/components/Pages/LoggedIn/Notes/note-header";
import {useEffect, useState} from "react";
import NoteView from "@/components/Pages/LoggedIn/Notes/note-view";
import NoteEditor from "@/components/Pages/LoggedIn/Notes/note-editor";
import NotesEmptyState from "@/components/Pages/LoggedIn/Notes/empty-state";
import {loadDemoNotes, saveDemoNotes} from "@/lib/note-storage";


export default function DemoNotesPage() {
  const [notes, setNotes] = useState<Note[]>(() => loadDemoNotes());
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setNotes(loadDemoNotes());
  }, []);

  useEffect(() => {
    saveDemoNotes(notes);
  }, [notes]);


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
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: Date.now(),
    };
    setNotes([...notes, newNote]);
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
    if (!activeNote && notes.length === 0) {
      return (
        <NotesEmptyState message={"Create your first note to get started"} />
      );
    }

    if (activeNote && isEditing) {
      return (
        <NoteEditor note={activeNote} onSave={saveNote} onCancel={cancelEdit} />
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
