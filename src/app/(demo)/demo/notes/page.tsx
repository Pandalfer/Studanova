"use client";

import { Folder, Note } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import {
  loadDemoFolders,
  loadDemoNotes,
  saveDemoFolders,
  saveDemoNotes, saveNoteToDb,
} from "@/lib/note-storage";
import { v4 as uuidv4 } from "uuid";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { toast } from "sonner";

function collectAllNotes(folders: Folder[]): Note[] {
  const result: Note[] = [];
  for (const folder of folders) {
    result.push(...folder.notes);
    if (folder.folders && folder.folders.length > 0) {
      result.push(...collectAllNotes(folder.folders));
    }
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}

export default function DemoNotesPage() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  function updateNote(updatedNote: Note) {
    // Update root notes
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );

    // Update folder notes
    setFolders((prevFolders) =>
      prevFolders.map((folder) => ({
        ...folder,
        notes: folder.notes.map((n) =>
          n.id === updatedNote.id ? updatedNote : n,
        ),
      })),
    );

    // Persist ALL notes (root + folder notes)
    const allNotes = [
      ...notes.filter((n) => n.id !== updatedNote.id), // root notes except this one
      updatedNote,
      // add all folder notes:
      ...folders.flatMap((f) => f.notes.filter((n) => n.id !== updatedNote.id)),
    ];
    saveDemoNotes(allNotes);

    setActiveNote(updatedNote);
    setIsDirty(false);
  }

  useEffect(() => {
    setNotes(loadDemoNotes());
    setFolders(loadDemoFolders());
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
      const updatedNote: Note = {
        ...activeNote,
        title: title.trim() === "" ? "Untitled Note" : title,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      };
      updateNote(updatedNote);

      // persist all notes
      saveDemoNotes([
        ...notes.filter((n) => n.id !== updatedNote.id),
        updatedNote,
      ]);

      setActiveNote(updatedNote);
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
      const updatedNote: Note = {
        ...activeNote,
        title: title.trim() === "" ? "Untitled Note" : title,
        content: editorRef.current?.innerHTML ?? activeNote.content,
      };
      updateNote(updatedNote);
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

  const createNewFolder = () => {
    const newFolder: Folder = {
      id: uuidv4(),
      title: "Untitled Note",
      studentId: "demo",
      notes: [],
      folders: [],
      parentId: "c40f65e3-8f3b-4026-bc80-8e966671167f"
    };
    setFolders((prev) => [...prev, newFolder]);
    saveDemoFolders([...folders, newFolder]);
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
    // Remove from root notes
    setNotes((prev) => prev.filter((note) => note.id !== id));

    // Remove from folder notes
    setFolders((prevFolders) =>
      prevFolders.map((folder) => ({
        ...folder,
        notes: folder.notes.filter((note) => note.id !== id),
      })),
    );

    // Persist all notes
    const allNotes = [
      ...notes.filter((n) => n.id !== id),
      ...folders.flatMap((f) => f.notes.filter((n) => n.id !== id)),
    ];
    saveDemoNotes(allNotes);

    // Clear active note if it was deleted
    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  };

  const moveNoteToFolder = (noteId: string, folderId?: string) => {
    return;
  };

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        onDuplicateNote={duplicateNote}
        folders={folders.filter((f) => !f.parentId)}
        createNewFolder={createNewFolder}
        notes={notes.filter((n) => !n.folderId)}
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
