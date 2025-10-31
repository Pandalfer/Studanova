"use client";

import { Folder, FolderInput, Note } from "@/lib/types";
import { useEffect, useState, use } from "react";
import NotesEmptyState from "@/components/Notes/empty-state";
import {
  loadNotes,
  saveNoteToDb,
  deleteNoteFromDb,
  loadFolders,
  saveFolderToDb,
} from "@/lib/note-storage";
import { NotesSidebar } from "@/components/Notes/Sidebar/notes-sidebar";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteNoteFromFolders, duplicateFolder,
  duplicateNote,
  moveFolder,
  moveNote,
  renameNoteInFolders,
  sortFoldersRecursively,
} from "@/lib/notes/note-and-folder-actions";

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export default function NotesPage({ params }: PageProps) {
  const router = useRouter();
  const { uuid } = use(params);
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  useEffect(() => {
    setMounted(true);
    document.body.style.cursor = "default";
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingNotes(true);
      const loadedNotes = await loadNotes(uuid);
      const loadedFolders = await loadFolders(uuid);
      setNotes(loadedNotes);
      setFolders(loadedFolders);
      setLoadingNotes(false);
    })();
  }, [uuid]);

  const onDuplicateNote = async (note: Note) => {
    await duplicateNote(note, uuid, setFolders, setNotes);
  };

  const onDuplicateFolder = async (folder: Folder): Promise<void> => {
    await duplicateFolder(folder, uuid, setFolders);
  }

  const selectNote = async (note: Note) => {
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
        if (!savedNote.folderId) {
          setNotes((prev) =>
            prev
              .map((n) => (n.id === savedNote.id ? savedNote : n))
              .sort((a, b) => a.title.localeCompare(b.title)),
          );
        } else {
          setFolders((prev) => renameNoteInFolders(prev, savedNote));
        }
      }
      toast.success("Note renamed successfully");
    } catch {
      toast.error("Failed to rename note");
    }
  };

  const createNewNote = async () => {
    document.body.style.cursor = "wait";
    const newNote: Note = {
      id: nanoid(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
    };

    // Save to DB first
    await saveNoteToDb(newNote, uuid);
    router.push(`/${uuid}/notes/${newNote.id}`);
  };

  const createNewFolder = async () => {
    const folderInput: FolderInput = { title: "Untitled Folder" };
    try {
      const savedFolder = await saveFolderToDb(folderInput, uuid);
      setFolders((prev) => sortFoldersRecursively([...prev, savedFolder]));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteNoteFromDb(id);
    } catch (err) {
      console.error("Failed to delete note from DB:", err);
    }

    const noteToDelete = notes.find((n) => n.id === id);
    if (noteToDelete) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return;
    }

    setFolders((prev) => deleteNoteFromFolders(prev, id));
  };

  const moveNoteToFolder = (noteId: string, folderId?: string) => {
    moveNote(setNotes, setFolders, folders, noteId, uuid, folderId);
  };

  const moveFolderToFolder = (folderId: string, parentId?: string) => {
    moveFolder(folderId, setFolders, folders, uuid, parentId);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <NotesSidebar
        moveNoteToFolder={moveNoteToFolder}
        moveFolderToFolder={moveFolderToFolder}
        notes={notes}
        folders={folders}
        onSelectNote={selectNote}
        createNewNote={createNewNote}
        createNewFolder={createNewFolder}
        onDeleteNote={deleteNote}
        onDuplicateNote={onDuplicateNote}
        onDuplicateFolder={onDuplicateFolder}
        onRenameNote={renameNote}
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
