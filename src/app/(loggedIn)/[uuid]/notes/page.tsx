"use client";

import {Folder, FolderInput, Note} from "@/lib/types";
import { useEffect, useState, useRef, use } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import {loadNotes, saveNoteToDb, deleteNoteFromDb, loadFolders, saveFolderToDb} from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
  const { uuid } = use(params);
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingNotes(true)
      const loadedNotes = await loadNotes(uuid);
      const loadedFolders = await loadFolders(uuid);
      setNotes(loadedNotes);
      setFolders(loadedFolders);
      setLoadingNotes(false)
    })();
  }, [uuid]);

  const duplicateNote = async (note: Note) => {
    const newNote: Note = {
      id: nanoid(),
      title: note.title + " (Copy)",
      content: note.content,
      createdAt: Date.now(),
    };

    setNotes((prev) => [...prev, newNote]);
    saveNoteToDb(newNote, uuid).catch(console.error);
  };

  const selectNote = async (note: Note) => {
    setActiveNote(note);
    router.push(`/${uuid}/notes/${note.id}`);
  };

  const renameNote = async (note: Note, newTitle: string) => {
    const updatedNote: Note = {
      ...note,
      title: newTitle.trim() || "Untitled Note",
    };
    try {
      const savedNote = await saveNoteToDb(updatedNote, uuid);
      if (savedNote) {
        setNotes((prev) =>
          prev.map((n) => (n.id === savedNote.id ? savedNote : n)),
        );
      }
      toast.success("Note renamed successfully");
    } catch {
      toast.error("Failed to rename note");
    }
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


  const createNewFolder = async () => {
    const folderInput: FolderInput = { title: "Untitled Folder" };
    try {
      const savedFolder = await saveFolderToDb(folderInput, uuid);
      setFolders((prev) => [...prev, savedFolder]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id: string) => {
    await deleteNoteFromDb(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      if (editorRef.current) editorRef.current.innerHTML = "";
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        notes={notes}
        folders={folders}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        createNewFolder={createNewFolder}
        onDeleteNote={deleteNote}
        onDuplicateNote={duplicateNote}
        onRenameNote={renameNote}
        activeNoteId={activeNote?.id}
        loading={loadingNotes}
      />
      <div className="flex-1 h-screen">
        <NotesEmptyState
          message={"Select or create a new note to get started"}
        />
      </div>
    </div>
  );
}
