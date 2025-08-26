"use client";

import { Note } from "@/types";
import { useEffect, useState, useRef } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import { loadNotes, saveNoteToDb, deleteNoteFromDb } from "@/lib/note-storage";
import { NotesSidebar2 } from "@/components/Notes/Sidebar/notes-sidebar";
import NoteEditor from "@/components/Notes/note-editor";
import NoteView from "@/components/Notes/note-view";
import NotesEditor from "@/components/Notes/notes-editor";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Mounted check to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load notes on mount
  useEffect(() => {
    (async () => {
      const { uuid } = await params;
      if (uuid) localStorage.removeItem("notes"); // keep this if you want demo cleanup
      const loadedNotes = await loadNotes(uuid);
      setNotes(loadedNotes);
    })();
  }, [params]);

  // Debounced auto-save
  useEffect(() => {
    if (!isDirty || !activeNote) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!activeNote) return;

      // prepare note for DB save
      const noteToSave: Note = {
        ...activeNote,
        title: title.trim() === "" ? "Untitled Note" : title,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      };

      await saveNote(noteToSave); // your existing saveNote function handles DB
      setIsDirty(false);
    }, 2000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, editorRef.current?.innerHTML, isDirty, activeNote]);

  // Before unload: persist unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && activeNote) {
        saveNote({
          ...activeNote,
          title: title.trim() === "" ? "Untitled Note" : title,
          content: editorRef.current?.innerHTML ?? activeNote.content,
        });
        e.preventDefault();
        e.returnValue = "You have unsaved changes!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, activeNote, title]);

  const saveNote = async (updatedNote: Note) => {
    const { uuid } = await params;
    try {
      // clone note but only force title for DB
      const noteToSave = {
        ...updatedNote,
        title: updatedNote.title.trim() === "" ? "Untitled Note" : updatedNote.title,
      };

      const savedNote = await saveNoteToDb(noteToSave, uuid);
      if (!savedNote) return;

      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? savedNote : note)),
      );

      setActiveNote(savedNote);
      // ⚠️ Don't overwrite title state! Keep it as user typed:
      // setTitle(savedNote.title);  <-- REMOVE THIS line
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
        title: title.trim() === "" ? "Untitled Note" : title,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      });
    }

    setActiveNote(note);
    setTitle(note.title); // keep blank if blank
    if (editorRef.current) editorRef.current.innerHTML = note.content;
    setIsEditing(false);
    setIsDirty(false);
  };

  const createNewNote = async () => {
    if (isDirty && activeNote) {
      await saveNote({
        ...activeNote,
        title: title.trim() === "" ? "Untitled Note" : title,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      });
    }

    const newNote: Note = {
      id: `temp-${Date.now()}-${Math.random()}`,
      title: "Untitled Note", // start blank like demo
      content: "",
      createdAt: Date.now(),
    };
    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setTitle(newNote.title);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setIsEditing(true);
    setIsDirty(false);
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

  const cancelEdit = () => setIsEditing(false);

  const renderNoteContent = () => {
    if (!activeNote && notes.length === 0) {
      return <NotesEmptyState message="Create your first note to get started" />;
    }

    if (activeNote && isEditing) {
      return (
        <NoteEditor
          note={activeNote}
          onSave={saveNote}
          onCancel={cancelEdit}
          onDirtyChange={setIsDirty}
          editorRef={editorRef}
        />
      );
    }

    if (activeNote) {
      return <NoteView note={activeNote} onEdit={() => setIsEditing(true)} />;
    }
  };


  if (!mounted) return null;

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
          <NotesEmptyState message="Select or create a note to get started"/>
        )}
      </div>
    </div>
  );
}
