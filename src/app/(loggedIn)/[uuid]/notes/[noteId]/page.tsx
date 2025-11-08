"use client";

import { Note, Folder } from "@/lib/types";
import { useEffect, useState, useRef, use } from "react";
import { loadNotes, saveNoteToDb, loadFolders } from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import NotesEditor from "@/components/Notes/notes-editor";
import { useRouter, usePathname } from "next/navigation";
import {
  collectAllNotes,
  createNewFolder,
  createNewNote,
  deleteNote,
  duplicateFolder,
  duplicateNote,
  moveFolder,
  moveNote,
  renameFolder,
  renameNote,
  renameNoteInFolders,
  selectNote,
} from "@/lib/notes/note-and-folder-actions";

interface PageProps {
  params: Promise<{ uuid: string }>;
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

  useEffect(() => {
    setMounted(true);
    document.body.style.cursor = "default";
  }, []);

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
          if (!savedNote.folderId) {
            // Root-level note
            setNotes((prev) =>
              prev.map((n) => (n.id === savedNote.id ? savedNote : n)),
            );
          } else {
            setFolders((prev) => renameNoteInFolders(prev, savedNote));
          }

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

      const allNotes = [...loadedNotes, ...collectAllNotes(loadedFolders)];

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

  const moveNoteToFolder = (noteId: string, folderId?: string) => {
    moveNote(setNotes, setFolders, folders, noteId, uuid, folderId);
  };

  const onSelectNote = async (note: Note) => {
    await selectNote(
      note,
      uuid,
      router,
      activeNote,
      isDirty,
      title,
      editorRef,
      setActiveNote,
      setTitle,
      setNotes,
    );
  };

  const onRenameNote = async (note: Note, newTitle: string) => {
    await renameNote(
      note,
      newTitle,
      uuid,
      setNotes,
      setFolders,
      activeNote,
      setActiveNote,
      setTitle,
    );
  };

  const onRenameFolder = async (folder: Folder, newTitle: string) => {
    await renameFolder(folder, newTitle, uuid, setFolders);
  };

  const onCreateNewNote = async () => {
    await createNewNote(
      uuid,
      router,
      notes,
      setNotes,
      setActiveNote,
      setTitle,
      editorRef,
      setIsDirty,
    );
  };

  const onDuplicateNote = async (note: Note) => {
    await duplicateNote(note, uuid, setFolders, setNotes);
  };

  const onCreateNewFolder = async () => {
    await createNewFolder(uuid, setFolders);
  };

  const onDeleteNote = async (id: string) => {
    await deleteNote(
      id,
      notes,
      setNotes,
      setFolders,
      editorRef,
      setTitle,
      router,
      setActiveNote,
      activeNote,
      uuid,
    );
  };

  const moveFolderToFolder = (folderId: string, parentId?: string) => {
    moveFolder(folderId, setFolders, folders, uuid, parentId);
  };

  const onDuplicateFolder = async (folder: Folder): Promise<void> => {
    await duplicateFolder(folder, uuid, setFolders);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        moveFolderToFolder={moveFolderToFolder}
        onDuplicateFolder={onDuplicateFolder}
        notes={notes}
        createNewFolder={onCreateNewFolder}
        onSelectNote={onSelectNote}
        createNewNote={onCreateNewNote}
        onDuplicateNote={onDuplicateNote}
        onDeleteNote={onDeleteNote}
        onRenameNote={onRenameNote}
        onRenameFolder={onRenameFolder}
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
