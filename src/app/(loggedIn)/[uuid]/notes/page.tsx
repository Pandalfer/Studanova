"use client";

import { Note } from "@/types";
import NotesSidebar from "@/components/Notes/notes-sidebar";
import NotesHeader from "@/components/Notes/note-header";
import React, { useEffect, useState, useRef } from "react";
import NoteView from "@/components/Notes/note-view";
import NoteEditor from "@/components/Notes/note-editor";
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadNotes, saveNoteToDb, deleteNoteFromDb } from "@/lib/note-storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { uuid } = await params;
      if (uuid) localStorage.removeItem("notes");
      const loadedNotes = await loadNotes(uuid);
      setNotes(loadedNotes);
    })();
  }, [params]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const saveNote = async (updatedNote: Note) => {
    const { uuid } = await params;
    try {
      const savedNote = await saveNoteToDb(updatedNote, uuid);
      if (!savedNote) return;
      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? savedNote : note)),
      );
      setActiveNote(savedNote);
      setIsEditing(false);
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const selectNote = async (note: Note) => {
    if (isDirty && activeNote) {
      await saveNote({
        ...activeNote,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      });
    }
    setActiveNote(note);
    setIsEditing(false);
    setIsDirty(false);
  };

  const createNewNote = async () => {
    if (isDirty && activeNote) {
      await saveNote({
        ...activeNote,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      });
    }
    const newNote: Note = {
      id: `temp-${Date.now()}-${Math.random()}`,
      title: "New Note",
      content: "",
      createdAt: Date.now(),
    };
    if (editorRef.current) editorRef.current.innerHTML = "";
    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setIsEditing(true);
    setIsDirty(false);
  };

  const cancelEdit = () => setIsEditing(false);

  // Open delete confirmation popup
  const onDeletePopup = (id: string) => {
    setDeleteNoteId(id);
    setShowDeletePopup(true);
  };

  // Actually delete the note
  const onConfirmDelete = async () => {
    if (!deleteNoteId) return;
    try {
      await deleteNoteFromDb(deleteNoteId);
      setNotes((prev) => prev.filter((note) => note.id !== deleteNoteId));
      if (activeNote?.id === deleteNoteId) {
        setActiveNote(null);
        setIsEditing(false);
        setIsDirty(false);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setShowDeletePopup(false);
      setDeleteNoteId(null);
    }
  };

  const renderNoteContent = () => {
    if (!activeNote && notes.length === 0)
      return (
        <NotesEmptyState message="Create your first note to get started" />
      );

    if (activeNote && isEditing)
      return (
        <NoteEditor
          note={activeNote}
          onSave={saveNote}
          onCancel={cancelEdit}
          onDirtyChange={setIsDirty}
          editorRef={editorRef}
        />
      );

    if (activeNote)
      return <NoteView note={activeNote} onEdit={() => setIsEditing(true)} />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NotesHeader onNewNote={createNewNote} />
      <AlertDialog open={showDeletePopup} onOpenChange={setShowDeletePopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your note will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-1">
          <NotesSidebar
            notes={notes}
            onSelectNote={selectNote}
            createNewNote={createNewNote}
            onDeletePopup={onDeletePopup}
            activeNoteId={activeNote?.id}
          />
        </div>
        <div className="md:col-span-2">{renderNoteContent()}</div>
      </main>
    </div>
  );
}
