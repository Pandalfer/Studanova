"use client";

import {Note, Folder, FolderInput} from "@/types";
import { useEffect, useState, useRef, use } from "react";
import {loadNotes, saveNoteToDb, deleteNoteFromDb, saveFolderToDb, loadFolders} from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { nanoid } from "nanoid";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

function collectAllNotes(folders: Folder[]): Note[] {
  const result: Note[] = [];
  for (const folder of folders) {
    result.push(...folder.notes);
    if (folder.folders && folder.folders.length > 0) {
      result.push(...collectAllNotes(folder.folders));
    }
  }
  return result;
}


export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { uuid } = use(params);

  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const pathSegments = pathname.split("/");
  const noteIdFromPath = pathSegments[3]; // /uuid/notes/noteId

  useEffect(() => setMounted(true), []);

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || !activeNote) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!activeNote) return;

      const updatedNote: Note = {
        ...activeNote,
        title: title.trim() || "Untitled Note",
        content: editorRef.current?.innerHTML ?? activeNote.content,
      };

      try {
        const savedNote = await saveNoteToDb(updatedNote, uuid);
        if (savedNote) {
          setNotes((prev) =>
            prev.map((n) => (n.id === savedNote.id ? savedNote : n)),
          );
          setActiveNote(savedNote);
          setIsDirty(false);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 2000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, editorRef.current?.innerHTML, isDirty, activeNote, uuid]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Load notes
  useEffect(() => {
    (async () => {
      setLoadingNotes(true);
      const loadedNotes = await loadNotes(uuid);
      const loadedFolders = await loadFolders(uuid);


      const allNotes = [
        ...loadedNotes,
        ...collectAllNotes(loadedFolders)
      ];

      const match = allNotes.find((n) => n.id === noteIdFromPath);

      if (!match) {
        router.push(`/${uuid}/notes`);
        return;
      }

      setNotes(loadedNotes);
      setFolders(loadedFolders);
      setActiveNote(match);

      if (match.title === "Untitled Note") {
        setTitle("");
      } else {
        setTitle(match.title);
      }

      if (editorRef.current) editorRef.current.innerHTML = match.content;
      setLoadingNotes(false);
    })();
  }, [uuid, noteIdFromPath]);

  const selectNote = async (note: Note) => {
    if (note.id === activeNote?.id) return;

    if (isDirty && activeNote) {
      const updatedNote: Note = {
        ...activeNote,
        title: title.trim() || "Untitled Note",
        content: editorRef.current?.innerHTML ?? activeNote.content,
      };
      try {
        const savedNote = await saveNoteToDb(updatedNote, uuid);
        if (savedNote)
          setNotes((prev) =>
            prev.map((n) => (n.id === savedNote.id ? savedNote : n)),
          );
      } catch (err) {
        console.error("Failed to save before switching note:", err);
      }
    }

    // Temporarily clear activeNote so editor disappears
    setActiveNote(null);
    setTitle("");

    // Navigate to new note
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
        if (activeNote?.id === savedNote.id) {
          setActiveNote(savedNote);
          setTitle(savedNote.title);
        }
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

    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
    setTitle(newNote.title);
    if (editorRef.current) editorRef.current.innerHTML = "";

    setIsDirty(false);
    router.push(`/${uuid}/notes/${newNote.id}`);

    saveNoteToDb(newNote, uuid).catch(console.error);
  };

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
    setNotes((prev) => prev.filter((n) => n.id !== id));

    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      if (editorRef.current) editorRef.current.innerHTML = "";

      router.push(`/${uuid}/notes`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        notes={notes}
        createNewFolder={createNewFolder}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        onDuplicateNote={duplicateNote}
        onDeleteNote={deleteNote}
        onRenameNote={renameNote}
        activeNoteId={activeNote?.id}
        loading={loadingNotes}
        folders={folders}
      />

      <div className="flex-1 h-screen">
        <div className="flex-1 h-screen">
          {loadingNotes ? (
            <NotesEditor
              note={{
                id: "",
                title: "",
                content: "",
                createdAt: Date.now(),
              }}
              title=""
              setTitle={() => {}}
              editorRef={editorRef}
              loading={true}
            />
          ) : activeNote ? (
            <NotesEditor
              note={activeNote}
              title={title}
              setTitle={setTitle}
              editorRef={editorRef}
              onDirtyChange={setIsDirty}
              loading={false}
            />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
